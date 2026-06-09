import { useMemo } from 'react'
import { useLogs, CATEGORIES, isLogged } from '../hooks/useLogs'
import TopBar from './TopBar'

const MONTHS_ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
function shortDate(str) { const d = new Date(str + 'T00:00:00'); return `${d.getDate()} ${MONTHS_ES[d.getMonth()]}` }

function BarChart({ data, valueKey, max, color = '#111', height = 72 }) {
  const maxVal = max || Math.max(...data.map(d => d[valueKey] || 0), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height }}>
      {data.map((d, i) => {
        const val = d[valueKey] || 0
        const pct = maxVal > 0 ? (val / maxVal) * 100 : 0
        const isLast = i === data.length - 1
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 4, height: '100%' }}>
            <div style={{ width: '100%', borderRadius: '3px 3px 0 0', transition: 'height 0.3s ease', background: isLast ? color : `${color}55`, height: `${Math.max(pct, val > 0 ? 6 : 0)}%`, minHeight: val > 0 ? '3px' : '0' }} />
            <span style={{ fontSize: 9, color: '#ccc' }}>{d.label || shortDate(d.date || '')}</span>
          </div>
        )
      })}
    </div>
  )
}

function LineChart({ data, valueKey, color = '#111', unit = '', height = 80 }) {
  const filtered = data.filter(d => d[valueKey] > 0)
  if (filtered.length < 2) return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 12, color: '#ddd' }}>Sin datos aún</span></div>
  const values = filtered.map(d => d[valueKey])
  const maxVal = Math.max(...values); const minVal = Math.min(...values)
  const range  = maxVal - minVal || 1
  const W = 300; const H = height - 20
  const pts = filtered.map((d, i) => ({ x: (i / (filtered.length - 1)) * W, y: H - ((d[valueKey] - minVal) / range) * H * 0.8 - H * 0.1, val: d[valueKey] }))
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" overflow="visible">
      <path d={`${pathD} L${pts[pts.length-1].x},${H+4} L${pts[0].x},${H+4}Z`} fill={`${color}15`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => <g key={i}><circle cx={p.x} cy={p.y} r="3" fill={color} /><text x={p.x} y={p.y - 6} textAnchor="middle" fontSize="9" fill="#aaa">{p.val}{unit}</text></g>)}
    </svg>
  )
}

function Card({ title, emoji, stat, statLabel, children }) {
  return (
    <div style={{ background: '#fff', border: '0.5px solid #e8e8e6', borderRadius: 18, padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{emoji}</span>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#333', margin: 0 }}>{title}</p>
        </div>
        {stat != null && (
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#111', margin: 0, letterSpacing: '-0.5px' }}>{stat}</p>
            <p style={{ fontSize: 10, color: '#bbb', margin: 0 }}>{statLabel}</p>
          </div>
        )}
      </div>
      {children}
    </div>
  )
}

function weeklyBars(data) {
  return [3,2,1,0].map(w => {
    const start = new Date(); const day = start.getDay() === 0 ? 6 : start.getDay() - 1
    start.setDate(start.getDate() - w*7 - day); start.setHours(0,0,0,0)
    const end = new Date(start); end.setDate(end.getDate() + 6)
    return { label: w === 0 ? 'esta' : `S-${w}`, count: data.filter(d => { const dt = new Date(d.date+'T00:00:00'); return d.logged && dt >= start && dt <= end }).length }
  })
}

export default function StatsPage({ user, onBack }) {
  const { getChartData, loading } = useLogs(user.uid)
  const sleep   = useMemo(() => getChartData('dormir', 14).filter(d => d.logged && d.hours), [])
  const gym     = useMemo(() => weeklyBars(getChartData('gimnasio', 28)), [])
  const food    = useMemo(() => getChartData('alimentacion', 14).filter(d => d.logged && d.quality), [])
  const mental  = useMemo(() => getChartData('habito_mental', 14).filter(d => d.logged && d.duration), [])
  const content = useMemo(() => weeklyBars(getChartData('contenido', 28)), [])

  const avgSleep = sleep.length ? (sleep.reduce((a,d) => a+d.hours, 0) / sleep.length).toFixed(1) : null
  const avgFood  = food.length  ? (food.reduce((a,d) => a+d.quality, 0) / food.length).toFixed(1) : null

  if (loading) return <div style={{ minHeight: '100dvh', background: '#f2f2f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#ccc', fontSize: 13 }}>Cargando...</span></div>

  return (
    <div className="page" style={{ minHeight: '100dvh', background: '#f2f2f0' }}>
      <TopBar title="Estadísticas" onBack={onBack} />
      <div style={{ padding: '20px 16px 40px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Card title="Sueño — horas" emoji="🌙" stat={avgSleep ? `${avgSleep}h` : '—'} statLabel="promedio">
          {sleep.length < 2 ? <p style={{ fontSize: 12, color: '#ddd', textAlign: 'center', padding: '12px 0' }}>Sin datos aún</p> : <LineChart data={sleep.slice(-14)} valueKey="hours" color="#6366f1" unit="h" />}
        </Card>
        <Card title="Gimnasio" emoji="🏋️" stat={`${gym[3]?.count ?? 0}/3`} statLabel="esta semana">
          <BarChart data={gym} valueKey="count" max={7} color="#111" />
        </Card>
        <Card title="Alimentación" emoji="🥗" stat={avgFood ? `${avgFood}/5` : '—'} statLabel="promedio">
          {food.length < 2 ? <p style={{ fontSize: 12, color: '#ddd', textAlign: 'center', padding: '12px 0' }}>Sin datos aún</p> : <BarChart data={food.slice(-14)} valueKey="quality" max={5} color="#22c55e" />}
        </Card>
        <Card title="Contenido @lmzcards" emoji="🃏" stat={`${content[3]?.count ?? 0}/3`} statLabel="esta semana">
          <BarChart data={content} valueKey="count" max={7} color="#0a8a6e" />
        </Card>
        <Card title="Hábito mental" emoji="🧘" stat={mental.length ? `${Math.round(mental.reduce((a,d)=>a+d.duration,0)/mental.length)}min` : '—'} statLabel="promedio">
          {mental.length < 2 ? <p style={{ fontSize: 12, color: '#ddd', textAlign: 'center', padding: '12px 0' }}>Sin datos aún</p> : <BarChart data={mental.slice(-14)} valueKey="duration" color="#a78bfa" />}
        </Card>
      </div>
    </div>
  )
}
