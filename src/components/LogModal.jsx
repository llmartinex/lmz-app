import { useState, useEffect } from 'react'
import { CATEGORIES } from '../hooks/useLogs'

function RatingInput({ value, onChange, max = 5 }) {
  const labels = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente']
  return (
    <div>
      <div style={{ display: 'flex', gap: 8 }}>
        {Array.from({ length: max }, (_, i) => i + 1).map(n => (
          <button key={n} type="button" onClick={() => onChange(n)} style={{
            flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 500,
            border: value === n ? '1.5px solid #0a8a6e' : '0.5px solid #e8e8e6',
            background: value === n ? '#e8f5f0' : '#fafaf9',
            color: value === n ? '#0a8a6e' : '#888',
            transition: 'all 0.1s',
          }}>
            {n}
          </button>
        ))}
      </div>
      {value > 0 && <p style={{ fontSize: 11, color: '#aaa', textAlign: 'center', margin: '6px 0 0' }}>{labels[value]}</p>}
    </div>
  )
}

const inputStyle = {
  width: '100%', background: '#fafaf9', border: '0.5px solid #e8e8e6',
  borderRadius: 12, padding: '12px 14px', fontSize: 14, color: '#111',
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
}

export default function LogModal({ categoryId, existingData, onSave, onClose }) {
  const category = CATEGORIES.find(c => c.id === categoryId)
  const [form, setForm] = useState({})

  useEffect(() => {
    if (existingData?.logged) {
      const { logged, ...rest } = existingData
      setForm(rest)
    } else {
      setForm({})
    }
  }, [categoryId])

  if (!category) return null

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }))

  function handleSubmit(e) {
    e.preventDefault()
    onSave(categoryId, form)
    onClose()
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 40, backdropFilter: 'blur(4px)' }} />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: '#f2f2f0', borderRadius: '22px 22px 0 0',
        maxHeight: '92dvh', overflowY: 'auto',
        borderTop: '0.5px solid #e8e8e6',
      }}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, background: '#ddd', borderRadius: 2 }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px 14px', borderBottom: '0.5px solid #e8e8e6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>{category.emoji}</span>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#111', margin: 0 }}>{category.label}</h2>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: '50%', background: '#e8e8e6', border: 'none', fontSize: 14, color: '#666' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 20px 36px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {category.fields.map(field => (
            <div key={field.key}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
                {field.label}
              </label>

              {field.type === 'rating' && <RatingInput value={form[field.key] || 0} onChange={v => set(field.key, v)} max={field.max} />}

              {field.type === 'select' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {field.options.map(opt => (
                    <button key={opt} type="button" onClick={() => set(field.key, opt)} style={{
                      padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 500,
                      border: form[field.key] === opt ? '1.5px solid #0a8a6e' : '0.5px solid #e8e8e6',
                      background: form[field.key] === opt ? '#e8f5f0' : '#fafaf9',
                      color: form[field.key] === opt ? '#0a8a6e' : '#666',
                    }}>{opt}</button>
                  ))}
                </div>
              )}

              {field.type === 'number' && (
                <input type="number" step={field.step || 1} min={field.min} max={field.max}
                  value={form[field.key] || ''} placeholder={field.placeholder}
                  onChange={e => set(field.key, e.target.value ? Number(e.target.value) : '')}
                  style={inputStyle}
                />
              )}

              {field.type === 'text' && (
                <input type="text" value={form[field.key] || ''} placeholder={field.placeholder}
                  onChange={e => set(field.key, e.target.value)} style={inputStyle} />
              )}

              {field.type === 'textarea' && (
                <textarea value={form[field.key] || ''} placeholder={field.placeholder} rows={3}
                  onChange={e => set(field.key, e.target.value)}
                  style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
                />
              )}
            </div>
          ))}

          <button type="submit" style={{
            width: '100%', padding: '15px', borderRadius: 14,
            background: '#111', color: '#fff', border: 'none',
            fontSize: 14, fontWeight: 600, marginTop: 4,
          }}>
            Guardar
          </button>
        </form>
      </div>
    </>
  )
}
