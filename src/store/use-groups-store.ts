import { create } from 'zustand';

import { supabase } from '@/lib/supabase';
import type {
  Balance,
  CurrencyCode,
  Expense,
  ExpenseCategory,
  Group,
  GroupMember,
  GroupType,
  Settlement,
  SettlementTransaction,
} from '@/types/models';

const GROUP_SELECT = `
  id, name, currency, group_type, created_at,
  group_members ( id, user_id, invited_email, display_name ),
  expenses (
    id, description, amount, paid_by, category, date,
    expense_splits ( group_member_id, share_amount )
  ),
  settlements ( id, from_member_id, to_member_id, amount, note, date )
`;

function mapGroup(row: any): Group {
  return {
    id: row.id,
    name: row.name,
    type: row.group_type,
    currency: row.currency,
    createdAt: row.created_at,
    members: (row.group_members ?? []).map(
      (m: any): GroupMember => ({
        id: m.id,
        userId: m.user_id,
        invitedEmail: m.invited_email,
        displayName: m.display_name,
      })
    ),
    expenses: (row.expenses ?? []).map(
      (e: any): Expense => ({
        id: e.id,
        description: e.description,
        amount: Number(e.amount),
        paidBy: e.paid_by,
        category: e.category,
        date: e.date,
        splits: (e.expense_splits ?? []).map((s: any) => ({
          groupMemberId: s.group_member_id,
          shareAmount: Number(s.share_amount),
        })),
      })
    ),
    settlements: (row.settlements ?? []).map(
      (s: any): Settlement => ({
        id: s.id,
        from: s.from_member_id,
        to: s.to_member_id,
        amount: Number(s.amount),
        note: s.note,
        date: s.date,
      })
    ),
  };
}

// Splits amount evenly across memberIds in integer cents, then assigns the
// leftover cents (from rounding) to the payer's own split — keeps the sum of
// shares exactly equal to amount, which the DB's numeric(12,2) columns need.
function computeEvenSplits(amount: number, memberIds: string[], paidBy: string) {
  const totalCents = Math.round(amount * 100);
  const n = memberIds.length;
  const baseCents = Math.floor(totalCents / n);
  const remainderCents = totalCents - baseCents * n;
  const payerIndex = memberIds.indexOf(paidBy);
  const remainderIndex = payerIndex >= 0 ? payerIndex : 0;

  return memberIds.map((groupMemberId, i) => ({
    groupMemberId,
    shareAmount: (baseCents + (i === remainderIndex ? remainderCents : 0)) / 100,
  }));
}

interface GroupsState {
  groups: Group[];
  loading: boolean;
  fetchGroups: () => Promise<void>;
  fetchGroupDetail: (groupId: string) => Promise<Group | undefined>;
  getGroup: (groupId: string) => Group | undefined;
  addGroup: (
    name: string,
    currency: CurrencyCode,
    displayName: string,
    groupType: GroupType
  ) => Promise<string>;
  deleteGroup: (groupId: string) => Promise<void>;
  addMember: (groupId: string, email: string, displayName: string) => Promise<void>;
  addExpense: (
    groupId: string,
    expense: {
      description: string;
      amount: number;
      paidBy: string;
      splitBetween: string[];
      category: ExpenseCategory;
    }
  ) => Promise<void>;
  addSettlement: (
    groupId: string,
    fromMemberId: string,
    toMemberId: string,
    amount: number,
    note?: string
  ) => Promise<void>;
  calculateDebts: (group: Group) => {
    balances: Balance;
    transactions: SettlementTransaction[];
  };
}

