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
  variant?: 'suggested' | 'recorded';
}

export function SettlementRow({
  transaction,
  symbol,
  membersById,
  variant = 'suggested',
}: SettlementRowProps) {
  const theme = useTheme();
  const from = membersById[transaction.from];
  const to = membersById[transaction.to];
  const recorded = variant === 'recorded';
  const background = recorded ? theme.creditSoft : theme.accentSoft;
  const accent = recorded ? theme.credit : theme.accent;
  const verb = recorded ? 'le pagó a' : 'le paga a';

  return (
    <View style={[styles.row, { backgroundColor: background }]}>
      <View style={styles.identity}>
        <Avatar id={transaction.from} name={from?.displayName ?? '?'} size={26} />
        <Text style={[styles.text, { color: theme.text }]}>
          <Text style={styles.bold}>{from?.displayName ?? '?'}</Text> {verb}{' '}
          <Text style={styles.bold}>{to?.displayName ?? '?'}</Text>
        </Text>
        <Avatar id={transaction.to} name={to?.displayName ?? '?'} size={26} />
      </View>
      <View style={styles.amountWrap}>
        <Text style={[styles.amount, { color: accent, fontFamily: Fonts.bold }]}>
          {symbol}
          {transaction.amount.toFixed(2)}
        </Text>
        <Feather name={recorded ? 'check-circle' : 'arrow-up-right'} size={16} color={accent} />
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
