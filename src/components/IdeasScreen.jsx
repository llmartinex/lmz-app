import { useState, useEffect, useRef } from 'react'
import { collection, addDoc, getDocs, deleteDoc, doc, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import TopBar from './TopBar'

export default function IdeasScreen({ user, onBack }) {
  const [ideas, setIdeas]   = useState([])
  const [input, setInput]   = useState('')
  const [loading, setLoading] = useState(true)
  const inputRef = useRef(null)

  useEffect(() => { loadIdeas() }, [])

  async function loadIdeas() {
    setLoading(true)
    try {
      const ref  = collection(db, 'users', user.uid, 'ideas')
      const q    = query(ref, orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      const list = []
      snap.forEach(d => list.push({ id: d.id, ...d.data() }))
      setIdeas(list)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function addIdea() {
    const text = input.trim()
    if (!text) return
    setInput('')
    const ref = collection(db, 'users', user.uid, 'ideas')
    const newDoc = await addDoc(ref, { text, createdAt: serverTimestamp() })
    setIdeas(prev => [{ id: newDoc.id, text, createdAt: new Date() }, ...prev])
  }

  async function deleteIdea(id) {
    await deleteDoc(doc(db, 'users', user.uid, 'ideas', id))
    setIdeas(prev => prev.filter(i => i.id !== id))
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addIdea() }
  }

  return (
    <div className="page" style={{ minHeight: '100dvh', background: '#f2f2f0' }}>
      <TopBar title="Ideas" onBack={onBack} />

      {/* Input fijo arriba */}
      <div style={{ padding: '16px 16px 0', position: 'sticky', top: 57, zIndex: 9 }}>
        <div style={{ background: '#fff', border: '0.5px solid #e8e8e6', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 0, overflow: 'hidden' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Nueva idea... (Enter para guardar)"
            rows={1}
            style={{
              flex: 1, border: 'none', outline: 'none', padding: '13px 14px',
              fontSize: 14, background: 'transparent', fontFamily: 'inherit',
              resize: 'none', lineHeight: 1.5, color: '#111',
            }}
          />
          <button onClick={addIdea} disabled={!input.trim()} style={{
            width: 44, height: 44, background: input.trim() ? '#111' : '#f5f5f3',
            border: 'none', color: input.trim() ? '#fff' : '#ccc',
            fontSize: 18, flexShrink: 0, margin: 6, borderRadius: 10, transition: 'all 0.15s',
          }}>↑</button>
        </div>
      </div>

      <div style={{ padding: '12px 16px 40px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading ? (
          <p style={{ color: '#ccc', fontSize: 13, textAlign: 'center', marginTop: 40 }}>Cargando...</p>
        ) : ideas.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 60 }}>
            <p style={{ fontSize: 32 }}>💡</p>
            <p style={{ fontSize: 14, color: '#bbb', marginTop: 10 }}>Captura tu primera idea</p>
          </div>
        ) : ideas.map(idea => (
          <div key={idea.id} style={{
            background: '#fff', border: '0.5px solid #e8e8e6', borderRadius: 14,
            padding: '13px 14px 13px 16px', display: 'flex', alignItems: 'flex-start', gap: 10,
          }}>
            <p style={{ flex: 1, fontSize: 14, color: '#111', margin: 0, lineHeight: 1.6 }}>
              {idea.text}
            </p>
            <button onClick={() => deleteIdea(idea.id)} style={{
              width: 26, height: 26, borderRadius: '50%', background: '#f5f5f3',
              border: '0.5px solid #e8e8e6', color: '#ccc', fontSize: 12, flexShrink: 0,
            }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}
