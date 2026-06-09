import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useLogs, CATEGORIES, isLogged } from './hooks/useLogs'
import Login from './components/Login'
import HomeScreen from './components/HomeScreen'
import HabitsScreen from './components/HabitsScreen'
import DiaryScreen from './components/DiaryScreen'
import IdeasScreen from './components/IdeasScreen'
import StatsPage from './components/StatsPage'
import FoodSheet from './sheets/FoodSheet'
import SleepSheet from './sheets/SleepSheet'
import GymSheet from './sheets/GymSheet'

function AppContent({ user, logout }) {
  const [page, setPage] = useState('home')
  const { todayLogs, history, loading } = useLogs(user.uid)

  const nav = p => setPage(p)
  const back = () => setPage('home')

  const screens = {
    home:         <HomeScreen user={user} onNavigate={nav} todayLogs={todayLogs} history={history} />,
    habits:       <HabitsScreen user={user} onBack={back} />,
    diary:        <DiaryScreen  user={user} onBack={back} />,
    ideas:        <IdeasScreen  user={user} onBack={back} />,
    stats:        <StatsPage    user={user} onBack={back} />,
    alimentacion: <FoodSheet    user={user} onBack={back} />,
    dormir:       <SleepSheet   user={user} onBack={back} />,
    gimnasio:     <GymSheet     user={user} onBack={back} />,
  }

  return screens[page] || screens.home
}

export default function App() {
  const { user, loading, login, logout } = useAuth()

  if (loading) return (
    <div style={{ minHeight: '100dvh', background: '#f2f2f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#d0d0ce' }} />
    </div>
  )

  if (!user) return <Login onLogin={login} />
  return <AppContent user={user} logout={logout} />
}
