import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Dimensions, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CreateGroupSheet } from '@/components/create-group-sheet';
import { GROUP_CARD_WIDTH, GroupCard } from '@/components/group-card';
import { PaywallSheet } from '@/components/paywall-sheet';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getDaysUntilExpiry } from '@/lib/email-verification';
import { supabase } from '@/lib/supabase';
import { useGroupsStore } from '@/store/use-groups-store';
import { useSession } from '@/hooks/use-session';

const CARD_GAP = 14;
const SIDE_INSET = Math.max((Dimensions.get('window').width - GROUP_CARD_WIDTH) / 2, 20);

export default function GroupsListScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { session } = useSession();
  const groups = useGroupsStore((s) => s.groups);
  const fetchGroups = useGroupsStore((s) => s.fetchGroups);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);

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
        <View>
          <Text style={[styles.title, { color: theme.text, fontFamily: Fonts.heading }]}>
            Hola, {userName}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Bienvenido a Tranzfr
          </Text>
        </View>
        <View style={styles.headerActions}>
          <View style={styles.fabGlowWrap}>
            <View style={[styles.fabGlow, { backgroundColor: theme.accent }]} />
            <Pressable
              onPress={() => setSheetVisible(true)}
              style={({ pressed }) => [styles.fab, { backgroundColor: theme.accent, opacity: pressed ? 0.85 : 1 }]}
            >
              <Feather name="plus" size={22} color="#FFFFFF" />
            </Pressable>
          </View>
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
            onPress={() => setSheetVisible(true)}
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
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={GROUP_CARD_WIDTH + CARD_GAP}
          decelerationRate="fast"
          contentContainerStyle={[styles.list, { paddingHorizontal: SIDE_INSET }]}
          ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
          renderItem={({ item }) => (
            <GroupCard
              group={item}
              onPress={() => router.push({ pathname: '/group/[id]', params: { id: item.id } })}
            />
          )}
        />
      )}

      <CreateGroupSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onPremiumRequired={() => setPaywallVisible(true)}
      />
      <PaywallSheet visible={paywallVisible} onClose={() => setPaywallVisible(false)} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  title: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconButton: {
    padding: 4,
  },
  fabGlowWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.3,
  },
  fab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 6px 16px rgba(0,0,0,0.25)',
    elevation: 4,
  },
  list: {
    paddingTop: 8,
    paddingBottom: 110,
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
