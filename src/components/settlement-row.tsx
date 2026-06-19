import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import type { SettlementTransaction } from '@/types/models';

interface SettlementRowProps {
  transaction: SettlementTransaction;
  symbol: string;
}

export function SettlementRow({ transaction, symbol }: SettlementRowProps) {
  const theme = useTheme();

  return (
    <View style={[styles.row, { backgroundColor: theme.accentSoft }]}>
      <Text style={[styles.text, { color: theme.text }]}>
        <Text style={styles.bold}>{transaction.from}</Text> le paga a{' '}
        <Text style={styles.bold}>{transaction.to}</Text>
      </Text>
      <View style={styles.amountWrap}>
        <Text style={[styles.amount, { color: theme.accent }]}>
          {symbol}
          {transaction.amount.toFixed(2)}
        </Text>
        <Feather name="arrow-up-right" size={16} color={theme.accent} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    flex: 1,
  },
  bold: {
    fontWeight: '700',
  },
  amountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
});
