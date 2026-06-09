export default function Login({ onLogin }) {
  return (
    <div style={{ minHeight: '100dvh', background: '#f2f2f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🃏</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111', margin: '0 0 8px', letterSpacing: '-0.5px' }}>LMZ</h1>
        <p style={{ fontSize: 14, color: '#bbb', margin: 0 }}>Tu ecosistema personal</p>
      </div>

      <button
        onClick={onLogin}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#fff', border: '0.5px solid #e0e0de',
          borderRadius: 14, padding: '13px 24px',
          fontSize: 14, fontWeight: 600, color: '#111',
          cursor: 'pointer', transition: 'transform 0.1s, box-shadow 0.1s',
        }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'scale(1.01)' }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'scale(1)' }}
      >
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8H6.1C9.4 35.4 16.2 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.1 5.4l6.2 5.2C37.1 38.4 44 33 44 24c0-1.3-.1-2.6-.4-3.9z"/>
        </svg>
        Entrar con Google
      </button>
    </div>
  )
}
