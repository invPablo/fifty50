import { Feather } from '@expo/vector-icons';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';

import { AddExpenseSheet } from '@/components/add-expense-sheet';
import { BalanceRow } from '@/components/balance-row';
import { ExpenseRow } from '@/components/expense-row';
import { RecordPaymentSheet } from '@/components/record-payment-sheet';
import { SettlementRow } from '@/components/settlement-row';
import { currencySymbol } from '@/constants/currencies';
import { Fonts } from '@/constants/theme';
import { useSession } from '@/hooks/use-session';
import { useTheme } from '@/hooks/use-theme';
import { useGroupsStore } from '@/store/use-groups-store';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const { session } = useSession();
  const group = useGroupsStore((s) => s.getGroup(id));
  const fetchGroupDetail = useGroupsStore((s) => s.fetchGroupDetail);
  const calculateDebts = useGroupsStore((s) => s.calculateDebts);
  const deleteGroup = useGroupsStore((s) => s.deleteGroup);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [paymentSheetVisible, setPaymentSheetVisible] = useState(false);
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
  const myMember = group.members.find((m) => m.userId === session?.user.id);
  const currentMemberId = myMember?.id ?? '';
  const myBalanceValue = myMember ? balances[myMember.id] ?? 0 : 0;
  const otherMembers = group.members.filter((m) => m.id !== currentMemberId);
  const myTransaction = transactions.find((t) => t.from === currentMemberId);

  const isCredit = myBalanceValue > 0.01;
  const isDebt = myBalanceValue < -0.01;
  let summaryText = 'Estáis saldados';
  if (myMember && (isCredit || isDebt)) {
    if (otherMembers.length === 1) {
      const other = otherMembers[0];
      summaryText = isCredit
        ? `${other.displayName} te debe ${symbol}${myBalanceValue.toFixed(2)}`
        : `Le debes ${symbol}${Math.abs(myBalanceValue).toFixed(2)} a ${other.displayName}`;
    } else {
      summaryText = isCredit
        ? `Te deben ${symbol}${myBalanceValue.toFixed(2)} en total`
        : `Debes ${symbol}${Math.abs(myBalanceValue).toFixed(2)} en total`;
    }
  }
  const summaryColor = isCredit ? theme.credit : isDebt ? theme.debt : theme.textSecondary;

  const historial = [
    ...group.expenses.map((expense) => ({ date: expense.date, kind: 'expense' as const, expense })),
    ...group.settlements.map((settlement) => ({
      date: settlement.date,
      kind: 'settlement' as const,
      settlement,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const historialNodes: Array<
    | { kind: 'month'; key: string; label: string }
    | { kind: 'expense'; key: string; expense: (typeof group.expenses)[number] }
    | { kind: 'settlement'; key: string; settlement: (typeof group.settlements)[number] }
  > = [];
  let lastMonthKey = '';
  historial.forEach((item) => {
    const monthKey = item.date.slice(0, 7);
    if (monthKey !== lastMonthKey) {
      lastMonthKey = monthKey;
      const label = new Date(item.date).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      historialNodes.push({ kind: 'month', key: `month-${monthKey}`, label: label.charAt(0).toUpperCase() + label.slice(1) });
    }
    historialNodes.push(
      item.kind === 'expense'
        ? { kind: 'expense', key: `expense-${item.expense.id}`, expense: item.expense }
        : { kind: 'settlement', key: `settlement-${item.settlement.id}`, settlement: item.settlement }
    );
  });

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
        <Text style={[styles.summary, { color: summaryColor, fontFamily: Fonts.bold }]}>
          {summaryText}
        </Text>

        <View style={styles.actionsRow}>
          <Pressable
            onPress={() => setPaymentSheetVisible(true)}
            style={({ pressed }) => [
              styles.settleCard,
              { backgroundColor: theme.credit, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Feather name="send" size={18} color="#FFFFFF" />
            <Text style={styles.settleText}>Liquidar</Text>
          </Pressable>
          <Pressable
            onPress={handleShare}
            style={({ pressed }) => [
              styles.shareCard,
              { backgroundColor: theme.accentSoft, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name="share-2" size={18} color={theme.accent} />
            <Text style={[styles.shareText, { color: theme.accent }]}>
              Compartir
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

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Historial</Text>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {historialNodes.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Todavía no hay movimientos en este grupo.
            </Text>
          ) : (
            historialNodes.map((node) => {
              if (node.kind === 'month') {
                return (
                  <Text key={node.key} style={[styles.monthLabel, { color: theme.textSecondary }]}>
                    {node.label}
                  </Text>
                );
              }
              if (node.kind === 'expense') {
                return (
                  <ExpenseRow
                    key={node.key}
                    expense={node.expense}
                    symbol={symbol}
                    membersById={membersById}
                    currentMemberId={currentMemberId}
                  />
                );
              }
              return (
                <SettlementRow
                  key={node.key}
                  transaction={node.settlement}
                  symbol={symbol}
                  membersById={membersById}
                  variant="recorded"
                />
              );
            })
          )}
        </View>
      </ScrollView>

      <Pressable
        onPress={() => setSheetVisible(true)}
        style={({ pressed }) => [styles.addFab, { backgroundColor: theme.accent, opacity: pressed ? 0.85 : 1 }]}
      >
        <Feather name="plus" size={20} color="#FFFFFF" />
        <Text style={styles.addFabText}>Añadir gasto</Text>
      </Pressable>

      <AddExpenseSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        groupId={group.id}
        members={group.members}
        currency={group.currency}
      />

      <RecordPaymentSheet
        visible={paymentSheetVisible}
        onClose={() => setPaymentSheetVisible(false)}
        groupId={group.id}
        members={group.members}
        currency={group.currency}
        defaultFromId={currentMemberId}
        defaultToId={myTransaction?.to}
        defaultAmount={myTransaction?.amount}
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
  summary: {
    fontSize: 20,
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  settleCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 12,
  },
  settleText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  shareCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 12,
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
  monthLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 12,
    marginBottom: 4,
  },
  addFab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 28,
    boxShadow: '0px 4px 8px rgba(0,0,0,0.2)',
  },
  addFabText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
