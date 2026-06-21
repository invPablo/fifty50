import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSession } from '@/hooks/use-session';
import { supabase } from '@/lib/supabase';
import { useGroupsStore } from '@/store/use-groups-store';

interface GroupData {
  id: string;
  name: string;
  created_by: string;
}

export default function JoinGroupScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { groupId } = useLocalSearchParams();
  const { session } = useSession();
  const addMember = useGroupsStore((s) => s.addMember);

  const [group, setGroup] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!session) return;
    fetchGroup();
  }, [session, groupId]);

  async function fetchGroup() {
    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('groups')
        .select('id, name, created_by')
        .eq('id', groupId)
        .single();

      if (err) throw new Error(t('join.notFound'));
      setGroup(data);
      setShowNameModal(true);
    } catch (e: any) {
      setError(e.message ?? t('join.loadError'));
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!displayName.trim() || !session?.user.email || !group?.id) return;
    setJoining(true);
    try {
      await addMember(group.id, session.user.email, displayName.trim());
      setShowNameModal(false);
      router.replace({ pathname: '/group/[id]', params: { id: group.id } });
    } catch (e: any) {
      setError(e.message ?? t('join.joinError'));
    } finally {
      setJoining(false);
    }
  }

  if (!session) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.center}>
          <Text style={[styles.text, { color: theme.text }]}>{t('join.mustBeLoggedIn')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.center}>
          <Text style={[styles.text, { color: theme.text }]}>{t('join.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !group) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.center}>
          <View style={[styles.errorIcon, { backgroundColor: theme.debtSoft }]}>
            <Feather name="alert-circle" size={48} color={theme.debt} />
          </View>
          <Text style={[styles.errorText, { color: theme.text, fontFamily: Fonts.bold }]}>
            {error}
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: theme.accent, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={styles.backButtonText}>{t('join.back')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Modal
        visible={showNameModal}
        animationType="fade"
        transparent
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text, fontFamily: Fonts.bold }]}>
              {t('join.joiningGroup', { name: group?.name })}
            </Text>
            <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
              {t('join.askDisplayName')}
            </Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder={t('join.namePlaceholder')}
              placeholderTextColor={theme.textSecondary}
              style={[styles.modalInput, { color: theme.text, borderColor: theme.border }]}
              editable={!joining}
            />
            {error && <Text style={[styles.error, { color: theme.debt }]}>{error}</Text>}
            <Pressable
              onPress={handleJoin}
              disabled={!displayName.trim() || joining}
              style={({ pressed }) => [
                styles.joinButton,
                {
                  backgroundColor: displayName.trim() && !joining ? theme.accent : theme.border,
                  opacity: pressed && displayName.trim() && !joining ? 0.8 : 1,
                },
              ]}
            >
              <Text style={styles.joinButtonText}>
                {joining ? t('join.joining') : t('join.join')}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 32,
    width: '85%',
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 4,
  },
  error: {
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
  joinButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
