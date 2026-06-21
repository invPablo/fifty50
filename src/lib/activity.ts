import type { TFunction } from 'i18next';

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
export function buildActivityFeed(groups: Group[], t: TFunction): ActivityItem[] {
  const items: ActivityItem[] = [];

  for (const group of groups) {
    const membersById = Object.fromEntries(group.members.map((m) => [m.id, m]));
    const symbol = currencySymbol(group.currency);

    for (const expense of group.expenses) {
      const payer = membersById[expense.paidBy]?.displayName ?? t('activity.someone');
      items.push({
        id: `expense-${expense.id}`,
        date: expense.date,
        groupId: group.id,
        groupName: group.name,
        text: t('activity.expenseAdded', {
          payer,
          description: expense.description,
          amount: `${symbol}${expense.amount.toFixed(2)}`,
          group: group.name,
        }),
      });
    }

    for (const settlement of group.settlements) {
      const from = membersById[settlement.from]?.displayName ?? t('activity.someone');
      const to = membersById[settlement.to]?.displayName ?? t('activity.someone');
      items.push({
        id: `settlement-${settlement.id}`,
        date: settlement.date,
        groupId: group.id,
        groupName: group.name,
        text: t('activity.settlementMade', {
          from,
          amount: `${symbol}${settlement.amount.toFixed(2)}`,
          to,
          group: group.name,
        }),
      });
    }
  }

  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
