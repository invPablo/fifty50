export type CurrencyCode = 'EUR' | 'USD' | 'GBP';

export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'housing'
  | 'leisure'
  | 'shopping'
  | 'other';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  splitBetween: string[];
  category: ExpenseCategory;
  date: string;
}

export interface Group {
  id: string;
  name: string;
  members: string[];
  youAre: string;
  currency: CurrencyCode;
  expenses: Expense[];
  createdAt: string;
}

export interface Balance {
  [member: string]: number;
}

export interface SettlementTransaction {
  from: string;
  to: string;
  amount: number;
}
