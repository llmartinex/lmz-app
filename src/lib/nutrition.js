// Open Food Facts — free, no API key required
export async function searchFood(query) {
  if (!query || query.length < 2) return []
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=8&fields=product_name,brands,nutriments,serving_size,image_small_url`
  const resp = await fetch(url)
  const data = await resp.json()
  return (data.products || [])
    .filter(p => p.product_name && p.nutriments?.['energy-kcal_100g'])
    .map(p => ({
      name:     p.product_name,
      brand:    p.brands,
      per100:   {
        calories: Math.round(p.nutriments['energy-kcal_100g'] || 0),
        protein:  Math.round(p.nutriments['proteins_100g']    || 0),
        carbs:    Math.round(p.nutriments['carbohydrates_100g'] || 0),
        fat:      Math.round(p.nutriments['fat_100g']          || 0),
      }
    }))
}

export function calcMacros(per100, grams) {
  const f = grams / 100
  return {
    calories: Math.round(per100.calories * f),
    protein:  Math.round(per100.protein  * f),
    carbs:    Math.round(per100.carbs    * f),
    fat:      Math.round(per100.fat      * f),
  }
}

// Alimentos comunes con macros por 100g (fallback offline)
export const COMMON_FOODS = [
  { name: 'Pechuga de pollo (plancha)', per100: { calories: 165, protein: 31, carbs: 0,  fat: 4  } },
  { name: 'Arroz blanco (cocido)',       per100: { calories: 130, protein: 3,  carbs: 28, fat: 0  } },
  { name: 'Huevo entero',                per100: { calories: 155, protein: 13, carbs: 1,  fat: 11 } },
  { name: 'Avena',                       per100: { calories: 379, protein: 13, carbs: 67, fat: 7  } },
  { name: 'Leche entera',                per100: { calories: 61,  protein: 3,  carbs: 5,  fat: 3  } },
  { name: 'Plátano',                     per100: { calories: 89,  protein: 1,  carbs: 23, fat: 0  } },
  { name: 'Pan integral',                per100: { calories: 247, protein: 9,  carbs: 41, fat: 3  } },
  { name: 'Pasta (cocida)',              per100: { calories: 131, protein: 5,  carbs: 25, fat: 1  } },
  { name: 'Salmón',                      per100: { calories: 208, protein: 20, carbs: 0,  fat: 13 } },
  { name: 'Atún en lata (agua)',         per100: { calories: 116, protein: 26, carbs: 0,  fat: 1  } },
  { name: 'Yogur griego natural',        per100: { calories: 97,  protein: 9,  carbs: 4,  fat: 5  } },
  { name: 'Almendras',                   per100: { calories: 579, protein: 21, carbs: 22, fat: 50 } },
  { name: 'Patata cocida',               per100: { calories: 87,  protein: 2,  carbs: 20, fat: 0  } },
  { name: 'Brócoli',                     per100: { calories: 34,  protein: 3,  carbs: 7,  fat: 0  } },
  { name: 'Aceite de oliva',             per100: { calories: 884, protein: 0,  carbs: 0,  fat: 100} },
]
