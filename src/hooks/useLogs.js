import { useState, useEffect } from 'react'
import {
  doc, getDoc, setDoc, collection, query, where, getDocs, orderBy
} from 'firebase/firestore'
import { db } from '../firebase/config'

// Configuración de categorías y sus campos
export const CATEGORIES = [
  {
    id: 'dormir',
    label: 'Sueño',
    emoji: '🌙',
    color: '#6366f1',
    fields: [
      { key: 'hours',   label: 'Horas dormidas',     type: 'number', placeholder: '7.5', step: 0.5, min: 0, max: 24 },
      { key: 'quality', label: 'Calidad del sueño',   type: 'rating', max: 5 },
      { key: 'notes',   label: 'Notas',                type: 'textarea', placeholder: 'ej: me costó dormirme, me desperté a las 3...' },
    ],
  },
  {
    id: 'gimnasio',
    label: 'Gimnasio',
    emoji: '🏋️',
    color: '#f59e0b',
    fields: [
      { key: 'focus',    label: '¿Qué entrené?',  type: 'text',   placeholder: 'ej: pecho, pierna, full body...' },
      { key: 'duration', label: 'Duración (min)',  type: 'number', placeholder: '60', min: 0, max: 300 },
      { key: 'notes',    label: 'Notas',           type: 'textarea', placeholder: 'ej: PR en press banca, peso usado...' },
    ],
  },
  {
    id: 'baloncesto',
    label: 'Baloncesto',
    emoji: '🏀',
    color: '#f97316',
    fields: [
      { key: 'duration', label: 'Duración (min)',  type: 'number', placeholder: '90', min: 0, max: 300 },
      { key: 'notes',    label: 'Notas',           type: 'textarea', placeholder: 'ej: partido 5v5, tiros libres...' },
    ],
  },
  {
    id: 'alimentacion',
    label: 'Alimentación',
    emoji: '🥗',
    color: '#22c55e',
    fields: [
      { key: 'quality', label: 'Calidad general', type: 'rating', max: 5 },
      { key: 'notes',   label: '¿Qué comiste?',   type: 'textarea', placeholder: 'ej: desayuno avena, comida pollo y arroz...' },
    ],
  },
  {
    id: 'habito_mental',
    label: 'Hábito mental',
    emoji: '🧘',
    color: '#a78bfa',
    fields: [
      { key: 'type',     label: '¿Qué hiciste?',   type: 'text',   placeholder: 'ej: meditación, lectura, journaling...' },
      { key: 'duration', label: 'Duración (min)',   type: 'number', placeholder: '15', min: 0, max: 180 },
      { key: 'notes',    label: 'Notas',            type: 'textarea', placeholder: '...' },
    ],
  },
  {
    id: 'contenido',
    label: 'Contenido @lmzcards',
    emoji: '🃏',
    color: '#00d4a8',
    fields: [
      { key: 'platform', label: 'Plataforma',      type: 'select', options: ['Instagram', 'TikTok', 'Ambas', 'Ninguna'] },
      { key: 'type',     label: 'Tipo de contenido', type: 'text', placeholder: 'ej: tutorial, entretenimiento, unboxing...' },
      { key: 'notes',    label: 'Notas',            type: 'textarea', placeholder: 'ej: rendimiento, ideas para el próximo...' },
    ],
  },
]

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function isLogged(entry) {
  if (!entry) return false
  if (typeof entry === 'boolean') return entry // backward compat
  return entry.logged === true
}

export function useLogs(userId) {
  const [todayLogs, setTodayLogs]  = useState({})
  const [history, setHistory]      = useState([]) // últimas 8 semanas
  const [loading, setLoading]      = useState(true)

  const today = todayKey()

  useEffect(() => {
    if (!userId) return
    loadData()
  }, [userId])

  async function loadData() {
    setLoading(true)
    try {
      const todayRef  = doc(db, 'users', userId, 'habits', today)
      const todaySnap = await getDoc(todayRef)
      setTodayLogs(todaySnap.exists() ? todaySnap.data() : {})

      const habitsRef = collection(db, 'users', userId, 'habits')
      const since     = new Date()
      since.setDate(since.getDate() - 56) // 8 semanas
      const sinceStr  = since.toISOString().slice(0, 10)

      const q    = query(habitsRef, where('__name__', '>=', sinceStr), orderBy('__name__', 'desc'))
      const snap = await getDocs(q)

      const hist = []
      snap.forEach(d => hist.push({ date: d.id, ...d.data() }))
      setHistory(hist)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  async function saveLog(categoryId, data) {
    const payload    = { ...data, logged: true }
    const newLogs    = { ...todayLogs, [categoryId]: payload }
    setTodayLogs(newLogs)

    const todayRef = doc(db, 'users', userId, 'habits', today)
    await setDoc(todayRef, newLogs, { merge: true })
    await loadData()
  }

  async function clearLog(categoryId) {
    const newLogs = { ...todayLogs }
    delete newLogs[categoryId]
    setTodayLogs(newLogs)
    const todayRef = doc(db, 'users', userId, 'habits', today)
    await setDoc(todayRef, newLogs)
  }

  // Streak para una categoría
  function getStreak(categoryId) {
    let streak = 0
    const now  = new Date()
    for (let i = 0; i < 60; i++) {
      const d   = new Date(now)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      if (key === today) {
        // hoy: usar estado local
        if (isLogged(todayLogs[categoryId])) { streak++; continue }
        else break
      }
      const entry = history.find(h => h.date === key)
      if (entry && isLogged(entry[categoryId])) streak++
      else break
    }
    return streak
  }

  // Datos de las últimas N semanas por categoría para gráficas
  function getChartData(categoryId, days = 30) {
    const result = []
    for (let i = days - 1; i >= 0; i--) {
      const d    = new Date()
      d.setDate(d.getDate() - i)
      const key  = d.toISOString().slice(0, 10)
      const entry = key === today
        ? todayLogs
        : (history.find(h => h.date === key) || {})
      result.push({ date: key, ...( entry[categoryId] || {} ), logged: isLogged(entry[categoryId]) })
    }
    return result
  }

  return { todayLogs, history, loading, today, saveLog, clearLog, getStreak, getChartData }
}
