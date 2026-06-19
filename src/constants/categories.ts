import type { ExpenseCategory } from '@/types/models';

export const Categories: { id: ExpenseCategory; label: string; icon: string }[] = [
  { id: 'food', label: 'Comida', icon: 'coffee' },
  { id: 'transport', label: 'Transporte', icon: 'navigation' },
  { id: 'housing', label: 'Alojamiento', icon: 'home' },
  { id: 'leisure', label: 'Ocio', icon: 'music' },
  { id: 'shopping', label: 'Compras', icon: 'shopping-bag' },
  { id: 'other', label: 'Otros', icon: 'box' },
];
