import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import { currencySymbol } from '@/constants/currencies';
import { getAvatarColor } from '@/lib/avatar';
import { useSession } from '@/hooks/use-session';
import { useGroupsStore } from '@/store/use-groups-store';
import type { Group } from '@/types/models';

interface GroupCardProps {
  group: Group;
  onPress: () => void;
}

export const GROUP_CARD_WIDTH = 280;
export const GROUP_CARD_HEIGHT = 340;

export function GroupCard({ group, onPress }: GroupCardProps) {
  const { session } = useSession();
  const calculateDebts = useGroupsStore((s) => s.calculateDebts);
  const { balances } = calculateDebts(group);
  const myMember = group.members.find((m) => m.userId === session?.user.id);
  const yourBalance = myMember ? balances[myMember.id] ?? 0 : 0;
  const symbol = currencySymbol(group.currency);
  const accentColor = getAvatarColor(group.id);

  const isCredit = yourBalance > 0.01;
  const isDebt = yourBalance < -0.01;
  const balanceLabel = isCredit
    ? `Te deben ${symbol}${yourBalance.toFixed(2)}`
    : isDebt
      ? `Debes ${symbol}${Math.abs(yourBalance).toFixed(2)}`
      : 'Saldado';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.92 : 1 }]}
    >
      {group.imageUrl ? (
        <Image source={{ uri: group.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: accentColor }]} />
      )}

      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.75)']}
        style={StyleSheet.absoluteFill}
      />

      {!group.imageUrl && (
        <View style={styles.iconBadge}>
          <Feather name={group.type === 'roommates' ? 'home' : 'map-pin'} size={18} color="#FFFFFF" />
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.balancePill}>
          <Text style={styles.balanceText}>{balanceLabel}</Text>
        </View>
        <Text style={[styles.name, { fontFamily: Fonts.bold }]} numberOfLines={2}>
          {group.name}
        </Text>
        <Text style={styles.meta}>
          {group.members.length} miembros · {group.expenses.length} gastos
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: GROUP_CARD_WIDTH,
    height: GROUP_CARD_HEIGHT,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#0B0B0F',
    boxShadow: '0px 14px 30px rgba(0,0,0,0.22)',
    elevation: 6,
  },
  iconBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  content: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 18,
    gap: 6,
  },
  balancePill: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  balanceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#212529',
  },
  name: {
    fontSize: 20,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  meta: {
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.85)',
  },
});
