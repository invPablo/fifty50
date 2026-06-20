import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { BottomSheet } from '@/components/bottom-sheet';
import { Currencies } from '@/constants/currencies';
import { useTheme } from '@/hooks/use-theme';
import { useGroupsStore } from '@/store/use-groups-store';
import type { CurrencyCode, GroupType } from '@/types/models';

interface CreateGroupSheetProps {
  visible: boolean;
  onClose: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const GROUP_TYPES: { id: GroupType; label: string }[] = [
  { id: 'trip', label: '🧳 Viaje' },
  { id: 'roommates', label: '🏠 Piso compartido' },
];

export function CreateGroupSheet({ visible, onClose }: CreateGroupSheetProps) {
  const theme = useTheme();
  const router = useRouter();
  const addGroup = useGroupsStore((s) => s.addGroup);
  const addMember = useGroupsStore((s) => s.addMember);

  const [name, setName] = useState('');
  const [yourDisplayName, setYourDisplayName] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [invites, setInvites] = useState<string[]>([]);
  const [currency, setCurrency] = useState<CurrencyCode>('EUR');
  const [groupType, setGroupType] = useState<GroupType>('trip');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setName('');
    setYourDisplayName('');
    setEmailInput('');
    setInvites([]);
    setCurrency('EUR');
    setGroupType('trip');
    setError(null);
  }

  function addInvite() {
    const trimmed = emailInput.trim().toLowerCase();
    if (!EMAIL_RE.test(trimmed) || invites.includes(trimmed)) return;
    setInvites([...invites, trimmed]);
    setEmailInput('');
  }

  function removeInvite(email: string) {
    setInvites(invites.filter((e) => e !== email));
  }

  async function handleCreate() {
    if (!name.trim() || !yourDisplayName.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const groupId = await addGroup(name.trim(), currency, yourDisplayName.trim(), groupType);
      for (const email of invites) {
        await addMember(groupId, email, '');
      }
      reset();
      onClose();
      router.push({ pathname: '/group/[id]', params: { id: groupId } });
    } catch (e: any) {
      setError(e.message ?? 'No se pudo crear el grupo.');
    } finally {
      setSubmitting(false);
    }
  }

  const canCreate = name.trim().length > 0 && yourDisplayName.trim().length > 0 && !submitting;

  return (
    <BottomSheet visible={visible} title="Nuevo grupo" onClose={onClose}>
      <ScrollView keyboardShouldPersistTaps="handled">
        {error && <Text style={[styles.error, { color: theme.debt }]}>{error}</Text>}

        <Text style={[styles.label, { color: theme.textSecondary }]}>Tipo de grupo</Text>
        <View style={styles.chipWrap}>
          {GROUP_TYPES.map((t) => {
            const selected = groupType === t.id;
            return (
              <Pressable
                key={t.id}
                onPress={() => setGroupType(t.id)}
                style={({ pressed }) => [
                  styles.chip,
                  { backgroundColor: selected ? theme.accent : theme.accentSoft, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={[styles.chipText, { color: selected ? '#FFFFFF' : theme.accent }]}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.label, { color: theme.textSecondary }]}>Nombre del grupo</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Viaje a Lisboa"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
        />

        <Text style={[styles.label, { color: theme.textSecondary }]}>
          ¿Cómo te ven los demás en este grupo?
        </Text>
        <TextInput
          value={yourDisplayName}
          onChangeText={setYourDisplayName}
          placeholder="Pablo"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
        />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Invitar por email</Text>
        <View style={styles.memberInputRow}>
          <TextInput
            value={emailInput}
            onChangeText={setEmailInput}
            placeholder="amigo@ejemplo.com"
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="none"
            keyboardType="email-address"
            onSubmitEditing={addInvite}
            style={[styles.input, styles.memberInput, { color: theme.text, borderColor: theme.border }]}
          />
          <Pressable
            onPress={addInvite}
            style={({ pressed }) => [styles.addButton, { backgroundColor: theme.accent, opacity: pressed ? 0.7 : 1 }]}
          >
            <Feather name="plus" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.chipWrap}>
          {invites.map((email) => (
            <Pressable
              key={email}
              onPress={() => removeInvite(email)}
              style={({ pressed }) => [styles.chip, { backgroundColor: theme.accentSoft, opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={[styles.chipText, { color: theme.accent }]}>{email}</Text>
              <Feather name="x" size={14} color={theme.accent} />
            </Pressable>
          ))}
        </View>
        <Text style={[styles.hint, { color: theme.textSecondary }]}>
          {invites.length === 0
            ? 'Crea el grupo sin invitar a nadie. Podrás compartir el link después.'
            : 'Si esa persona aún no tiene cuenta, se unirá automáticamente al registrarse con ese email.'}
        </Text>

        <Text style={[styles.label, { color: theme.textSecondary }]}>Moneda</Text>
        <View style={styles.chipWrap}>
          {Currencies.map((c) => {
            const selected = currency === c.code;
            return (
              <Pressable
                key={c.code}
                onPress={() => setCurrency(c.code)}
                style={({ pressed }) => [
                  styles.chip,
                  { backgroundColor: selected ? theme.accent : theme.accentSoft, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={[styles.chipText, { color: selected ? '#FFFFFF' : theme.accent }]}>
                  {c.symbol} {c.code}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={handleCreate}
          disabled={!canCreate}
          style={({ pressed }) => [
            styles.createButton,
            { backgroundColor: canCreate ? theme.accent : theme.border, opacity: pressed && canCreate ? 0.8 : 1 },
          ]}
        >
          <Text style={styles.createButtonText}>{submitting ? 'Creando…' : 'Crear grupo'}</Text>
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
  hint: {
    fontSize: 12,
    marginTop: 8,
  },
  memberInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  memberInput: {
    flex: 1,
  },
  addButton: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  createButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
