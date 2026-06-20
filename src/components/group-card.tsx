import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import { currencySymbol } from '@/constants/currencies';
import { getAvatarColor } from '@/lib/avatar';
import { useSession } from '@/hooks/use-session';
import { useTheme } from '@/hooks/use-theme';
import { useGroupsStore } from '@/store/use-groups-store';
import type { Group } from '@/types/models';

interface GroupCardProps {
  group: Group;
  onPress: () => void;
}

export function GroupCard({ group, onPress }: GroupCardProps) {
  const theme = useTheme();
  const { session } = useSession();
  const calculateDebts = useGroupsStore((s) => s.calculateDebts);
  const { balances } = calculateDebts(group);
  const myMember = group.members.find((m) => m.userId === session?.user.id);
  const yourBalance = myMember ? balances[myMember.id] ?? 0 : 0;
  const symbol = currencySymbol(group.currency);
  const accentColor = getAvatarColor(group.id);

  const isCredit = yourBalance > 0.01;
  const isDebt = yourBalance < -0.01;
  const balanceColor = isCredit ? theme.credit : isDebt ? theme.debt : theme.textSecondary;
  const pillBackground = isCredit ? theme.creditSoft : isDebt ? theme.debtSoft : undefined;
  const balanceLabel = isCredit
    ? `Te deben ${symbol}${yourBalance.toFixed(2)}`
    : isDebt
      ? `Debes ${symbol}${Math.abs(yourBalance).toFixed(2)}`
      : 'Saldado';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: accentColor + '22' }]}>
        <Feather name={group.type === 'roommates' ? 'home' : 'map-pin'} size={20} color={accentColor} />
      </View>
      <Text style={[styles.name, { color: theme.text, fontFamily: Fonts.bold }]} numberOfLines={2}>
        {group.name}
      </Text>
      <Text style={[styles.meta, { color: theme.textSecondary }]}>
        {group.members.length} miembros · {group.expenses.length} gastos
      </Text>
      <View style={[styles.balancePill, pillBackground ? { backgroundColor: pillBackground } : null]}>
        <Text style={[styles.balance, { color: balanceColor, fontFamily: Fonts.bold }]} numberOfLines={1}>
          {balanceLabel}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 8,
    minHeight: 150,
    boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: 16,
    lineHeight: 20,
  },
  meta: {
    fontSize: 12,
    flex: 1,
  },
  balancePill: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 'auto',
  },
  balance: {
    fontSize: 13,
  },
});
