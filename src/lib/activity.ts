import { currencySymbol } from '@/constants/currencies';
import type { Group } from '@/types/models';

export interface ActivityItem {
  id: string;
  date: string;
  groupId: string;
  groupName: string;
  text: string;
}

// Derived straight from already-loaded expenses/settlements — no separate
// "activity" table needed. Re-sorted across all groups by date desc.
export function buildActivityFeed(groups: Group[]): ActivityItem[] {
  const items: ActivityItem[] = [];

  for (const group of groups) {
    const membersById = Object.fromEntries(group.members.map((m) => [m.id, m]));
    const symbol = currencySymbol(group.currency);

    for (const expense of group.expenses) {
      const payer = membersById[expense.paidBy]?.displayName ?? 'Alguien';
      items.push({
        id: `expense-${expense.id}`,
        date: expense.date,
        groupId: group.id,
        groupName: group.name,
        text: `${payer} añadió "${expense.description}" (${symbol}${expense.amount.toFixed(2)}) en ${group.name}`,
      });
    }

    for (const settlement of group.settlements) {
      const from = membersById[settlement.from]?.displayName ?? 'Alguien';
      const to = membersById[settlement.to]?.displayName ?? 'alguien';
      items.push({
        id: `settlement-${settlement.id}`,
        date: settlement.date,
        groupId: group.id,
        groupName: group.name,
        text: `${from} saldó ${symbol}${settlement.amount.toFixed(2)} con ${to} en ${group.name}`,
      });
    }
  }

  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
