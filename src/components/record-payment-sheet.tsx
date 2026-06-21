import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { BottomSheet } from '@/components/bottom-sheet';
import { currencySymbol } from '@/constants/currencies';
import { useTheme } from '@/hooks/use-theme';
import { useGroupsStore } from '@/store/use-groups-store';
import type { CurrencyCode, GroupMember } from '@/types/models';

interface RecordPaymentSheetProps {
  visible: boolean;
  onClose: () => void;
  groupId: string;
  members: GroupMember[];
  currency: CurrencyCode;
  defaultFromId: string;
  defaultToId?: string;
  defaultAmount?: number;
}

export function RecordPaymentSheet({
  visible,
  onClose,
  groupId,
  members,
  currency,
  defaultFromId,
  defaultToId,
  defaultAmount,
}: RecordPaymentSheetProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const addSettlement = useGroupsStore((s) => s.addSettlement);

  const [from, setFrom] = useState(defaultFromId || members[0]?.id || '');
  const [to, setTo] = useState(
    defaultToId ?? members.find((m) => m.id !== defaultFromId)?.id ?? ''
  );
  const [amount, setAmount] = useState(defaultAmount ? defaultAmount.toFixed(2) : '');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // defaultFromId/defaultToId/defaultAmount can resolve or change after this
  // sheet first mounts (defaultFromId depends on session, which loads async;
  // defaultToId/defaultAmount come from whichever "Liquidar" suggestion was
  // tapped) — recompute every time it opens rather than only once at mount.
  useEffect(() => {
    if (!visible) return;
    const initialFrom = defaultFromId || members[0]?.id || '';
    setFrom(initialFrom);
    setTo(defaultToId ?? members.find((m) => m.id !== initialFrom)?.id ?? '');
    setAmount(defaultAmount ? defaultAmount.toFixed(2) : '');
  }, [visible, defaultFromId, defaultToId, defaultAmount, members]);

  function reset() {
    setFrom(defaultFromId || members[0]?.id || '');
    setTo(defaultToId ?? members.find((m) => m.id !== defaultFromId)?.id ?? '');
    setAmount(defaultAmount ? defaultAmount.toFixed(2) : '');
    setNote('');
    setError(null);
  }

  function selectFrom(memberId: string) {
    setFrom(memberId);
    if (memberId === to) setTo(members.find((m) => m.id !== memberId)?.id ?? '');
  }

  function selectTo(memberId: string) {
    setTo(memberId);
    if (memberId === from) setFrom(members.find((m) => m.id !== memberId)?.id ?? '');
  }

  async function handleRecord() {
    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (!from || !to || from === to || !numericAmount || numericAmount <= 0) return;
    setSubmitting(true);
    setError(null);
    try {
      await addSettlement(groupId, from, to, numericAmount, note.trim());
      reset();
      onClose();
    } catch (e: any) {
      setError(e.message ?? t('recordPayment.error'));
    } finally {
      setSubmitting(false);
    }
  }

  const canRecord =
    !!from && !!to && from !== to && parseFloat(amount.replace(',', '.')) > 0 && !submitting;

  return (
    <BottomSheet visible={visible} title={t('recordPayment.title')} onClose={onClose}>
      <ScrollView keyboardShouldPersistTaps="handled">
        {error && <Text style={[styles.error, { color: theme.debt }]}>{error}</Text>}

        <Text style={[styles.label, { color: theme.textSecondary }]}>{t('recordPayment.from')}</Text>
        <View style={styles.chipWrap}>
          {members.map((member) => {
            const selected = from === member.id;
            return (
              <Pressable
                key={member.id}
                onPress={() => selectFrom(member.id)}
                style={({ pressed }) => [
                  styles.chip,
                  { backgroundColor: selected ? theme.credit : theme.creditSoft, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={[styles.chipText, { color: selected ? '#FFFFFF' : theme.credit }]}>
                  {member.displayName}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { color: theme.textSecondary }]}>{t('recordPayment.to')}</Text>
        <View style={styles.chipWrap}>
          {members.map((member) => {
            const selected = to === member.id;
            return (
              <Pressable
                key={member.id}
                onPress={() => selectTo(member.id)}
                style={({ pressed }) => [
                  styles.chip,
                  { backgroundColor: selected ? theme.credit : theme.creditSoft, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={[styles.chipText, { color: selected ? '#FFFFFF' : theme.credit }]}>
                  {member.displayName}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { color: theme.textSecondary }]}>{t('recordPayment.amountLabel')}</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder={`0.00 ${currencySymbol(currency)}`}
          placeholderTextColor={theme.textSecondary}
          keyboardType="decimal-pad"
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
        />

        <Text style={[styles.label, { color: theme.textSecondary }]}>{t('recordPayment.noteLabel')}</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder={t('recordPayment.notePlaceholder')}
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
        />

        <Pressable
          onPress={handleRecord}
          disabled={!canRecord}
          style={({ pressed }) => [
            styles.recordButton,
            { backgroundColor: canRecord ? theme.credit : theme.border, opacity: pressed && canRecord ? 0.8 : 1 },
          ]}
        >
          <Text style={styles.recordButtonText}>{submitting ? t('recordPayment.submitting') : t('recordPayment.submit')}</Text>
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
  recordButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  recordButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
