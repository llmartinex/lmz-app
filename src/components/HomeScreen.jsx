import { useMemo } from 'react'
import { CATEGORIES, isLogged } from '../hooks/useLogs'
import { generateRecommendation } from '../lib/anthropic'

const MONTHS_ES    = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
const DAYS_ES_FULL = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']

function getGreeting() {
  const h = new Date().getHours()
  if (h < 13) return 'Buenos días'
  if (h < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

function getWeekStart() {
  const d = new Date(), day = d.getDay() === 0 ? 6 : d.getDay() - 1
  d.setDate(d.getDate() - day); return d.toISOString().slice(0, 10)
}

function Ring({ pct, size = 120 }) {
  const r = 46, circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)
  return (
    <svg width={size} height={size} viewBox="0 0 110 110">
      <circle cx="55" cy="55" r={r} fill="none" stroke="#ebebea" strokeWidth="9"/>
      <circle cx="55" cy="55" r={r} fill="none" stroke="#111" strokeWidth="9"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 55 55)"
        style={{ transition: 'stroke-dashoffset 0.7s ease' }}
      />
    </svg>
  )
}

const HABIT_META = {
  dormir:       { emoji: '🌙', label: 'Sueño'     },
  gimnasio:     { emoji: '🏋️', label: 'Gym'        },
  baloncesto:   { emoji: '🏀', label: 'Basket'     },
  alimentacion: { emoji: '🥗', label: 'Comida'     },
  habito_mental:{ emoji: '🧘', label: 'Mental'     },
  contenido:    { emoji: '🃏', label: 'Contenido'  },
}

