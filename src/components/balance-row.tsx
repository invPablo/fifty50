import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { GroupMember } from '@/types/models';

interface BalanceRowProps {
  member: GroupMember;
  amount: number;
  symbol: string;
}

export function BalanceRow({ member, amount, symbol }: BalanceRowProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const color = amount > 0.01 ? theme.credit : amount < -0.01 ? theme.debt : theme.textSecondary;
  const sign = amount > 0 ? '+' : amount < 0 ? '-' : '';
  const label = member.userId
    ? member.displayName
    : t('balanceRow.pending', { name: member.displayName });

  return (
    <View style={styles.row}>
      <View style={styles.identity}>
        <Avatar id={member.id} name={member.displayName} size={30} />
        <Text style={[styles.member, { color: theme.text }]}>{label}</Text>
      </View>
      <Text style={[styles.amount, { color, fontFamily: Fonts.bold }]}>
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
    alignItems: 'center',
    paddingVertical: 10,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  member: {
    fontSize: 15,
    fontWeight: '500',
  },
  amount: {
    fontSize: 15,
  },
});
