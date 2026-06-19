import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { currencySymbol } from '@/constants/currencies';
import { useTheme } from '@/hooks/use-theme';
import { useGroupsStore } from '@/store/use-groups-store';
import type { Group } from '@/types/models';

interface GroupCardProps {
  group: Group;
  onPress: () => void;
}

export function GroupCard({ group, onPress }: GroupCardProps) {
  const theme = useTheme();
  const calculateDebts = useGroupsStore((s) => s.calculateDebts);
  const { balances } = calculateDebts(group.id);
  const yourBalance = balances[group.youAre] ?? 0;
  const symbol = currencySymbol(group.currency);

  const balanceColor =
    yourBalance > 0.01 ? theme.credit : yourBalance < -0.01 ? theme.debt : theme.textSecondary;
  const balanceLabel =
    yourBalance > 0.01
      ? `Te deben ${symbol}${yourBalance.toFixed(2)}`
      : yourBalance < -0.01
        ? `Debes ${symbol}${Math.abs(yourBalance).toFixed(2)}`
        : 'Saldado';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.card, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.text }]}>{group.name}</Text>
        <Text style={[styles.meta, { color: theme.textSecondary }]}>
          {group.members.length} miembros · {group.expenses.length} gastos
        </Text>
        <Text style={[styles.balance, { color: balanceColor }]}>{balanceLabel}</Text>
      </View>
      <Feather name="chevron-right" size={20} color={theme.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  info: {
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    fontSize: 13,
  },
  balance: {
    fontSize: 13,
    fontWeight: '600',
  },
});
