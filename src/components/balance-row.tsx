import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

interface BalanceRowProps {
  member: string;
  amount: number;
  symbol: string;
}

export function BalanceRow({ member, amount, symbol }: BalanceRowProps) {
  const theme = useTheme();
  const color = amount > 0.01 ? theme.credit : amount < -0.01 ? theme.debt : theme.textSecondary;
  const sign = amount > 0 ? '+' : amount < 0 ? '-' : '';

  return (
    <View style={styles.row}>
      <Text style={[styles.member, { color: theme.text }]}>{member}</Text>
      <Text style={[styles.amount, { color }]}>
        {sign}
        {symbol}
        {Math.abs(amount).toFixed(2)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  member: {
    fontSize: 15,
    fontWeight: '500',
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
});
