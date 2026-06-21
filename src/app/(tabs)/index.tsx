import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActivitySheet } from '@/components/activity-sheet';
import { GlobalBalanceCard, type CurrencyTotal } from '@/components/global-balance-card';
import { GroupStack } from '@/components/group-stack';
import { currencySymbol } from '@/constants/currencies';
import { Fonts } from '@/constants/theme';
import { useActivityFeed } from '@/hooks/use-activity-feed';
import { useTheme } from '@/hooks/use-theme';
import { getDaysUntilExpiry } from '@/lib/email-verification';
import { useGroupsStore } from '@/store/use-groups-store';
import { useUiStore } from '@/store/use-ui-store';
import { useSession } from '@/hooks/use-session';
import type { CurrencyCode } from '@/types/models';

export default function GroupsListScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { session } = useSession();
  const groups = useGroupsStore((s) => s.groups);
  const fetchGroups = useGroupsStore((s) => s.fetchGroups);
  const calculateDebts = useGroupsStore((s) => s.calculateDebts);
  const openCreateGroupSheet = useUiStore((s) => s.openCreateGroupSheet);
  const { items: activityItems, unreadCount, markAllRead } = useActivityFeed(groups);
  const [activityVisible, setActivityVisible] = useState(false);

  const userName =
    session?.user?.user_metadata?.display_name || session?.user?.email?.split('@')[0] || 'ahí';

  const emailVerificationDays = session?.user?.created_at
    ? getDaysUntilExpiry(session.user.created_at)
    : null;
  const showEmailWarning =
    emailVerificationDays !== null &&
    emailVerificationDays > 0 &&
    emailVerificationDays <= 7 &&
    !session?.user?.email_confirmed_at;

  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, [fetchGroups])
  );

  const totalsByCurrency = new Map<CurrencyCode, { owed: number; owe: number }>();
  for (const group of groups) {
    const myMember = group.members.find((m) => m.userId === session?.user.id);
    if (!myMember) continue;
    const { balances } = calculateDebts(group);
    const value = balances[myMember.id] ?? 0;
    const entry = totalsByCurrency.get(group.currency) ?? { owed: 0, owe: 0 };
    if (value > 0.01) entry.owed += value;
    else if (value < -0.01) entry.owe += Math.abs(value);
    totalsByCurrency.set(group.currency, entry);
  }
  const totals: CurrencyTotal[] = Array.from(totalsByCurrency.entries()).map(
    ([currency, { owed, owe }]) => ({ currency, symbol: currencySymbol(currency), owed, owe })
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {showEmailWarning && (
        <View style={[styles.emailWarning, { backgroundColor: theme.debtSoft }]}>
          <Feather name="alert-circle" size={18} color={theme.debt} />
          <View style={styles.emailWarningContent}>
            <Text style={[styles.emailWarningTitle, { color: theme.debt, fontFamily: Fonts.bold }]}>
              Verifica tu email
            </Text>
            <Text style={[styles.emailWarningText, { color: theme.debt }]}>
              {emailVerificationDays} día{emailVerificationDays === 1 ? '' : 's'} restante{emailVerificationDays === 1 ? '' : 's'}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.header}>
        <View style={[styles.headerGlow, { backgroundColor: theme.accent }]} pointerEvents="none" />
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: theme.text, fontFamily: Fonts.heading }]}>
              Hola, {userName}
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Bienvenido a Tranzfr
            </Text>
          </View>
          <Pressable
            onPress={() => {
              setActivityVisible(true);
              markAllRead();
            }}
            hitSlop={8}
            style={({ pressed }) => [styles.bellButton, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Feather name="bell" size={20} color={theme.text} />
            {unreadCount > 0 && (
              <View style={[styles.bellBadge, { backgroundColor: theme.debt }]}>
                <Text style={styles.bellBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {groups.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIconWrap, { backgroundColor: theme.accentSoft }]}>
            <Feather name="users" size={36} color={theme.accent} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.text, fontFamily: Fonts.bold }]}>
            Aún no tienes grupos
          </Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Crea el primero para empezar a repartir gastos con tus amigos.
          </Text>
          <Pressable
            onPress={openCreateGroupSheet}
            style={({ pressed }) => [
              styles.emptyCta,
              { backgroundColor: theme.accent, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Feather name="plus" size={18} color="#FFFFFF" />
            <Text style={styles.emptyCtaText}>Crear tu primer grupo</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.stackWrap}>
          <GroupStack
            groups={groups}
            onOpenGroup={(id) => router.push({ pathname: '/group/[id]', params: { id } })}
          />
          <View style={styles.balanceWrap}>
            <GlobalBalanceCard totals={totals} />
          </View>
        </View>
      )}

      <ActivitySheet
        visible={activityVisible}
        onClose={() => setActivityVisible(false)}
        items={activityItems}
        onOpenGroup={(groupId) => router.push({ pathname: '/group/[id]', params: { id: groupId } })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emailWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 8,
  },
  emailWarningContent: {
    flex: 1,
    gap: 2,
  },
  emailWarningTitle: {
    fontSize: 13,
  },
  emailWarningText: {
    fontSize: 12,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    overflow: 'hidden',
  },
  headerGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -140,
    right: -60,
    opacity: 0.15,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  stackWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 110,
  },
  balanceWrap: {
    paddingHorizontal: 24,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 8,
  },
  emptyIconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 17,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 12,
  },
  emptyCtaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
