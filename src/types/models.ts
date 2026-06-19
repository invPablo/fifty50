export type CurrencyCode = 'EUR' | 'USD' | 'GBP';

export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'housing'
  | 'leisure'
  | 'shopping'
  | 'other';

export interface Profile {
  id: string;
  email: string;
  displayName: string | null;
}

// id is group_members.id — expenses/splits key on this, not on userId,
// so a pending invite (no account yet) can still be "who paid".
export interface GroupMember {
  id: string;
  userId: string | null;
  invitedEmail: string | null;
  displayName: string;
}

export interface ExpenseSplit {
  groupMemberId: string;
  shareAmount: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string; // group_members.id
  splits: ExpenseSplit[];
  category: ExpenseCategory;
  date: string;
}

export interface Group {
  id: string;
  name: string;
  members: GroupMember[];
  currency: CurrencyCode;
  expenses: Expense[];
  createdAt: string;
}

export interface Balance {
  [groupMemberId: string]: number;
}

export interface SettlementTransaction {
  from: string; // group_members.id
  to: string; // group_members.id
  amount: number;
}