export default function HomeScreen({ user, onNavigate, todayLogs, history }) {
  const name = user?.displayName?.split(' ')[0] || 'Lucas'
  const today = new Date().toISOString().slice(0, 10)
  const weekStart = getWeekStart()
  const d = new Date()

  const loggedToday = CATEGORIES.filter(c => isLogged(todayLogs?.[c.id])).length
  const totalCats   = CATEGORIES.length
  const pct = Math.round((loggedToday / totalCats) * 100)

  const thisWeek = (history || []).filter(h => h.date >= weekStart)

  const sleepEntries = thisWeek.filter(h => h.dormir?.hours)
  const sleepAvg = sleepEntries.length
    ? parseFloat((sleepEntries.reduce((a, h) => a + h.dormir.hours, 0) / sleepEntries.length).toFixed(1))
    : null

  const gymCount = thisWeek.filter(h => isLogged(h.gimnasio)).length
    + (isLogged(todayLogs?.gimnasio) ? 1 : 0)

  const foodEntries = thisWeek.filter(h => h.alimentacion?.quality)
  const foodAvg = foodEntries.length
    ? parseFloat((foodEntries.reduce((a, h) => a + h.alimentacion.quality, 0) / foodEntries.length).toFixed(1))
    : null

  const streakMax = useMemo(() => {
    let max = 0, streak = 0
    const sorted = [...(history || [])].sort((a, b) => a.date.localeCompare(b.date))
    for (const entry of sorted) {
      if (CATEGORIES.some(c => isLogged(entry[c.id]))) { streak++; max = Math.max(max, streak) }
      else streak = 0
    }
    return max
  }, [history])

  const rec = useMemo(() => generateRecommendation({ sleepAvg, gymCount, foodAvg, streakMax, loggedToday, totalCats }), [sleepAvg, gymCount, loggedToday])

  return (
    <div className="page" style={{ minHeight: '100dvh', background: '#f2f2f0', paddingBottom: 40 }}>

      {/* Header */}
      <div style={{ padding: '48px 20px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 12, color: '#bbb', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {DAYS_ES_FULL[d.getDay()].charAt(0).toUpperCase() + DAYS_ES_FULL[d.getDay()].slice(1)}, {d.getDate()} {MONTHS_ES[d.getMonth()]}
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111', margin: 0, letterSpacing: '-0.5px' }}>
            {getGreeting()}, {name}
          </h1>
        </div>
        <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: '0.5px solid #e0e0de', flexShrink: 0, marginTop: 4 }}>
          {user?.photoURL
            ? <img src={user.photoURL} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
            : <div style={{ width: '100%', height: '100%', background: '#e8e8e6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#888' }}>{name[0]}</div>
          }
        </div>
      </div>

      {/* Big score */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px 20px 0', gap: 20 }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Ring pct={pct} size={130} />
          <div style={{ position: 'absolute', textAlign: 'center' }}>
            <p style={{ fontSize: 28, fontWeight: 800, color: '#111', margin: 0, letterSpacing: '-1px', lineHeight: 1 }}>{pct}<span style={{ fontSize: 14, fontWeight: 500, color: '#bbb' }}>%</span></p>
          </div>
        </div>
        <div>
          <p style={{ fontSize: 13, color: '#aaa', margin: '0 0 4px' }}>Hoy logueado</p>
          <p style={{ fontSize: 36, fontWeight: 800, color: '#111', margin: '0 0 2px', letterSpacing: '-1.5px', lineHeight: 1 }}>{loggedToday}<span style={{ fontSize: 18, color: '#ccc', fontWeight: 400 }}>/{totalCats}</span></p>
          <p style={{ fontSize: 12, color: '#ccc', margin: 0 }}>hábitos</p>
        </div>
      </div>

      {/* Habit pills */}
      <div style={{ padding: '20px 20px 0', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {CATEGORIES.map(cat => {
          const done = isLogged(todayLogs?.[cat.id])
          const meta = HABIT_META[cat.id]
          return (
            <button
              key={cat.id}
              onClick={() => onNavigate(cat.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 12px', borderRadius: 20,
                background: done ? '#111' : '#fff',
                border: `0.5px solid ${done ? '#111' : '#e0e0de'}`,
                color: done ? '#fff' : '#888',
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 13 }}>{meta?.emoji}</span>
              <span>{meta?.label}</span>
            </button>
          )
        })}
      </div>

      {/* Stats row */}
      <div style={{ padding: '16px 16px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <div style={{ background: '#fff', border: '0.5px solid #e8e8e6', borderRadius: 16, padding: '14px 14px 12px' }}>
          <p style={{ fontSize: 10, color: '#bbb', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sueño</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: sleepAvg && sleepAvg < 7 ? '#f59e0b' : '#111', margin: 0, letterSpacing: '-0.5px' }}>
            {sleepAvg ?? '—'}<span style={{ fontSize: 11, fontWeight: 400, color: '#ccc' }}>h</span>
          </p>
          <p style={{ fontSize: 10, color: '#ccc', margin: '3px 0 0' }}>media semanal</p>
        </div>
        <div style={{ background: '#fff', border: '0.5px solid #e8e8e6', borderRadius: 16, padding: '14px 14px 12px' }}>
          <p style={{ fontSize: 10, color: '#bbb', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gym</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: gymCount >= 3 ? '#0a8a6e' : '#111', margin: 0, letterSpacing: '-0.5px' }}>
            {gymCount}<span style={{ fontSize: 11, fontWeight: 400, color: '#ccc' }}>/3</span>
          </p>
          <p style={{ fontSize: 10, color: '#ccc', margin: '3px 0 0' }}>esta semana</p>
        </div>
        <div style={{ background: '#fff', border: '0.5px solid #e8e8e6', borderRadius: 16, padding: '14px 14px 12px' }}>
          <p style={{ fontSize: 10, color: '#bbb', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Racha</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#111', margin: 0, letterSpacing: '-0.5px' }}>
            {streakMax}<span style={{ fontSize: 11, fontWeight: 400, color: '#ccc' }}>d</span>
          </p>
          <p style={{ fontSize: 10, color: '#ccc', margin: '3px 0 0' }}>máximo</p>
        </div>
      </div>

      {/* Recommendation */}
      {rec && (
        <div style={{ margin: '12px 16px 0', background: '#fff', border: '0.5px solid #e8e8e6', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>{rec.emoji}</span>
          <p style={{ fontSize: 13, color: rec.good ? '#0a8a6e' : '#555', margin: 0, lineHeight: 1.5 }}>{rec.text}</p>
        </div>
      )}

      {/* Module shortcuts */}
      <div style={{ padding: '16px 16px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          { page: 'diary',   emoji: '📝', label: 'Diario',      sub: 'Escribe lo que sea'  },
          { page: 'ideas',   emoji: '💡', label: 'Ideas',       sub: 'Captura rápida'       },
          { page: 'stats',   emoji: '📊', label: 'Stats',       sub: 'Ver progreso'         },
          { page: 'habits',  emoji: '◎',  label: 'Todos los logs', sub: 'Vista completa'   },
        ].map(item => (
          <button key={item.page} onClick={() => onNavigate(item.page)} style={{
            background: '#fff', border: '0.5px solid #e8e8e6', borderRadius: 16,
            padding: '14px 16px 12px', textAlign: 'left', cursor: 'pointer',
            transition: 'transform 0.1s',
          }}>
            <span style={{ fontSize: 20, display: 'block', marginBottom: 8 }}>{item.emoji}</span>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: '0 0 2px' }}>{item.label}</p>
            <p style={{ fontSize: 11, color: '#bbb', margin: 0 }}>{item.sub}</p>
          </button>
        ))}
      </div>

    </div>
  )
}
