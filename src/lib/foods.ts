// Small local food table (per 100 g) so the app works offline.
// Production: replace with a full nutrition database lookup.

export interface Food {
  id: string;
  name: string;
  protein100: number;
  kcal100: number;
  step: number; // grams per +/- tap
}

export const FOODS: Record<string, Food> = {
  salmon: { id: 'salmon', name: 'Salmon, baked', protein100: 20, kcal100: 208, step: 10 },
  potatoes: { id: 'potatoes', name: 'Baby potatoes', protein100: 2, kcal100: 77, step: 10 },
  beans: { id: 'beans', name: 'Green beans', protein100: 1.8, kcal100: 31, step: 10 },
  oliveOil: { id: 'oliveOil', name: 'Olive oil', protein100: 0, kcal100: 884, step: 5 },
  chicken: { id: 'chicken', name: 'Chicken breast, grilled', protein100: 31, kcal100: 165, step: 10 },
  rice: { id: 'rice', name: 'Jasmine rice, cooked', protein100: 2.7, kcal100: 130, step: 10 },
  greekYogurt: { id: 'greekYogurt', name: 'Greek yogurt 2%', protein100: 9.9, kcal100: 73, step: 25 },
  skyr: { id: 'skyr', name: 'Skyr, plain', protein100: 10, kcal100: 63, step: 10 },
  whey: { id: 'whey', name: 'Whey protein', protein100: 78, kcal100: 380, step: 5 },
  banana: { id: 'banana', name: 'Banana', protein100: 1.1, kcal100: 89, step: 10 },
  milk: { id: 'milk', name: 'Milk, semi-skimmed', protein100: 3.5, kcal100: 47, step: 25 },
};

export interface LoggedItem {
  foodId: string;
  grams: number;
}

export function macros(items: LoggedItem[]) {
  let protein = 0;
  let kcal = 0;
  for (const it of items) {
    const f = FOODS[it.foodId];
    if (!f) continue;
    protein += (f.protein100 * it.grams) / 100;
    kcal += (f.kcal100 * it.grams) / 100;
  }
  return { protein: Math.round(protein), kcal: Math.round(kcal) };
}

/** One-tap repeats shown on the log screen. */
export const QUICK_ADDS: { label: string; items: LoggedItem[] }[] = [
  { label: 'Protein shake', items: [{ foodId: 'whey', grams: 30 }, { foodId: 'milk', grams: 250 }] },
  { label: 'Skyr 170 g', items: [{ foodId: 'skyr', grams: 170 }] },
  { label: 'Yogurt bowl', items: [{ foodId: 'greekYogurt', grams: 250 }, { foodId: 'banana', grams: 100 }] },
];
