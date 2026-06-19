import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { BottomSheet } from '@/components/bottom-sheet';
import { Categories } from '@/constants/categories';
import { currencySymbol } from '@/constants/currencies';
import { useTheme } from '@/hooks/use-theme';
import { useGroupsStore } from '@/store/use-groups-store';
import type { CurrencyCode, ExpenseCategory } from '@/types/models';

interface AddExpenseSheetProps {
  visible: boolean;
  onClose: () => void;
  groupId: string;
  members: string[];
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
  const [paidBy, setPaidBy] = useState(members[0]);
  const [splitBetween, setSplitBetween] = useState<string[]>(members);

  function toggleSplit(member: string) {
    setSplitBetween((prev) =>
      prev.includes(member) ? prev.filter((m) => m !== member) : [...prev, member]
    );
  }

  function reset() {
    setDescription('');
    setAmount('');
    setCategory('other');
    setPaidBy(members[0]);
    setSplitBetween(members);
  }

  function handleAdd() {
    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (!description.trim() || !numericAmount || numericAmount <= 0 || splitBetween.length === 0)
      return;
    addExpense(groupId, {
      description: description.trim(),
      amount: numericAmount,
      paidBy,
      splitBetween,
      category,
    });
    reset();
    onClose();
  }

  const canAdd =
    description.trim().length > 0 &&
    parseFloat(amount.replace(',', '.')) > 0 &&
    splitBetween.length > 0;

  return (
    <BottomSheet visible={visible} title="Nuevo gasto" onClose={onClose}>
      <ScrollView keyboardShouldPersistTaps="handled">
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
                style={[
                  styles.chip,
                  { backgroundColor: selected ? theme.accent : theme.accentSoft },
                ]}
              >
                <Text style={[styles.chipText, { color: selected ? '#FFFFFF' : theme.accent }]}>
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { color: theme.textSecondary }]}>Pagado por</Text>
        <View style={styles.chipWrap}>
          {members.map((member) => {
            const selected = paidBy === member;
            return (
              <Pressable
                key={member}
                onPress={() => setPaidBy(member)}
                style={[
                  styles.chip,
                  { backgroundColor: selected ? theme.accent : theme.accentSoft },
                ]}
              >
                <Text style={[styles.chipText, { color: selected ? '#FFFFFF' : theme.accent }]}>
                  {member}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { color: theme.textSecondary }]}>Entre quiénes</Text>
        <View style={styles.chipWrap}>
          {members.map((member) => {
            const selected = splitBetween.includes(member);
            return (
              <Pressable
                key={member}
                onPress={() => toggleSplit(member)}
                style={[
                  styles.chip,
                  { backgroundColor: selected ? theme.accent : theme.accentSoft },
                ]}
              >
                <Text style={[styles.chipText, { color: selected ? '#FFFFFF' : theme.accent }]}>
                  {member}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={handleAdd}
          disabled={!canAdd}
          style={[styles.addButton, { backgroundColor: canAdd ? theme.accent : theme.border }]}
        >
          <Text style={styles.addButtonText}>Añadir gasto</Text>
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
