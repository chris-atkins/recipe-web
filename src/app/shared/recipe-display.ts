// Category colour/emoji helpers shared by the recipe card, preview, and save form.

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

export function categoryColor(category: string | null | undefined): string {
  return CATEGORY_COLORS[category ?? ''] ?? '#666666';
}

export function categoryEmoji(category: string | null | undefined): string {
  return CATEGORY_EMOJI[category ?? ''] ?? '🍽️';
}
