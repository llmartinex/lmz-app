import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, collection, getDocs, orderBy, query, limit } from 'firebase/firestore'
import { db } from '../firebase/config'
import TopBar from './TopBar'

function todayKey() { return new Date().toISOString().slice(0, 10) }

const MONTHS_ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
function formatDate(str) {
  const d = new Date(str + 'T00:00:00')
  return `${d.getDate()} ${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`
}

export default function DiaryScreen({ user, onBack }) {
  const [entries, setEntries]   = useState([])
  const [writing, setWriting]   = useState(false)
  const [current, setCurrent]   = useState(null) // { date, text }
  const [text, setText]         = useState('')
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)

  useEffect(() => { loadEntries() }, [])

  async function loadEntries() {
    setLoading(true)
    try {
      const ref  = collection(db, 'users', user.uid, 'diary')
      const q    = query(ref, orderBy('__name__', 'desc'), limit(30))
      const snap = await getDocs(q)
      const list = []
      snap.forEach(d => list.push({ date: d.id, ...d.data() }))
      setEntries(list)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function openEntry(entry) {
    setCurrent(entry)
    setText(entry.text || '')
    setWriting(true)
  }

  async function newEntry() {
    const date = todayKey()
    const existing = entries.find(e => e.date === date)
    if (existing) { openEntry(existing); return }
    setCurrent({ date, text: '' })
    setText('')
    setWriting(true)
  }

  async function saveEntry() {
    if (!text.trim()) return
    setSaving(true)
    const ref = doc(db, 'users', user.uid, 'diary', current.date)
    await setDoc(ref, { text, updatedAt: new Date().toISOString() }, { merge: true })
    await loadEntries()
    setSaving(false)
    setWriting(false)
  }

  if (writing) return (
    <div className="page" style={{ minHeight: '100dvh', background: '#f2f2f0', display: 'flex', flexDirection: 'column' }}>
      <TopBar
        title={formatDate(current.date)}
        onBack={() => setWriting(false)}
        right={
          <button onClick={saveEntry} disabled={saving} style={{
            padding: '7px 16px', borderRadius: 20, background: '#111', color: '#fff',
            border: 'none', fontSize: 13, fontWeight: 600, opacity: saving ? 0.5 : 1,
          }}>
            {saving ? '...' : 'Guardar'}
          </button>
        }
      />
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Escribe lo que quieras..."
        autoFocus
        style={{
          flex: 1, background: 'transparent', border: 'none', outline: 'none',
          padding: '24px 20px', fontSize: 16, lineHeight: 1.8, color: '#111',
          fontFamily: 'inherit', resize: 'none', minHeight: 'calc(100dvh - 60px)',
        }}
      />
    </div>
  )

  return (
    <div className="page" style={{ minHeight: '100dvh', background: '#f2f2f0' }}>
      <TopBar
        title="Diario"
        onBack={onBack}
        right={
          <button onClick={newEntry} style={{
            width: 32, height: 32, borderRadius: '50%', background: '#111', color: '#fff',
            border: 'none', fontSize: 18, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>+</button>
        }
      />

      <div style={{ padding: '20px 16px 40px' }}>
        {loading ? (
          <p style={{ color: '#ccc', fontSize: 13, textAlign: 'center', marginTop: 40 }}>Cargando...</p>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 60 }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>📝</p>
            <p style={{ fontSize: 14, color: '#bbb' }}>Aún no hay entradas</p>
            <button onClick={newEntry} style={{
              marginTop: 16, padding: '11px 24px', borderRadius: 14, background: '#111',
              color: '#fff', border: 'none', fontSize: 14, fontWeight: 600,
            }}>Escribir algo</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {entries.map(entry => (
              <button key={entry.date} onClick={() => openEntry(entry)} style={{
                background: '#fff', border: '0.5px solid #e8e8e6', borderRadius: 14,
                padding: '14px 16px', textAlign: 'left', width: '100%',
              }}>
                <p style={{ fontSize: 12, color: '#bbb', margin: '0 0 4px' }}>{formatDate(entry.date)}</p>
                <p style={{ fontSize: 14, color: '#333', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {entry.text?.split('\n')[0] || '—'}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
