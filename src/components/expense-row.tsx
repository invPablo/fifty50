import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { Categories } from '@/constants/categories';
import { useTheme } from '@/hooks/use-theme';
import type { Expense, GroupMember } from '@/types/models';

interface ExpenseRowProps {
  expense: Expense;
  symbol: string;
  membersById: Record<string, GroupMember>;
  currentMemberId?: string;
}

export function ExpenseRow({ expense, symbol, membersById, currentMemberId }: ExpenseRowProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const category = Categories.find((c) => c.id === expense.category);
  const payer = membersById[expense.paidBy];
  const payerName = payer?.displayName ?? '?';
  const categoryColor = category?.color ?? theme.accent;

  const isPayer = !!currentMemberId && currentMemberId === expense.paidBy;
  const mySplit = currentMemberId
    ? expense.splits.find((s) => s.groupMemberId === currentMemberId)
    : undefined;
  const involved = isPayer || !!mySplit;
  // What this expense did to *your* balance: what you fronted minus your own
  // share. Positive = you lent the rest of the group money; negative = you
  // owe your share to whoever paid.
  const net = (isPayer ? expense.amount : 0) - (mySplit?.shareAmount ?? 0);

  const meta = isPayer
    ? t('expenseRow.youPaid', { amount: `${symbol}${expense.amount.toFixed(2)}` })
    : t('expenseRow.paid', { name: payerName, amount: `${symbol}${expense.amount.toFixed(2)}` });

  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: categoryColor + '22' }]}>
        <Feather name={(category?.icon ?? 'box') as any} size={18} color={categoryColor} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.description, { color: theme.text }]}>{expense.description}</Text>
        <Text style={[styles.meta, { color: theme.textSecondary }]}>{meta}</Text>
      </View>
      {involved && net > 0.01 ? (
        <View style={styles.amountStack}>
          <Text style={[styles.amountLabel, { color: theme.credit }]}>{t('expenseRow.lent')}</Text>
          <Text style={[styles.amount, { color: theme.credit }]}>
            {symbol}
            {net.toFixed(2)}
          </Text>
        </View>
      ) : involved && net < -0.01 ? (
        <View style={styles.amountStack}>
          <Text style={[styles.amountLabel, { color: theme.debt }]}>{t('expenseRow.owe')}</Text>
          <Text style={[styles.amount, { color: theme.debt }]}>
            {symbol}
            {Math.abs(net).toFixed(2)}
          </Text>
        </View>
      ) : (
        <Text style={[styles.amount, { color: theme.text }]}>
          {symbol}
          {expense.amount.toFixed(2)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  description: {
    fontSize: 15,
    fontWeight: '600',
  },
  meta: {
    fontSize: 12,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
  amountStack: {
    alignItems: 'flex-end',
    gap: 2,
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});