export const useGroupsStore = create<GroupsState>((set, get) => ({
  groups: [],
  loading: false,

  fetchGroups: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('groups')
      .select(GROUP_SELECT)
      .order('created_at', { ascending: true });
    set({ loading: false });
    if (error) throw error;
    set({ groups: (data ?? []).map(mapGroup) });
  },

  fetchGroupDetail: async (groupId) => {
    const { data, error } = await supabase
      .from('groups')
      .select(GROUP_SELECT)
      .eq('id', groupId)
      .single();
    if (error) return undefined;
    const group = mapGroup(data);
    set((state) => ({
      groups: state.groups.some((g) => g.id === group.id)
        ? state.groups.map((g) => (g.id === group.id ? group : g))
        : [...state.groups, group],
    }));
    return group;
  },

  getGroup: (groupId) => get().groups.find((g) => g.id === groupId),

  addGroup: async (name, currency, displayName, groupType) => {
    const { data, error } = await supabase.rpc('create_group_with_creator', {
      p_name: name,
      p_currency: currency,
      p_display_name: displayName,
      p_group_type: groupType,
    });
    if (error) throw error;
    await get().fetchGroups();
    return data.id as string;
  },

  deleteGroup: async (groupId) => {
    // Delete in order: expense_splits → expenses → settlements → group_members → group
    // This ensures referential integrity even without cascading deletes
    const { error: splitsError } = await supabase
      .from('expense_splits')
      .delete()
      .in('expense_id',
        (await supabase
          .from('expenses')
          .select('id')
          .eq('group_id', groupId)).data?.map(e => e.id) ?? []
      );
    if (splitsError) throw splitsError;

    const { error: expensesError } = await supabase
      .from('expenses')
      .delete()
      .eq('group_id', groupId);
    if (expensesError) throw expensesError;

    const { error: settlementsError } = await supabase
      .from('settlements')
      .delete()
      .eq('group_id', groupId);
    if (settlementsError) throw settlementsError;

    const { error: membersError } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId);
    if (membersError) throw membersError;

    const { error: groupError } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId);
    if (groupError) throw groupError;

    set((state) => ({ groups: state.groups.filter((g) => g.id !== groupId) }));
  },

  addMember: async (groupId, email, displayName) => {
    const normalizedEmail = email.trim().toLowerCase();
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, display_name')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    const resolvedDisplayName =
      displayName.trim() || profile?.display_name || normalizedEmail.split('@')[0];

    const { error } = profile
      ? await supabase
          .from('group_members')
          .insert({ group_id: groupId, user_id: profile.id, display_name: resolvedDisplayName })
      : await supabase
          .from('group_members')
          .insert({ group_id: groupId, invited_email: normalizedEmail, display_name: resolvedDisplayName });

    if (error) throw error;
    await get().fetchGroupDetail(groupId);
  },

  addExpense: async (groupId, expense) => {
    const { data: userData } = await supabase.auth.getUser();
    const createdBy = userData.user?.id;
    if (!createdBy) throw new Error('No hay sesión activa.');

    const { data: insertedExpense, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        group_id: groupId,
        description: expense.description,
        amount: expense.amount,
        paid_by: expense.paidBy,
        category: expense.category,
        created_by: createdBy,
      })
      .select('id')
      .single();
    if (expenseError) throw expenseError;

    const splits = computeEvenSplits(expense.amount, expense.splitBetween, expense.paidBy);
    const { error: splitsError } = await supabase.from('expense_splits').insert(
      splits.map((s) => ({
        expense_id: insertedExpense.id,
        group_member_id: s.groupMemberId,
        share_amount: s.shareAmount,
      }))
    );
    if (splitsError) throw splitsError;

    await get().fetchGroupDetail(groupId);
  },

  addSettlement: async (groupId, fromMemberId, toMemberId, amount, note) => {
    const { data: userData } = await supabase.auth.getUser();
    const createdBy = userData.user?.id;
    if (!createdBy) throw new Error('No hay sesión activa.');

    const { error } = await supabase.from('settlements').insert({
      group_id: groupId,
      from_member_id: fromMemberId,
      to_member_id: toMemberId,
      amount,
      note: note || null,
      created_by: createdBy,
    });
    if (error) throw error;

    await get().fetchGroupDetail(groupId);
  },

  calculateDebts: (group) => {
    const balances: Balance = {};
    group.members.forEach((member) => {
      balances[member.id] = 0;
    });

    group.expenses.forEach((expense) => {
      balances[expense.paidBy] = (balances[expense.paidBy] ?? 0) + expense.amount;
      expense.splits.forEach((split) => {
        balances[split.groupMemberId] = (balances[split.groupMemberId] ?? 0) - split.shareAmount;
      });
    });

    // A recorded payment from A to B mirrors a debt: it raises A's balance
    // (they paid down what they owed) and lowers B's (they were paid back).
    group.settlements.forEach((settlement) => {
      balances[settlement.from] = (balances[settlement.from] ?? 0) + settlement.amount;
      balances[settlement.to] = (balances[settlement.to] ?? 0) - settlement.amount;
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
