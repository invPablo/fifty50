import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { BottomSheet } from '@/components/bottom-sheet';
import { Categories } from '@/constants/categories';
import { currencySymbol } from '@/constants/currencies';
import { useTheme } from '@/hooks/use-theme';
import { useGroupsStore } from '@/store/use-groups-store';
import type { CurrencyCode, ExpenseCategory, GroupMember } from '@/types/models';

interface AddExpenseSheetProps {
  visible: boolean;
  onClose: () => void;
  groupId: string;
  members: GroupMember[];
  currency: CurrencyCode;
}

export function AddExpenseSheet({
  visible,
  onClose,
  groupId,
  members,
  currency,
}: AddExpenseSheetProps) {
  const theme = useTheme();
  const addExpense = useGroupsStore((s) => s.addExpense);

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('other');
  const [paidBy, setPaidBy] = useState(members[0]?.id ?? '');
  const [splitBetween, setSplitBetween] = useState<string[]>(members.map((m) => m.id));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function toggleSplit(memberId: string) {
    setSplitBetween((prev) =>
      prev.includes(memberId) ? prev.filter((m) => m !== memberId) : [...prev, memberId]
    );
  }

  function reset() {
    setDescription('');
    setAmount('');
    setCategory('other');
    setPaidBy(members[0]?.id ?? '');
    setSplitBetween(members.map((m) => m.id));
    setError(null);
  }

  async function handleAdd() {
    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (!description.trim() || !numericAmount || numericAmount <= 0 || splitBetween.length === 0)
      return;
    setSubmitting(true);
    setError(null);
    try {
      await addExpense(groupId, {
        description: description.trim(),
        amount: numericAmount,
        paidBy,
        splitBetween,
        category,
      });
      reset();
      onClose();
    } catch (e: any) {
      setError(e.message ?? 'No se pudo añadir el gasto.');
    } finally {
      setSubmitting(false);
    }
  }

  const canAdd =
    description.trim().length > 0 &&
    parseFloat(amount.replace(',', '.')) > 0 &&
    splitBetween.length > 0 &&
    !submitting;

  return (
    <BottomSheet visible={visible} title="Nuevo gasto" onClose={onClose}>
      <ScrollView keyboardShouldPersistTaps="handled">
        {error && <Text style={[styles.error, { color: theme.debt }]}>{error}</Text>}

        <Text style={[styles.label, { color: theme.textSecondary }]}>Descripción</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Cena del sábado"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
        />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Importe</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder={`0.00 ${currencySymbol(currency)}`}
          placeholderTextColor={theme.textSecondary}
          keyboardType="decimal-pad"
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
        />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Categoría</Text>
        <View style={styles.chipWrap}>
          {Categories.map((cat) => {
            const selected = category === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setCategory(cat.id)}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    backgroundColor: selected ? cat.color : cat.color + '1A',
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: selected ? '#FFFFFF' : cat.color }]}>
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { color: theme.textSecondary }]}>Pagado por</Text>
        <View style={styles.chipWrap}>
          {members.map((member) => {
            const selected = paidBy === member.id;
            return (
              <Pressable
                key={member.id}
                onPress={() => setPaidBy(member.id)}
                style={({ pressed }) => [
                  styles.chip,
                  { backgroundColor: selected ? theme.accent : theme.accentSoft, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={[styles.chipText, { color: selected ? '#FFFFFF' : theme.accent }]}>
                  {member.displayName}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { color: theme.textSecondary }]}>Entre quiénes</Text>
        <View style={styles.chipWrap}>
          {members.map((member) => {
            const selected = splitBetween.includes(member.id);
            return (
              <Pressable
                key={member.id}
                onPress={() => toggleSplit(member.id)}
                style={({ pressed }) => [
                  styles.chip,
                  { backgroundColor: selected ? theme.accent : theme.accentSoft, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={[styles.chipText, { color: selected ? '#FFFFFF' : theme.accent }]}>
                  {member.displayName}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={handleAdd}
          disabled={!canAdd}
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: canAdd ? theme.accent : theme.border, opacity: pressed && canAdd ? 0.8 : 1 },
          ]}
        >
          <Text style={styles.addButtonText}>{submitting ? 'Añadiendo…' : 'Añadir gasto'}</Text>
        </Pressable>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  error: {
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  addButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
