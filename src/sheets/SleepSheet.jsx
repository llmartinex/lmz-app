import { useState, useEffect, useMemo } from 'react'
import { useLogs, isLogged } from '../hooks/useLogs'
import LogModal from '../components/LogModal'
import TopBar from '../components/TopBar'

const MONTHS_ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
function shortDate(str) { const d = new Date(str+'T00:00:00'); return `${d.getDate()} ${MONTHS_ES[d.getMonth()]}` }

function BarChart({ data, height = 80 }) {
  const maxVal = Math.max(...data.map(d => d.val || 0), 9)
  const today  = new Date().toISOString().slice(0, 10)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height }}>
      {data.map((d, i) => {
        const pct = (d.val || 0) / maxVal * 100
        const isToday = d.date === today
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 5, height: '100%' }}>
            {d.val > 0 && <span style={{ fontSize: 9, color: '#aaa' }}>{d.val}h</span>}
            <div style={{ width: '100%', borderRadius: '3px 3px 0 0', background: isToday ? '#111' : d.val >= 7 ? '#0a8a6e' : d.val > 0 ? '#f59e0b' : '#ebebea', height: `${Math.max(pct, d.val > 0 ? 5 : 2)}%`, transition: 'height 0.3s' }} />
            <span style={{ fontSize: 9, color: isToday ? '#111' : '#ccc', fontWeight: isToday ? 700 : 400 }}>{shortDate(d.date)}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function SleepSheet({ user, onBack }) {
  const { todayLogs, history, loading, today, saveLog, getStreak } = useLogs(user.uid)
  const [showModal, setShowModal] = useState(false)

  const last14 = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (13 - i))
      const date = d.toISOString().slice(0, 10)
      const entry = date === today ? todayLogs : (history.find(h => h.date === date) || {})
      const val = isLogged(entry.dormir) ? (entry.dormir?.hours || null) : null
      return { date, val }
    })
  }, [todayLogs, history])

  const entries = last14.filter(d => d.val)
  const avg = entries.length ? (entries.reduce((a, d) => a + d.val, 0) / entries.length).toFixed(1) : null
  const streak = getStreak('dormir')
  const todayLog = todayLogs.dormir

  if (loading) return <div style={{ minHeight: '100dvh', background: '#f2f2f0' }} />

  return (
    <div className="page" style={{ minHeight: '100dvh', background: '#f2f2f0' }}>
      <TopBar title="🌙 Sueño" onBack={onBack} />

      <div style={{ padding: '20px 16px 48px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <div style={{ background: '#fff', border: '0.5px solid #e8e8e6', borderRadius: 16, padding: '14px 14px 12px' }}>
            <p style={{ fontSize: 10, color: '#bbb', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Promedio</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: avg && avg < 7 ? '#f59e0b' : '#111', margin: 0, letterSpacing: '-0.5px' }}>{avg ?? '—'}<span style={{ fontSize: 11, color: '#ccc', fontWeight: 400 }}>h</span></p>
          </div>
          <div style={{ background: '#fff', border: '0.5px solid #e8e8e6', borderRadius: 16, padding: '14px 14px 12px' }}>
            <p style={{ fontSize: 10, color: '#bbb', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Racha</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: 0, letterSpacing: '-0.5px' }}>{streak}<span style={{ fontSize: 11, color: '#ccc', fontWeight: 400 }}>d</span></p>
          </div>
          <div style={{ background: '#fff', border: '0.5px solid #e8e8e6', borderRadius: 16, padding: '14px 14px 12px' }}>
            <p style={{ fontSize: 10, color: '#bbb', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hoy</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: todayLog?.hours ? '#0a8a6e' : '#ccc', margin: 0, letterSpacing: '-0.5px' }}>{todayLog?.hours ?? '—'}<span style={{ fontSize: 11, color: '#ccc', fontWeight: 400 }}>h</span></p>
          </div>
        </div>

        {/* Chart */}
        <div style={{ background: '#fff', border: '0.5px solid #e8e8e6', borderRadius: 16, padding: '16px 16px 14px' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 14px' }}>Últimas 2 semanas</p>
          <BarChart data={last14} />
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            {[{ color: '#0a8a6e', label: '≥7h' }, { color: '#f59e0b', label: '<7h' }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
                <span style={{ fontSize: 10, color: '#bbb' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Log hoy */}
        <button onClick={() => setShowModal(true)} style={{
          background: '#fff', border: '0.5px solid #e8e8e6', borderRadius: 16,
          padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: isLogged(todayLog) ? '#0a8a6e' : '#e0e0de' }} />
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: 0 }}>Log de hoy</p>
              {todayLog?.hours && <p style={{ fontSize: 12, color: '#bbb', margin: '2px 0 0' }}>{todayLog.hours}h · ★{todayLog.quality ?? '—'} · {todayLog.notes || 'Sin notas'}</p>}
              {!isLogged(todayLog) && <p style={{ fontSize: 12, color: '#ccc', margin: '2px 0 0' }}>Sin loguear hoy</p>}
            </div>
          </div>
          <span style={{ fontSize: 12, padding: '6px 12px', borderRadius: 20, background: isLogged(todayLog) ? '#e8f5f0' : '#f5f5f3', color: isLogged(todayLog) ? '#0a8a6e' : '#bbb', fontWeight: 500 }}>
            {isLogged(todayLog) ? 'Editar' : 'Log'}
          </span>
        </button>

        {/* Recent entries */}
        {entries.length > 0 && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '4px 0 10px', paddingLeft: 4 }}>Historial</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {last14.filter(d => d.val && d.date !== today).slice(-7).reverse().map(d => {
                const entry = history.find(h => h.date === d.date)
                return (
                  <div key={d.date} style={{ background: '#fff', border: '0.5px solid #e8e8e6', borderRadius: 12, padding: '11px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: 13, color: '#555', margin: 0 }}>{shortDate(d.date)}</p>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      {entry?.dormir?.quality && <span style={{ fontSize: 12, color: '#bbb' }}>★{entry.dormir.quality}</span>}
                      <span style={{ fontSize: 13, fontWeight: 600, color: d.val >= 7 ? '#0a8a6e' : '#f59e0b' }}>{d.val}h</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <LogModal categoryId="dormir" existingData={todayLogs.dormir} onSave={saveLog} onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}
