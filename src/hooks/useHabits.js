import { useState, useEffect } from 'react'
import {
  doc, getDoc, setDoc, collection, query, where, getDocs, orderBy
} from 'firebase/firestore'
import { db } from '../firebase/config'

// Hábitos definidos — en el futuro serán configurables
export const HABITS_CONFIG = [
  { id: 'gimnasio',      label: 'Gimnasio',           emoji: '🏋️', frequency: 'weekly',  targetDays: 3 },
  { id: 'baloncesto',    label: 'Baloncesto',          emoji: '🏀', frequency: 'weekly',  targetDays: 1 },
  { id: 'dormir',        label: 'Dormir antes de las 00:00', emoji: '🌙', frequency: 'daily', targetDays: 7 },
  { id: 'contenido',     label: 'Publicar @lmzcards',  emoji: '🃏', frequency: 'weekly',  targetDays: 3 },
  { id: 'habito_mental', label: 'Hábito mental',       emoji: '🧘', frequency: 'daily',  targetDays: 7 },
  { id: 'alimentacion',  label: 'Alimentación consciente', emoji: '🥗', frequency: 'daily', targetDays: 7 },
]

function todayKey() {
  return new Date().toISOString().slice(0, 10) // "YYYY-MM-DD"
}

function weekStart() {
  const d = new Date()
  const day = d.getDay() === 0 ? 6 : d.getDay() - 1 // lunes = 0
  d.setDate(d.getDate() - day)
  return d.toISOString().slice(0, 10)
}

export function useHabits(userId) {
  const [todayChecks, setTodayChecks] = useState({})
  const [weekData, setWeekData] = useState([]) // últimos 7 días
  const [streaks, setStreaks] = useState({})
  const [loading, setLoading] = useState(true)

  const today = todayKey()

  useEffect(() => {
    if (!userId) return
    loadData()
  }, [userId])

  async function loadData() {
    setLoading(true)
    try {
      // Cargar el día de hoy
      const todayRef = doc(db, 'users', userId, 'habits', today)
      const todaySnap = await getDoc(todayRef)
      if (todaySnap.exists()) {
        setTodayChecks(todaySnap.data())
      } else {
        setTodayChecks({})
      }

      // Cargar últimas 4 semanas para rachas y vista semanal
      const habitsRef = collection(db, 'users', userId, 'habits')
      const since = new Date()
      since.setDate(since.getDate() - 28)
      const sinceStr = since.toISOString().slice(0, 10)

      const q = query(habitsRef, where('__name__', '>=', sinceStr), orderBy('__name__', 'desc'))
      const snap = await getDocs(q)

      const history = []
      snap.forEach(d => history.push({ date: d.id, ...d.data() }))
      setWeekData(history)

      // Calcular rachas para hábitos diarios
      const newStreaks = {}
      for (const h of HABITS_CONFIG) {
        if (h.frequency === 'daily') {
          newStreaks[h.id] = calcStreak(h.id, history)
        }
      }
      setStreaks(newStreaks)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  function calcStreak(habitId, history) {
    let streak = 0
    const today = new Date()
    for (let i = 0; i < 60; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      const entry = history.find(h => h.date === key)
      if (entry && entry[habitId]) {
        streak++
      } else {
        break
      }
    }
    return streak
  }

  async function toggle(habitId) {
    const newValue = !todayChecks[habitId]
    const newChecks = { ...todayChecks, [habitId]: newValue }
    setTodayChecks(newChecks)

    const todayRef = doc(db, 'users', userId, 'habits', today)
    await setDoc(todayRef, newChecks, { merge: true })

    // Recalcular racha para hábitos diarios
    const habit = HABITS_CONFIG.find(h => h.id === habitId)
    if (habit?.frequency === 'daily') {
      // Re-cargar data para rachas actualizadas
      loadData()
    }
  }

  return { todayChecks, weekData, streaks, loading, toggle, today }
}
