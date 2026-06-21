// Pure display helpers shared by the recipe card and the recipe preview, so the
// star-rating threshold and category color/emoji mappings live in ONE place.

export type StarType = 'full' | 'half' | 'empty';

// Color-coded categories from the search redesign (design-mockups/search-page-v2.html).
const CATEGORY_COLORS: Record<string, string> = {
  'Main Dish': '#c9342a',
  'Side Dish': '#d97b1a',
  'Appetizer': '#8e24aa',
  'Dessert': '#c2185b',
  'Breakfast': '#e6a70f',
  'Snack': '#2e9e6a',
  'Beverage': '#2471a3',
  'Soup': '#7d5228'
};

const CATEGORY_EMOJI: Record<string, string> = {
  'Main Dish': '🍖',
  'Side Dish': '🥗',
  'Appetizer': '🧀',
  'Dessert': '🎂',
  'Breakfast': '🍳',
  'Snack': '🍪',
  'Beverage': '☕',
  'Soup': '🍜'
};

// The preset categories offered in the save-page picker (order = display order).
// Custom categories typed by users fall back to the neutral colour/emoji above.
export const CATEGORY_NAMES: string[] = Object.keys(CATEGORY_COLORS);

// Splits the 5 star slots into full / half / empty for a rating average.
// Rounds the fractional part first — averages are 1-decimal by contract, and raw
// subtraction (e.g. 4.3 - 4 = 0.299999…) would lose the half-star threshold.
export function starTypesFor(average: number): StarType[] {
  const avg = average ?? 0;
  const full = Math.floor(avg);
  const frac = Math.round((avg - full) * 10) / 10;
  const half = frac >= 0.3 ? 1 : 0;
  const empty = Math.max(0, 5 - full - half);
  return [
    ...Array<StarType>(full).fill('full'),
    ...Array<StarType>(half).fill('half'),
    ...Array<StarType>(empty).fill('empty')
  ];
}

export function categoryColor(category: string | null | undefined): string {
  return CATEGORY_COLORS[category ?? ''] ?? '#666666';
}

export function categoryEmoji(category: string | null | undefined): string {
  return CATEGORY_EMOJI[category ?? ''] ?? '🍽️';
}
