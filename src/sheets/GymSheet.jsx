import { useState, useMemo } from 'react'
import { useLogs, isLogged } from '../hooks/useLogs'
import LogModal from '../components/LogModal'
import TopBar from '../components/TopBar'

const MONTHS_ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
function shortDate(str) { const d = new Date(str+'T00:00:00'); return `${d.getDate()} ${MONTHS_ES[d.getMonth()]}` }

function getWeekStart() {
  const d = new Date(), day = d.getDay() === 0 ? 6 : d.getDay() - 1
  d.setDate(d.getDate() - day); return d.toISOString().slice(0, 10)
}

export default function GymSheet({ user, onBack }) {
  const { todayLogs, history, loading, today, saveLog, getStreak } = useLogs(user.uid)
  const [showModal, setShowModal] = useState(false)
  const weekStart = getWeekStart()

  const sessions = useMemo(() => {
    const hist = history.filter(h => isLogged(h.gimnasio)).map(h => ({ date: h.date, ...h.gimnasio }))
    if (isLogged(todayLogs.gimnasio)) hist.unshift({ date: today, ...todayLogs.gimnasio })
    return hist.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20)
  }, [history, todayLogs])

  const weekSessions = sessions.filter(s => s.date >= weekStart).length
  const streak = getStreak('gimnasio')
  const totalSessions = sessions.length

  if (loading) return <div style={{ minHeight: '100dvh', background: '#f2f2f0' }} />

  return (
    <div className="page" style={{ minHeight: '100dvh', background: '#f2f2f0' }}>
      <TopBar title="🏋️ Gimnasio" onBack={onBack} />

      <div style={{ padding: '20px 16px 48px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <div style={{ background: '#fff', border: '0.5px solid #e8e8e6', borderRadius: 16, padding: '14px 14px 12px' }}>
            <p style={{ fontSize: 10, color: '#bbb', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Esta semana</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: weekSessions >= 3 ? '#0a8a6e' : '#111', margin: 0 }}>{weekSessions}<span style={{ fontSize: 11, color: '#ccc', fontWeight: 400 }}>/3</span></p>
          </div>
          <div style={{ background: '#fff', border: '0.5px solid #e8e8e6', borderRadius: 16, padding: '14px 14px 12px' }}>
            <p style={{ fontSize: 10, color: '#bbb', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Racha</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: 0 }}>{streak}<span style={{ fontSize: 11, color: '#ccc', fontWeight: 400 }}>d</span></p>
          </div>
          <div style={{ background: '#fff', border: '0.5px solid #e8e8e6', borderRadius: 16, padding: '14px 14px 12px' }}>
            <p style={{ fontSize: 10, color: '#bbb', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: 0 }}>{totalSessions}</p>
          </div>
        </div>

        <button onClick={() => setShowModal(true)} style={{
          background: isLogged(todayLogs.gimnasio) ? '#111' : '#fff',
          border: `0.5px solid ${isLogged(todayLogs.gimnasio) ? '#111' : '#e8e8e6'}`,
          borderRadius: 16, padding: '16px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', cursor: 'pointer', width: '100%',
        }}>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: isLogged(todayLogs.gimnasio) ? '#fff' : '#111', margin: 0 }}>
              {isLogged(todayLogs.gimnasio) ? '✓ Sesión de hoy logueada' : 'Loguear sesión de hoy'}
            </p>
            {todayLogs.gimnasio?.focus && (
              <p style={{ fontSize: 12, color: isLogged(todayLogs.gimnasio) ? '#888' : '#bbb', margin: '3px 0 0' }}>
                {todayLogs.gimnasio.focus}{todayLogs.gimnasio.duration ? ` · ${todayLogs.gimnasio.duration}min` : ''}
              </p>
            )}
          </div>
          <span style={{ fontSize: 20 }}>{isLogged(todayLogs.gimnasio) ? '✏️' : '+'}</span>
        </button>

        {sessions.length > 0 && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '4px 0 10px', paddingLeft: 4 }}>Sesiones recientes</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {sessions.map((s, i) => (
                <div key={i} style={{ background: '#fff', border: '0.5px solid #e8e8e6', borderRadius: 12, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#111', margin: 0 }}>{s.focus || 'Sesión sin descripción'}</p>
                    <p style={{ fontSize: 11, color: '#bbb', margin: '2px 0 0' }}>{shortDate(s.date)}{s.notes ? ` · ${s.notes}` : ''}</p>
                  </div>
                  {s.duration && <span style={{ fontSize: 12, color: '#888', fontWeight: 600, flexShrink: 0 }}>{s.duration}min</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <LogModal categoryId="gimnasio" existingData={todayLogs.gimnasio} onSave={saveLog} onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}
