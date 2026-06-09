import { useState, useEffect, useRef } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { searchFood, calcMacros, COMMON_FOODS } from '../lib/nutrition'
import TopBar from '../components/TopBar'

const MEALS = [
  { id: 'breakfast', label: 'Desayuno', emoji: '☀️', placeholder: 'ej: avena, huevos, café...' },
  { id: 'lunch',     label: 'Comida',   emoji: '🍽️', placeholder: 'ej: pollo con arroz y ensalada...' },
  { id: 'dinner',    label: 'Cena',     emoji: '🌙', placeholder: 'ej: salmón con brócoli...' },
]

function MacroBar({ label, value, total, color }) {
  const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: '#aaa', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 10, color: '#666', fontWeight: 700 }}>{value}g</span>
      </div>
      <div style={{ height: 4, background: '#f0f0ee', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}

function FoodSearchModal({ onSelect, onClose }) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState(COMMON_FOODS)
  const [loading, setLoading] = useState(false)
  const [grams, setGrams]     = useState(100)
  const [selected, setSelected] = useState(null)
  const timer = useRef(null)

  function handleQuery(val) {
    setQuery(val)
    clearTimeout(timer.current)
    if (!val.trim()) { setResults(COMMON_FOODS); setSelected(null); return }
    setLoading(true)
    timer.current = setTimeout(async () => {
      try {
        const r = await searchFood(val)
        setResults(r.length > 0 ? r : COMMON_FOODS.filter(f => f.name.toLowerCase().includes(val.toLowerCase())))
      } catch { setResults(COMMON_FOODS) }
      setLoading(false)
    }, 500)
  }

  function confirm() {
    if (!selected) return
    onSelect({ food: selected, grams, macros: calcMacros(selected.per100, grams) })
    onClose()
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.2)', zIndex: 40, backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, background: '#f2f2f0', borderRadius: '20px 20px 0 0', maxHeight: '85dvh', display: 'flex', flexDirection: 'column', borderTop: '0.5px solid #e8e8e6' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: 34, height: 4, background: '#ddd', borderRadius: 2 }} />
        </div>
        <div style={{ padding: '8px 16px 12px', borderBottom: '0.5px solid #e8e8e6' }}>
          <input autoFocus value={query} onChange={e => handleQuery(e.target.value)}
            placeholder="Buscar alimento..." style={{
              width: '100%', background: '#fff', border: '0.5px solid #e8e8e6', borderRadius: 12,
              padding: '11px 14px', fontSize: 14, color: '#111', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '8px 12px' }}>
          {loading && <p style={{ textAlign: 'center', color: '#ccc', fontSize: 12, padding: '12px 0' }}>Buscando...</p>}
          {results.map((food, i) => (
            <button key={i} onClick={() => setSelected(food)} style={{
              width: '100%', textAlign: 'left', padding: '11px 12px', borderRadius: 12, border: 'none',
              background: selected === food ? '#e8f5f0' : 'transparent',
              borderLeft: selected === food ? '3px solid #0a8a6e' : '3px solid transparent',
              marginBottom: 2, transition: 'all 0.1s',
            }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: selected === food ? '#0a8a6e' : '#111', margin: 0 }}>{food.name}</p>
              <p style={{ fontSize: 11, color: '#bbb', margin: '2px 0 0' }}>
                {food.per100.calories}kcal · P:{food.per100.protein}g C:{food.per100.carbs}g G:{food.per100.fat}g por 100g
              </p>
            </button>
          ))}
        </div>

        {selected && (
          <div style={{ padding: '14px 16px 28px', borderTop: '0.5px solid #e8e8e6', background: '#fff' }}>
            <p style={{ fontSize: 12, color: '#aaa', margin: '0 0 8px' }}>Cantidad en gramos</p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="number" value={grams} onChange={e => setGrams(Number(e.target.value))} min={1} max={2000}
                style={{ width: 80, background: '#f5f5f3', border: '0.5px solid #e8e8e6', borderRadius: 10, padding: '10px 12px', fontSize: 14, color: '#111', outline: 'none', fontFamily: 'inherit', textAlign: 'center' }}
              />
              <span style={{ fontSize: 13, color: '#888' }}>g</span>
              <div style={{ flex: 1 }} />
              <div style={{ textAlign: 'right', fontSize: 12, color: '#888' }}>
                {calcMacros(selected.per100, grams).calories}kcal · P:{calcMacros(selected.per100, grams).protein}g
              </div>
            </div>
            <button onClick={confirm} style={{ width: '100%', marginTop: 12, padding: '14px', borderRadius: 14, background: '#111', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600 }}>
              Añadir a la comida
            </button>
          </div>
        )}
      </div>
    </>
  )
}

