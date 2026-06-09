import { useState } from 'react'
import { useLogs, CATEGORIES, isLogged } from '../hooks/useLogs'
import HabitCard from './HabitCard'
import LogModal from './LogModal'
import Sidebar from './Sidebar'

const MONTHS_ES   = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
const DAYS_ES_FULL = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']
const DAYS_ES     = ['L','M','X','J','V','S','D']

function todayFormatted() {
  const d = new Date()
  const name = DAYS_ES_FULL[d.getDay()]
  return `${name.charAt(0).toUpperCase() + name.slice(1)} ${d.getDate()} ${MONTHS_ES[d.getMonth()]}`
}

function getLast7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

function dayLabel(dateStr) {
  const d   = new Date(dateStr + 'T00:00:00')
  const idx = d.getDay() === 0 ? 6 : d.getDay() - 1
  return DAYS_ES[idx]
}

function getWeekStart() {
  const d   = new Date()
  const day = d.getDay() === 0 ? 6 : d.getDay() - 1
  d.setDate(d.getDate() - day)
  return d.toISOString().slice(0, 10)
}

function CircleProgress({ pct, done, total }) {
  const r    = 30
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)
  return (
    <div className="relative flex items-center justify-center w-20 h-20">
      <svg width="80" height="80" viewBox="0 0 80 80" className="absolute">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#1e1e1e" strokeWidth="7"/>
        <circle cx="40" cy="40" r={r} fill="none"
          stroke={pct > 0 ? '#00d4a8' : '#2a2a2a'}
          strokeWidth="7"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="relative text-center">
        <div className="text-base font-bold text-white leading-tight">{done}/{total}</div>
      </div>
    </div>
  )
}

export default function Dashboard({ user, onLogout, onNavigate }) {
  const { todayLogs, history, loading, today, saveLog, getStreak, getChartData } = useLogs(user.uid)
  const [openModal, setOpenModal] = useState(null) // categoryId

  const loggedToday = CATEGORIES.filter(c => isLogged(todayLogs[c.id])).length
  const totalCats   = CATEGORIES.length
  const progressPct = Math.round((loggedToday / totalCats) * 100)

  const weekStart     = getWeekStart()
  const last7         = getLast7Days()

  function dayLoggedCount(dateStr) {
    const entry = dateStr === today
      ? todayLogs
      : (history.find(h => h.date === dateStr) || {})
    return CATEGORIES.filter(c => isLogged(entry[c.id])).length
  }

  // Stats de la semana
  const gymThisWeek = history
    .filter(d => d.date >= weekStart && isLogged(d.gimnasio))
    .length + (isLogged(todayLogs.gimnasio) ? 1 : 0)

  const avgSleep = (() => {
    const sleepData = [...history.filter(d => d.date >= weekStart && d.dormir?.hours), 
                       ...(todayLogs.dormir?.hours ? [{ dormir: todayLogs.dormir }] : [])]
    if (!sleepData.length) return null
    const avg = sleepData.reduce((a, d) => a + (d.dormir?.hours || 0), 0) / sleepData.length
    return avg.toFixed(1)
  })()

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#0a0a0a]">
        <span className="text-[#00d4a8] text-2xl animate-pulse">✦</span>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[#0a0a0a] text-white flex">
      <Sidebar user={user} onLogout={onLogout} activePage="habits" onNavigate={onNavigate} />

      <main className="flex-1 md:ml-52 px-4 md:px-8 pt-6 pb-28 md:pb-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
            <p className="text-sm text-zinc-500 mt-0.5">{todayFormatted()}</p>
          </div>
          <button onClick={onLogout} className="md:hidden w-9 h-9 rounded-full overflow-hidden ring-1 ring-[#252525]">
            {user.photoURL
              ? <img src={user.photoURL} className="w-full h-full object-cover" alt="" />
              : <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-sm text-zinc-400">{user.displayName?.[0]}</div>
            }
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-[#111] rounded-2xl border border-[#1e1e1e] p-4 flex flex-col items-center gap-3">
            <CircleProgress pct={progressPct} done={loggedToday} total={totalCats} />
            <div className="text-center">
              <p className="text-xs text-zinc-500">Hoy</p>
              <p className={`text-sm font-semibold mt-0.5 ${progressPct === 100 ? 'text-[#00d4a8]' : 'text-zinc-300'}`}>
                {progressPct === 100 ? '¡Todo!' : `${progressPct}%`}
              </p>
            </div>
          </div>

          <div className="bg-[#111] rounded-2xl border border-[#1e1e1e] p-4 flex flex-col items-center justify-center gap-1">
            <span className="text-2xl leading-none">🏋️</span>
            <p className="text-2xl font-bold text-white tabular-nums">{gymThisWeek}<span className="text-sm text-zinc-500">/3</span></p>
            <p className="text-xs text-zinc-500">gym esta semana</p>
          </div>

          <div className="bg-[#111] rounded-2xl border border-[#1e1e1e] p-4 flex flex-col items-center justify-center gap-1">
            <span className="text-2xl leading-none">🌙</span>
            <p className="text-2xl font-bold text-white tabular-nums">{avgSleep ?? '—'}<span className="text-sm text-zinc-500">h</span></p>
            <p className="text-xs text-zinc-500">sueño esta semana</p>
          </div>
        </div>

        {/* Week bar chart */}
        <div className="bg-[#111] rounded-2xl border border-[#1e1e1e] p-5 mb-5">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Semana</h3>
          <div className="flex items-end gap-2" style={{ height: '72px' }}>
            {last7.map(date => {
              const count    = dayLoggedCount(date)
              const pct      = (count / totalCats) * 100
              const isToday  = date === today
              return (
                <div key={date} className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full">
                  <div className="w-full flex items-end justify-center" style={{ height: '52px' }}>
                    <div
                      className={`w-full rounded-t-sm transition-all duration-500 ${
                        isToday ? 'bg-[#00d4a8]' : pct > 0 ? 'bg-zinc-600' : 'bg-[#1a1a1a]'
                      }`}
                      style={{ height: `${Math.max(pct, 5)}%` }}
                    />
                  </div>
                  <span className={`text-[11px] ${isToday ? 'text-[#00d4a8] font-bold' : 'text-zinc-600'}`}>
                    {dayLabel(date)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Log cards */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Log de hoy</h2>
            <span className="text-xs text-zinc-600">{loggedToday}/{totalCats} completados</span>
          </div>
          <div className="space-y-2">
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

      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0d0d0d]/95 backdrop-blur border-t border-[#1a1a1a] px-2 py-2 flex justify-around">
        {[
          { emoji: '◎', label: 'Hábitos', page: 'habits'  },
          { emoji: '📊', label: 'Stats',   page: 'stats'   },
          { emoji: '💪', label: 'Entrenos', page: null },
          { emoji: '🃏', label: 'Contenido', page: null },
        ].map(item => (
          <button
            key={item.label}
            onClick={() => item.page && onNavigate(item.page)}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors ${
              item.page === 'habits' ? 'text-[#00d4a8]' : 'text-zinc-700'
            }`}
          >
            <span className="text-lg leading-none">{item.emoji}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Log Modal */}
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
