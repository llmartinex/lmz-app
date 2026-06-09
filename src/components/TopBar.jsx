export default function TopBar({ title, onBack, right }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 10,
      background: 'rgba(242,242,240,0.9)',
      backdropFilter: 'blur(12px)',
      borderBottom: '0.5px solid #e8e8e6',
      padding: '12px 16px',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      {onBack && (
        <button
          onClick={onBack}
          style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff', border: '0.5px solid #e8e8e6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16 }}
        >
          ←
        </button>
      )}
      <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: 0, flex: 1, letterSpacing: '-0.2px' }}>
        {title}
      </h2>
      {right}
    </div>
  )
}