function MealCard({ meal, items, onAdd, onRemove }) {
  const [showSearch, setShowSearch] = useState(false)
  const totals = items.reduce((acc, i) => ({
    calories: acc.calories + (i.macros?.calories || 0),
    protein:  acc.protein  + (i.macros?.protein  || 0),
    carbs:    acc.carbs    + (i.macros?.carbs     || 0),
    fat:      acc.fat      + (i.macros?.fat       || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

  return (
    <div style={{ background: '#fff', border: '0.5px solid #e8e8e6', borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px 12px', borderBottom: items.length > 0 ? '0.5px solid #f5f5f3' : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>{meal.emoji}</span>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: 0 }}>{meal.label}</p>
            {totals.calories > 0 && <span style={{ fontSize: 11, color: '#0a8a6e', fontWeight: 600 }}>{totals.calories} kcal</span>}
          </div>
          <button onClick={() => setShowSearch(true)} style={{ width: 28, height: 28, borderRadius: '50%', background: '#f5f5f3', border: '0.5px solid #e8e8e6', fontSize: 16, color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
        </div>
      </div>

      {items.length > 0 && (
        <div>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 16px', borderBottom: '0.5px solid #f5f5f3' }}>
              <div>
                <p style={{ fontSize: 13, color: '#333', margin: 0 }}>{item.food.name}</p>
                <p style={{ fontSize: 11, color: '#bbb', margin: '1px 0 0' }}>{item.grams}g · P:{item.macros.protein}g C:{item.macros.carbs}g G:{item.macros.fat}g</p>
              </div>
              <button onClick={() => onRemove(i)} style={{ color: '#ddd', background: 'none', border: 'none', fontSize: 16, padding: '0 4px' }}>✕</button>
            </div>
          ))}
          <div style={{ padding: '12px 16px', display: 'flex', gap: 10 }}>
            <MacroBar label="PROT" value={totals.protein}  total={totals.protein + totals.carbs + totals.fat} color="#3b82f6" />
            <MacroBar label="CARBS" value={totals.carbs}   total={totals.protein + totals.carbs + totals.fat} color="#f59e0b" />
            <MacroBar label="GRASA" value={totals.fat}     total={totals.protein + totals.carbs + totals.fat} color="#ef4444" />
          </div>
        </div>
      )}

      {items.length === 0 && (
        <button onClick={() => setShowSearch(true)} style={{ width: '100%', padding: '12px 16px', color: '#ccc', fontSize: 13, background: 'none', border: 'none', textAlign: 'left' }}>
          {meal.placeholder}
        </button>
      )}

      {showSearch && <FoodSearchModal onSelect={item => onAdd(item)} onClose={() => setShowSearch(false)} />}
    </div>
  )
}

function todayKey() { return new Date().toISOString().slice(0, 10) }

export default function FoodSheet({ user, onBack }) {
  const [mealItems, setMealItems] = useState({ breakfast: [], lunch: [], dinner: [] })
  const [saving, setSaving]       = useState(false)
  const today = todayKey()

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const snap = await getDoc(doc(db, 'users', user.uid, 'food_logs', today))
      if (snap.exists() && snap.data().items) setMealItems(snap.data().items)
    } catch (e) { console.error(e) }
  }

  async function save(items) {
    setSaving(true)
    try { await setDoc(doc(db, 'users', user.uid, 'food_logs', today), { items }, { merge: true }) }
    catch (e) { console.error(e) }
    setSaving(false)
  }

  function addItem(mealId, item) {
    const updated = { ...mealItems, [mealId]: [...(mealItems[mealId] || []), item] }
    setMealItems(updated); save(updated)
  }

  function removeItem(mealId, idx) {
    const updated = { ...mealItems, [mealId]: mealItems[mealId].filter((_, i) => i !== idx) }
    setMealItems(updated); save(updated)
  }

  const daily = Object.values(mealItems).flat().reduce((acc, i) => ({
    calories: acc.calories + (i.macros?.calories || 0),
    protein:  acc.protein  + (i.macros?.protein  || 0),
    carbs:    acc.carbs    + (i.macros?.carbs     || 0),
    fat:      acc.fat      + (i.macros?.fat       || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

  return (
    <div className="page" style={{ minHeight: '100dvh', background: '#f2f2f0' }}>
      <TopBar title="🥗 Alimentación" onBack={onBack} right={saving ? <span style={{ fontSize: 11, color: '#bbb' }}>Guardando...</span> : null} />

      <div style={{ padding: '20px 16px 48px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {daily.calories > 0 && (
          <div style={{ background: '#111', borderRadius: 16, padding: '16px 20px' }}>
            <p style={{ fontSize: 10, color: '#555', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total del día</p>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              {[
                { label: 'Calorías', value: daily.calories, unit: 'kcal', color: '#0a8a6e' },
                { label: 'Proteína', value: daily.protein,  unit: 'g',    color: '#3b82f6' },
                { label: 'Carbs',    value: daily.carbs,    unit: 'g',    color: '#f59e0b' },
                { label: 'Grasa',    value: daily.fat,      unit: 'g',    color: '#ef4444' },
              ].map(m => (
                <div key={m.label} style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 2px', letterSpacing: '-0.5px' }}>{m.value}</p>
                  <p style={{ fontSize: 9, color: m.color, margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {MEALS.map(meal => (
          <MealCard key={meal.id} meal={meal}
            items={mealItems[meal.id] || []}
            onAdd={item => addItem(meal.id, item)}
            onRemove={idx => removeItem(meal.id, idx)}
          />
        ))}

      </div>
    </div>
  )
}
