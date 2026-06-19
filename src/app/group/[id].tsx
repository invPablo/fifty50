import { Feather } from '@expo/vector-icons';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';

import { AddExpenseSheet } from '@/components/add-expense-sheet';
import { BalanceRow } from '@/components/balance-row';
import { ExpenseRow } from '@/components/expense-row';
import { SettlementRow } from '@/components/settlement-row';
import { currencySymbol } from '@/constants/currencies';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useGroupsStore } from '@/store/use-groups-store';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const group = useGroupsStore((s) => s.getGroup(id));
  const fetchGroupDetail = useGroupsStore((s) => s.fetchGroupDetail);
  const calculateDebts = useGroupsStore((s) => s.calculateDebts);
  const deleteGroup = useGroupsStore((s) => s.deleteGroup);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchGroupDetail(id).finally(() => setLoaded(true));
    }, [id, fetchGroupDetail])
  );

  const membersById = useMemo(
    () => Object.fromEntries((group?.members ?? []).map((m) => [m.id, m])),
    [group?.members]
  );

  if (!group) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>{loaded ? 'Grupo no encontrado.' : 'Cargando…'}</Text>
      </SafeAreaView>
    );
  }

  const { balances, transactions } = calculateDebts(group);
  const symbol = currencySymbol(group.currency);
  const groupId = group.id;

  async function handleDelete() {
    try {
      await deleteGroup(groupId);
      router.replace('/');
    } catch {
      // ignore: group stays visible, user can retry
    }
  }

  function confirmDelete() {
    // Alert.alert has no effect on react-native-web, so use window.confirm there instead.
    if (Platform.OS === 'web') {
      if (window.confirm('¿Seguro que quieres eliminar este grupo? Esta acción no se puede deshacer.')) {
        handleDelete();
      }
      return;
    }
    Alert.alert(
      'Eliminar grupo',
      '¿Seguro que quieres eliminar este grupo? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: handleDelete },
      ]
    );
  }

  async function handleShare() {
    const link = `https://splitto.app/join/${groupId}`;
    try {
      await Clipboard.setStringAsync(link);
      Alert.alert('Link copiado', `Link compartible copiado al portapapeles:\n\n${link}`);
    } catch {
      Alert.alert('Error', 'No se pudo copiar el link');
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <Stack.Screen
        options={{
          title: group.name,
          headerTitleStyle: { fontFamily: Fonts.heading, fontSize: 17 },
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.actionsRow}>
          <Pressable
            onPress={handleShare}
            style={({ pressed }) => [
              styles.shareCard,
              { backgroundColor: theme.accentSoft, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name="share-2" size={20} color={theme.accent} />
            <Text style={[styles.shareText, { color: theme.accent }]}>
              Compartir link
            </Text>
          </Pressable>
          <Pressable
            onPress={confirmDelete}
            style={({ pressed }) => [
              styles.deleteCard,
              { backgroundColor: theme.debtSoft, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name="trash-2" size={20} color={theme.debt} />
          </Pressable>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Balances</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {group.members.map((member) => (
            <BalanceRow
              key={member.id}
              member={member}
              amount={balances[member.id] ?? 0}
              symbol={symbol}
            />
          ))}
        </View>

        {transactions.length > 0 ? (
          <>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              Para saldar cuentas
            </Text>
            {transactions.map((t, i) => (
              <SettlementRow key={i} transaction={t} symbol={symbol} membersById={membersById} />
            ))}
          </>
        ) : group.expenses.length > 0 ? (
          <View style={[styles.settledCard, { backgroundColor: theme.creditSoft }]}>
            <Feather name="check-circle" size={20} color={theme.credit} />
            <Text style={[styles.settledText, { color: theme.credit, fontFamily: Fonts.bold }]}>
              Todo saldado
            </Text>
          </View>
        ) : null}

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Gastos</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {group.expenses.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Todavía no hay gastos en este grupo.
            </Text>
          ) : (
            group.expenses
              .slice()
              .reverse()
              .map((expense) => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  symbol={symbol}
                  membersById={membersById}
                />
              ))
          )}
        </View>
      </ScrollView>

      <Pressable
        onPress={() => setSheetVisible(true)}
        style={({ pressed }) => [styles.fab, { backgroundColor: theme.accent, opacity: pressed ? 0.85 : 1 }]}
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </Pressable>

      <AddExpenseSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        groupId={group.id}
        members={group.members}
        currency={group.currency}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  shareCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  shareText: {
    fontSize: 15,
    fontWeight: '600',
  },
  deleteCard: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    width: 48,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 20,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
  },
  settledCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    padding: 14,
  },
  settledText: {
    fontSize: 14,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
  },
});
