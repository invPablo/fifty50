import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Categories } from '@/constants/categories';
import { useTheme } from '@/hooks/use-theme';
import type { Expense, GroupMember } from '@/types/models';

interface ExpenseRowProps {
  expense: Expense;
  symbol: string;
  membersById: Record<string, GroupMember>;
}

export function ExpenseRow({ expense, symbol, membersById }: ExpenseRowProps) {
  const theme = useTheme();
  const category = Categories.find((c) => c.id === expense.category);
  const payerName = membersById[expense.paidBy]?.displayName ?? '?';
  const categoryColor = category?.color ?? theme.accent;

  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: categoryColor + '22' }]}>
        <Feather name={(category?.icon ?? 'box') as any} size={18} color={categoryColor} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.description, { color: theme.text }]}>{expense.description}</Text>
        <Text style={[styles.meta, { color: theme.textSecondary }]}>
          Pagado por {payerName} · entre {expense.splits.length}
        </Text>
      </View>
      <Text style={[styles.amount, { color: theme.text }]}>
        {symbol}
        {expense.amount.toFixed(2)}
      </Text>
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
});
