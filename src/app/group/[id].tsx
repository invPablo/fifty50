import { Feather } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddExpenseSheet } from '@/components/add-expense-sheet';
import { BalanceRow } from '@/components/balance-row';
import { ExpenseRow } from '@/components/expense-row';
import { SettlementRow } from '@/components/settlement-row';
import { currencySymbol } from '@/constants/currencies';
import { useTheme } from '@/hooks/use-theme';
import { useGroupsStore } from '@/store/use-groups-store';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const router = useRouter();
  const group = useGroupsStore((s) => s.getGroup(id));
  const calculateDebts = useGroupsStore((s) => s.calculateDebts);
  const deleteGroup = useGroupsStore((s) => s.deleteGroup);
  const [sheetVisible, setSheetVisible] = useState(false);

  if (!group) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Grupo no encontrado.</Text>
      </SafeAreaView>
    );
  }

  const { balances, transactions } = calculateDebts(group.id);
  const symbol = currencySymbol(group.currency);
  const groupId = group.id;

  function handleDelete() {
    deleteGroup(groupId);
    router.replace('/');
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <Stack.Screen
        options={{
          title: group.name,
          headerRight: () => (
            <Pressable onPress={handleDelete} hitSlop={8}>
              <Feather name="trash-2" size={20} color={theme.debt} />
            </Pressable>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Balances</Text>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          {group.members.map((member) => (
            <BalanceRow key={member} member={member} amount={balances[member] ?? 0} symbol={symbol} />
          ))}
        </View>

        {transactions.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              Para saldar cuentas
            </Text>
            {transactions.map((t, i) => (
              <SettlementRow key={i} transaction={t} symbol={symbol} />
            ))}
          </>
        )}

        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Gastos</Text>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          {group.expenses.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Todavía no hay gastos en este grupo.
            </Text>
          ) : (
            group.expenses
              .slice()
              .reverse()
              .map((expense) => <ExpenseRow key={expense.id} expense={expense} symbol={symbol} />)
          )}
        </View>
      </ScrollView>

      <Pressable
        onPress={() => setSheetVisible(true)}
        style={[styles.fab, { backgroundColor: theme.accent }]}
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
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 20,
  },
  card: {
    borderRadius: 16,
    padding: 16,
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
