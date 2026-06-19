import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { BottomSheet } from '@/components/bottom-sheet';
import { Currencies } from '@/constants/currencies';
import { useTheme } from '@/hooks/use-theme';
import { useGroupsStore } from '@/store/use-groups-store';
import type { CurrencyCode } from '@/types/models';

interface CreateGroupSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function CreateGroupSheet({ visible, onClose }: CreateGroupSheetProps) {
  const theme = useTheme();
  const router = useRouter();
  const addGroup = useGroupsStore((s) => s.addGroup);

  const [name, setName] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [youAre, setYouAre] = useState<string | null>(null);
  const [currency, setCurrency] = useState<CurrencyCode>('EUR');

  function reset() {
    setName('');
    setMemberInput('');
    setMembers([]);
    setYouAre(null);
    setCurrency('EUR');
  }

  function addMember() {
    const trimmed = memberInput.trim();
    if (!trimmed || members.includes(trimmed)) return;
    setMembers([...members, trimmed]);
    setMemberInput('');
    if (!youAre) setYouAre(trimmed);
  }

  function removeMember(member: string) {
    setMembers(members.filter((m) => m !== member));
    if (youAre === member) setYouAre(null);
  }

  function handleCreate() {
    if (!name.trim() || members.length < 2 || !youAre) return;
    addGroup(name.trim(), members, currency, youAre);
    const groups = useGroupsStore.getState().groups;
    const created = groups[groups.length - 1];
    reset();
    onClose();
    router.push({ pathname: '/group/[id]', params: { id: created.id } });
  }

  const canCreate = name.trim().length > 0 && members.length >= 2 && !!youAre;

  return (
    <BottomSheet visible={visible} title="Nuevo grupo" onClose={onClose}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={[styles.label, { color: theme.textSecondary }]}>Nombre del grupo</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Viaje a Lisboa"
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
        />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Miembros</Text>
        <View style={styles.memberInputRow}>
          <TextInput
            value={memberInput}
            onChangeText={setMemberInput}
            placeholder="Nombre"
            placeholderTextColor={theme.textSecondary}
            onSubmitEditing={addMember}
            style={[styles.input, styles.memberInput, { color: theme.text, borderColor: theme.border }]}
          />
          <Pressable
            onPress={addMember}
            style={[styles.addButton, { backgroundColor: theme.accent }]}
          >
            <Feather name="plus" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.chipWrap}>
          {members.map((member) => (
            <Pressable
              key={member}
              onPress={() => removeMember(member)}
              style={[styles.chip, { backgroundColor: theme.accentSoft }]}
            >
              <Text style={[styles.chipText, { color: theme.accent }]}>{member}</Text>
              <Feather name="x" size={14} color={theme.accent} />
            </Pressable>
          ))}
        </View>

        {members.length >= 2 && (
          <>
            <Text style={[styles.label, { color: theme.textSecondary }]}>¿Quién eres tú?</Text>
            <View style={styles.chipWrap}>
              {members.map((member) => {
                const selected = youAre === member;
                return (
                  <Pressable
                    key={member}
                    onPress={() => setYouAre(member)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: selected ? theme.accent : theme.accentSoft,
                      },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: selected ? '#FFFFFF' : theme.accent }]}>
                      {member}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        <Text style={[styles.label, { color: theme.textSecondary }]}>Moneda</Text>
        <View style={styles.chipWrap}>
          {Currencies.map((c) => {
            const selected = currency === c.code;
            return (
              <Pressable
                key={c.code}
                onPress={() => setCurrency(c.code)}
                style={[
                  styles.chip,
                  { backgroundColor: selected ? theme.accent : theme.accentSoft },
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
          style={[
            styles.createButton,
            { backgroundColor: canCreate ? theme.accent : theme.border },
          ]}
        >
          <Text style={styles.createButtonText}>Crear grupo</Text>
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
