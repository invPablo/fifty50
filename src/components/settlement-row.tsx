import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { GroupMember, SettlementTransaction } from '@/types/models';

interface SettlementRowProps {
  transaction: SettlementTransaction;
  symbol: string;
  membersById: Record<string, GroupMember>;
}

export function SettlementRow({ transaction, symbol, membersById }: SettlementRowProps) {
  const theme = useTheme();
  const from = membersById[transaction.from];
  const to = membersById[transaction.to];

  return (
    <View style={[styles.row, { backgroundColor: theme.accentSoft }]}>
      <View style={styles.identity}>
        <Avatar id={transaction.from} name={from?.displayName ?? '?'} size={26} />
        <Text style={[styles.text, { color: theme.text }]}>
          <Text style={styles.bold}>{from?.displayName ?? '?'}</Text> le paga a{' '}
          <Text style={styles.bold}>{to?.displayName ?? '?'}</Text>
        </Text>
        <Avatar id={transaction.to} name={to?.displayName ?? '?'} size={26} />
      </View>
      <View style={styles.amountWrap}>
        <Text style={[styles.amount, { color: theme.accent, fontFamily: Fonts.bold }]}>
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
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    flexWrap: 'wrap',
  },
  text: {
    fontSize: 14,
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
  },
});
