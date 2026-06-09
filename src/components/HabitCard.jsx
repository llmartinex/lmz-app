import { CATEGORIES, isLogged } from '../hooks/useLogs'

function getSummary(category, logData) {
  if (!logData || !isLogged(logData)) return null
  const p = []
  if (category.id === 'dormir')        { if (logData.hours) p.push(`${logData.hours}h`); if (logData.quality) p.push(`★${logData.quality}`) }
  if (category.id === 'gimnasio')      { if (logData.focus) p.push(logData.focus); if (logData.duration) p.push(`${logData.duration}min`) }
  if (category.id === 'baloncesto')    { if (logData.duration) p.push(`${logData.duration}min`) }
  if (category.id === 'alimentacion')  { if (logData.quality) p.push(`★${logData.quality}/5`) }
  if (category.id === 'habito_mental') { if (logData.type) p.push(logData.type); if (logData.duration) p.push(`${logData.duration}min`) }
  if (category.id === 'contenido')     { if (logData.platform) p.push(logData.platform) }
  return p.length > 0 ? p.join(' · ') : 'Logueado ✓'
}

export default function HabitCard({ categoryId, logData, streak, onOpen }) {
  const category = CATEGORIES.find(c => c.id === categoryId)
  if (!category) return null
  const logged  = isLogged(logData)
  const summary = getSummary(category, logData)

  return (
    <button
      onClick={onOpen}
      style={{
        width: '100%', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        background: '#fff', border: '0.5px solid #e8e8e6',
        borderRadius: 14, padding: '13px 16px',
        textAlign: 'left', transition: 'background 0.1s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
          background: logged ? '#0a8a6e' : '#e0e0de',
        }} />
        <span style={{ fontSize: 18, lineHeight: 1 }}>{category.emoji}</span>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: logged ? '#111' : '#555', margin: 0 }}>
            {category.label}
          </p>
          <p style={{ fontSize: 11, color: '#bbb', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {summary || 'Sin log hoy'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 8 }}>
        {streak > 0 && (
          <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>🔥{streak}</span>
        )}
        <span style={{
          fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 20,
          background: logged ? '#e8f5f0' : '#f5f5f3',
          color: logged ? '#0a8a6e' : '#bbb',
        }}>
          {logged ? 'Ver' : 'Log'}
        </span>
      </div>
    </button>
  )
}
