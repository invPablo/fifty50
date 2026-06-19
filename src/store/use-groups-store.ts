import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import type {
  Balance,
  CurrencyCode,
  Expense,
  ExpenseCategory,
  Group,
  SettlementTransaction,
} from '@/types/models';

const STORAGE_KEY = 'fifty50_groups';

interface GroupsState {
  groups: Group[];
  loadGroups: () => Promise<void>;
  addGroup: (
    name: string,
    members: string[],
    currency: CurrencyCode,
    youAre: string
  ) => void;
  deleteGroup: (groupId: string) => void;
  getGroup: (groupId: string) => Group | undefined;
  addExpense: (
    groupId: string,
    expense: {
      description: string;
      amount: number;
      paidBy: string;
      splitBetween: string[];
      category: ExpenseCategory;
    }
  ) => void;
  calculateDebts: (groupId: string) => {
    balances: Balance;
    transactions: SettlementTransaction[];
  };
}

async function persist(groups: Group[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
}

export const useGroupsStore = create<GroupsState>((set, get) => ({
  groups: [],

  loadGroups: async () => {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      set({ groups: JSON.parse(data) });
    }
  },

  addGroup: (name, members, currency, youAre) => {
    const newGroup: Group = {
      id: Date.now().toString(),
      name,
      members,
      youAre,
      currency,
      expenses: [],
      createdAt: new Date().toISOString(),
    };
    const groups = [...get().groups, newGroup];
    set({ groups });
    persist(groups);
  },

  deleteGroup: (groupId) => {
    const groups = get().groups.filter((g) => g.id !== groupId);
    set({ groups });
    persist(groups);
  },

  getGroup: (groupId) => get().groups.find((g) => g.id === groupId),

  addExpense: (groupId, expense) => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...expense,
    };
    const groups = get().groups.map((group) =>
      group.id === groupId
        ? { ...group, expenses: [...group.expenses, newExpense] }
        : group
    );
    set({ groups });
    persist(groups);
  },

  calculateDebts: (groupId) => {
    const group = get().getGroup(groupId);
    if (!group) return { balances: {}, transactions: [] };

    const balances: Balance = {};
    group.members.forEach((member) => {
      balances[member] = 0;
    });

    group.expenses.forEach((expense) => {
      const share = expense.amount / expense.splitBetween.length;
      balances[expense.paidBy] += expense.amount;
      expense.splitBetween.forEach((person) => {
        balances[person] -= share;
      });
    });

    const debtors = Object.entries(balances)
      .filter(([, amount]) => amount < -0.01)
      .map(([person, amount]) => ({ person, amount: Math.abs(amount) }));

    const creditors = Object.entries(balances)
      .filter(([, amount]) => amount > 0.01)
      .map(([person, amount]) => ({ person, amount }));

    const transactions: SettlementTransaction[] = [];
    debtors.forEach((debtor) => {
      let remaining = debtor.amount;
      while (remaining > 0.01 && creditors.length > 0) {
        const creditor = creditors[0];
        const transfer = Math.min(remaining, creditor.amount);
        transactions.push({
          from: debtor.person,
          to: creditor.person,
          amount: Math.round(transfer * 100) / 100,
        });
        remaining -= transfer;
        creditor.amount -= transfer;
        if (creditor.amount < 0.01) creditors.shift();
      }
    });

    return { balances, transactions };
  },
}));
