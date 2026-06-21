import { StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { CurrencyCode } from '@/types/models';

export interface CurrencyTotal {
  currency: CurrencyCode;
  symbol: string;
  owed: number;
  owe: number;
}

interface GlobalBalanceCardProps {
  totals: CurrencyTotal[];
}

export function GlobalBalanceCard({ totals }: GlobalBalanceCardProps) {
  const theme = useTheme();

  if (totals.length === 0) return null;

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      {totals.map((t) => (
        <View key={t.currency} style={styles.row}>
          <View style={styles.col}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Te deben</Text>
            <Text style={[styles.amount, { color: theme.credit, fontFamily: Fonts.heading }]}>
              {t.symbol}
              {t.owed.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.col}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Debes</Text>
            <Text style={[styles.amount, { color: theme.debt, fontFamily: Fonts.heading }]}>
              {t.symbol}
              {t.owe.toFixed(2)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 14,
    marginTop: 18,
    boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  col: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  divider: {
    width: 1,
    height: 32,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  amount: {
    fontSize: 19,
  },
});
