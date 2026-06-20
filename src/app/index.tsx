import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CreateGroupSheet } from '@/components/create-group-sheet';
import { GroupCard } from '@/components/group-card';
import { PaywallSheet } from '@/components/paywall-sheet';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getDaysUntilExpiry } from '@/lib/email-verification';
import { supabase } from '@/lib/supabase';
import { useGroupsStore } from '@/store/use-groups-store';
import { useSession } from '@/hooks/use-session';

export default function GroupsListScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { session } = useSession();
  const groups = useGroupsStore((s) => s.groups);
  const fetchGroups = useGroupsStore((s) => s.fetchGroups);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);

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
        <Text style={[styles.title, { color: theme.text, fontFamily: Fonts.heading }]}>
          Tus grupos
        </Text>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => router.push('/profile')}
            hitSlop={8}
            style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Feather name="user" size={20} color={theme.textSecondary} />
          </Pressable>
          <Pressable
            onPress={() => setSheetVisible(true)}
            style={({ pressed }) => [styles.fab, { backgroundColor: theme.accent, opacity: pressed ? 0.8 : 1 }]}
          >
            <Feather name="plus" size={22} color="#FFFFFF" />
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
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
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
  },
  title: {
    fontSize: 26,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconButton: {
    padding: 4,
  },
  fab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  row: {
    gap: 12,
    marginBottom: 12,
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
