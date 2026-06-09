import { HABITS_CONFIG } from '../hooks/useHabits'

const DAYS_ES = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

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
  const d = new Date(dateStr + 'T00:00:00')
  const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1
  return DAYS_ES[dayIdx]
}

function isToday(dateStr) {
  return dateStr === new Date().toISOString().slice(0, 10)
}

export default function WeekView({ weekData }) {
  const days = getLast7Days()

  // Completado por día = al menos la mitad de hábitos diarios
  const dailyHabits = HABITS_CONFIG.filter(h => h.frequency === 'daily')

  function completedCount(dateStr) {
    const entry = weekData.find(w => w.date === dateStr)
    if (!entry) return 0
    return dailyHabits.filter(h => entry[h.id]).length
  }

  function completionLevel(dateStr) {
    const total = dailyHabits.length
    const done = completedCount(dateStr)
    if (done === 0) return 0
    if (done < total / 2) return 1
    if (done < total) return 2
    return 3
  }

  const levelColors = [
    'bg-zinc-800',       // 0 — nada
    'bg-zinc-600',       // 1 — poco
    'bg-zinc-400',       // 2 — bastante
    'bg-white',          // 3 — todo
  ]

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4">
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Esta semana</h3>
      <div className="flex justify-between">
        {days.map(date => {
          const level = completionLevel(date)
          const today = isToday(date)
          return (
            <div key={date} className="flex flex-col items-center gap-2">
              <span className={`text-xs ${today ? 'text-white font-bold' : 'text-zinc-600'}`}>
                {dayLabel(date)}
              </span>
              <div className={`w-8 h-8 rounded-lg ${levelColors[level]} ${today ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900' : ''} transition-colors`} />
              <span className="text-xs text-zinc-600">
                {completedCount(date) > 0 ? completedCount(date) : ''}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
