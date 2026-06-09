import { useState } from 'react'
import { useLogs, CATEGORIES, isLogged } from '../hooks/useLogs'
import HabitCard from './HabitCard'
import LogModal from './LogModal'
import TopBar from './TopBar'

const DAYS_ES = ['L','M','X','J','V','S','D']

function getLast7() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

function dayLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return DAYS_ES[d.getDay() === 0 ? 6 : d.getDay() - 1]
}

export default function HabitsScreen({ user, onBack }) {
  const { todayLogs, history, loading, today, saveLog, getStreak } = useLogs(user.uid)
  const [openModal, setOpenModal] = useState(null)

  const loggedCount = CATEGORIES.filter(c => isLogged(todayLogs[c.id])).length
  const totalCount  = CATEGORIES.length
  const pct = Math.round((loggedCount / totalCount) * 100)
  const last7 = getLast7()

  function dayPct(dateStr) {
    const entry = dateStr === today ? todayLogs : (history.find(h => h.date === dateStr) || {})
    const done = CATEGORIES.filter(c => isLogged(entry[c.id])).length
    return Math.round((done / totalCount) * 100)
  }

  if (loading) return (
    <div style={{ minHeight: '100dvh', background: '#f2f2f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#ccc', fontSize: 13 }}>Cargando...</span>
    </div>
  )

  return (
    <div className="page" style={{ minHeight: '100dvh', background: '#f2f2f0' }}>
      <TopBar title="Hábitos" onBack={onBack} />

      <div style={{ padding: '20px 16px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Progress card */}
        <div style={{ background: '#fff', border: '0.5px solid #e8e8e6', borderRadius: 18, padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontSize: 13, color: '#aaa', margin: 0 }}>Hoy</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: 0, letterSpacing: '-0.5px' }}>
              {loggedCount}<span style={{ fontSize: 14, color: '#ccc', fontWeight: 400 }}>/{totalCount}</span>
            </p>
          </div>
          <div style={{ height: 5, background: '#f0f0ee', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? '#0a8a6e' : '#111', borderRadius: 3, transition: 'width 0.5s ease' }} />
          </div>
          {pct === 100 && <p style={{ fontSize: 12, color: '#0a8a6e', margin: '8px 0 0', textAlign: 'center' }}>✓ Todo logueado hoy</p>}
        </div>

        {/* Week view */}
        <div style={{ background: '#fff', border: '0.5px solid #e8e8e6', borderRadius: 18, padding: '16px 20px' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 14px' }}>Esta semana</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 56 }}>
            {last7.map(date => {
              const p = dayPct(date)
              const isToday = date === today
              return (
                <div key={date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{
                    width: '100%', borderRadius: '3px 3px 0 0',
                    height: `${Math.max(p, 5)}%`, minHeight: p > 0 ? 4 : 2,
                    background: isToday ? '#111' : p > 0 ? '#d0d0ce' : '#f0f0ee',
                    transition: 'height 0.3s ease',
                  }} />
                  <span style={{ fontSize: 10, color: isToday ? '#111' : '#ccc', fontWeight: isToday ? 600 : 400 }}>
                    {dayLabel(date)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Habit list */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px', paddingLeft: 4 }}>
            Log del día
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {CATEGORIES.map(cat => (
              <HabitCard
                key={cat.id}
                categoryId={cat.id}
                logData={todayLogs[cat.id]}
                streak={getStreak(cat.id)}
                onOpen={() => setOpenModal(cat.id)}
              />
            ))}
          </div>
        </div>

      </div>

      {openModal && (
        <LogModal
          categoryId={openModal}
          existingData={todayLogs[openModal]}
          onSave={saveLog}
          onClose={() => setOpenModal(null)}
        />
      )}
    </div>
  )
}
