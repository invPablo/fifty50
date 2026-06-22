import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const canSubmit =
    newPassword.trim().length >= 6 &&
    confirmPassword.trim() === newPassword.trim() &&
    !loading;

  async function handleResetPassword() {
    if (!canSubmit) return;

    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message || t('resetPassword.genericError'));
        setLoading(false);
        return;
      }

      setSuccess(true);
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        router.replace('/');
      }, 2000);
    } catch (e: any) {
      setError(e.message || t('resetPassword.unknownError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: Fonts.heading }]}>
          {t('resetPassword.title')}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {t('resetPassword.subtitle')}
          </Text>

          {success && (
            <View style={[styles.successCard, { backgroundColor: theme.creditSoft }]}>
              <Feather name="check-circle" size={20} color={theme.credit} />
              <Text style={[styles.successText, { color: theme.credit, fontFamily: Fonts.bold }]}>
                {t('resetPassword.success')}
              </Text>
            </View>
          )}

          {error && <Text style={[styles.error, { color: theme.debt }]}>{error}</Text>}

          <Text style={[styles.label, { color: theme.textSecondary }]}>
            {t('resetPassword.newPassword')}
          </Text>
          <View style={[styles.inputWrapper, { borderColor: theme.border }]}>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="••••••••"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry={!showNew}
              style={[styles.input, { color: theme.text }]}
              editable={!loading}
            />
            <Pressable
              onPress={() => setShowNew(!showNew)}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <Feather name={showNew ? 'eye' : 'eye-off'} size={20} color={theme.textSecondary} />
            </Pressable>
          </View>

          {newPassword.length > 0 && newPassword.length < 6 && (
            <Text style={[styles.hint, { color: theme.debt }]}>{t('resetPassword.minChars')}</Text>
          )}

          <Text style={[styles.label, { color: theme.textSecondary, marginTop: 20 }]}>
            {t('resetPassword.confirmPassword')}
          </Text>
          <View style={[styles.inputWrapper, { borderColor: theme.border }]}>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry={!showConfirm}
              style={[styles.input, { color: theme.text }]}
              editable={!loading}
            />
            <Pressable
              onPress={() => setShowConfirm(!showConfirm)}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <Feather
                name={showConfirm ? 'eye' : 'eye-off'}
                size={20}
                color={theme.textSecondary}
              />
            </Pressable>
          </View>

          {confirmPassword.length > 0 && confirmPassword !== newPassword && (
            <Text style={[styles.hint, { color: theme.debt }]}>{t('resetPassword.mismatch')}</Text>
          )}

          <Pressable
            onPress={handleResetPassword}
            disabled={!canSubmit}
            style={({ pressed }) => [
              styles.submitButton,
              {
                backgroundColor: canSubmit ? theme.accent : theme.border,
                opacity: pressed && canSubmit ? 0.8 : 1,
              },
            ]}
          >
            <Text style={styles.submitButtonText}>
              {loading ? t('resetPassword.submitting') : t('resetPassword.submit')}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingRight: 12,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  hint: {
    fontSize: 12,
    marginTop: 6,
    marginBottom: 4,
  },
  error: {
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  successText: {
    fontSize: 14,
  },
  submitButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 32,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
