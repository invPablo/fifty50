import type { ExpenseCategory } from '@/types/models';

// label is an i18n key (categories.<id>), not display text — resolve with
// t() at the call site so it follows the active language.
export const Categories: { id: ExpenseCategory; labelKey: string; icon: string; color: string }[] = [
  { id: 'food', labelKey: 'categories.food', icon: 'coffee', color: '#F2994A' },
  { id: 'transport', labelKey: 'categories.transport', icon: 'navigation', color: '#2D9CDB' },
  { id: 'housing', labelKey: 'categories.housing', icon: 'home', color: '#9B51E0' },
  { id: 'leisure', labelKey: 'categories.leisure', icon: 'music', color: '#E0529B' },
  { id: 'shopping', labelKey: 'categories.shopping', icon: 'shopping-bag', color: '#1ABC9C' },
  { id: 'other', labelKey: 'categories.other', icon: 'box', color: '#8893A8' },
];
