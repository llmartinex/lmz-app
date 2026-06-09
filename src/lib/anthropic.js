const API_KEY = import.meta.env.VITE_ANTHROPIC_KEY || ''

export async function estimateMacros(description) {
  if (!API_KEY) throw new Error('NO_KEY')
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-allow-browser': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 120,
      messages: [{
        role: 'user',
        content: `Estima los macronutrientes de esta comida: "${description}". Responde SOLO con JSON válido, sin texto adicional: {"protein": 30, "carbs": 50, "fat": 10, "calories": 420}`
      }]
    })
  })
  const data = await resp.json()
  const text = data.content?.[0]?.text?.trim() || ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('PARSE_ERROR')
  return JSON.parse(match[0])
}

export function generateRecommendation({ sleepAvg, gymCount, foodAvg, streakMax, loggedToday, totalCats }) {
  const tips = []
  if (sleepAvg && sleepAvg < 7)
    tips.push({ emoji: '🌙', text: `Duermes ${sleepAvg}h de media — intenta acostarte 30 min antes.` })
  if (gymCount !== undefined && gymCount < 2)
    tips.push({ emoji: '🏋️', text: 'Llevas menos de 2 sesiones de gym esta semana. Hoy es buen día.' })
  if (foodAvg && foodAvg < 3)
    tips.push({ emoji: '🥗', text: 'La calidad de tu alimentación esta semana puede mejorar.' })
  if (loggedToday === totalCats)
    tips.push({ emoji: '✓', text: '¡Todo logueado hoy! Consistencia es la clave.', good: true })
  else if (loggedToday === 0)
    tips.push({ emoji: '◎', text: 'Aún no has logueado nada hoy. Empieza por lo más fácil.' })
  if (streakMax >= 7)
    tips.push({ emoji: '🔥', text: `${streakMax} días de racha seguidos — no lo rompas esta noche.`, good: true })
  return tips.length > 0 ? tips[Math.floor(Math.random() * tips.length)] : { emoji: '✦', text: 'Empieza a loguear para ver tus primeras recomendaciones.' }
}
