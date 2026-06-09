const NAV_ITEMS = [
  { id: 'habits', label: 'Hábitos',     emoji: '◎' },
  { id: 'stats',  label: 'Estadísticas', emoji: '📊' },
  { id: null,     label: 'Entrenos',    emoji: '💪', soon: true },
  { id: null,     label: 'Sueño',       emoji: '🌙', soon: true },
  { id: null,     label: 'Contenido',   emoji: '🃏', soon: true },
  { id: null,     label: 'Diario',      emoji: '📝', soon: true },
  { id: null,     label: 'Chat IA',     emoji: '✦',  soon: true },
]

export default function Sidebar({ user, onLogout, activePage, onNavigate }) {
  return (
    <aside className="hidden md:flex flex-col w-52 min-h-screen bg-[#0a0a0a] border-r border-[#181818] fixed left-0 top-0 bottom-0 px-3 py-6">
      <div className="mb-8 px-3">
        <div className="flex items-center gap-2">
          <span className="text-[#00d4a8] text-base font-bold">✦</span>
          <h1 className="text-base font-bold text-white tracking-wide">LMZ</h1>
        </div>
        <p className="text-[10px] text-zinc-600 mt-0.5 ml-6">Personal OS</p>
      </div>

      <nav className="flex-1 space-y-0.5">
        {NAV_ITEMS.map((item, i) => (
          <div
            key={i}
            onClick={() => item.id && onNavigate(item.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors
              ${item.id === activePage
                ? 'bg-[#00d4a8]/10 text-[#00d4a8] font-medium'
                : item.id
                  ? 'text-zinc-400 hover:text-zinc-200 hover:bg-[#141414] cursor-pointer'
                  : 'text-zinc-600 cursor-default'}
            `}
          >
            <span className="w-4 text-center text-sm leading-none">{item.emoji}</span>
            <span>{item.label}</span>
            {item.soon && (
              <span className="ml-auto text-[9px] text-zinc-700 bg-[#1c1c1c] px-1.5 py-0.5 rounded font-semibold tracking-wide">
                PRONTO
              </span>
            )}
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-3 pt-4 border-t border-[#181818]">
        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-[#252525]">
          {user.photoURL
            ? <img src={user.photoURL} className="w-full h-full object-cover" alt="" />
            : <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400">{user.displayName?.[0] || 'L'}</div>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-zinc-300 font-medium truncate">{user.displayName?.split(' ')[0] || 'Lucas'}</p>
          <button onClick={onLogout} className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors">Salir</button>
        </div>
      </div>
    </aside>
  )
}
