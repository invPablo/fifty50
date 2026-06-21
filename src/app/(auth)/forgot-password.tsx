import { Link } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    setError(null);
    setInfo(null);
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase()
    );
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setInfo(t('forgotPassword.success'));
  }

  const canSubmit = email.trim().length > 0 && !loading;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={[styles.title, { color: theme.text }]}>{t('forgotPassword.title')}</Text>

          {error && <Text style={[styles.error, { color: theme.debt }]}>{error}</Text>}
          {info && <Text style={[styles.info, { color: theme.credit }]}>{info}</Text>}

          <Text style={[styles.label, { color: theme.textSecondary }]}>{t('forgotPassword.email')}</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder={t('forgotPassword.emailPlaceholder')}
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="none"
            keyboardType="email-address"
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
          />

          <Pressable
            onPress={handleSend}
            disabled={!canSubmit}
            style={[styles.button, { backgroundColor: canSubmit ? theme.accent : theme.border }]}
          >
            <Text style={styles.buttonText}>
              {loading ? t('forgotPassword.sending') : t('forgotPassword.submit')}
            </Text>
          </Pressable>

          <Link href="/login" style={[styles.link, { color: theme.accent }]}>
            {t('forgotPassword.backToLogin')}
          </Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
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
  info: {
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
  button: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  link: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
  },
});
