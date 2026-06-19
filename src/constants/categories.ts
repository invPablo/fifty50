import type { ExpenseCategory } from '@/types/models';

export const Categories: { id: ExpenseCategory; label: string; icon: string; color: string }[] = [
  { id: 'food', label: 'Comida', icon: 'coffee', color: '#F2994A' },
  { id: 'transport', label: 'Transporte', icon: 'navigation', color: '#2D9CDB' },
  { id: 'housing', label: 'Alojamiento', icon: 'home', color: '#9B51E0' },
  { id: 'leisure', label: 'Ocio', icon: 'music', color: '#E0529B' },
  { id: 'shopping', label: 'Compras', icon: 'shopping-bag', color: '#1ABC9C' },
  { id: 'other', label: 'Otros', icon: 'box', color: '#8893A8' },
];
