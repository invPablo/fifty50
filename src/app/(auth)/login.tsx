import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError(null);
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.replace('/');
  }

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={[styles.title, { color: theme.text }]}>Tranzfr</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Inicia sesión</Text>

          {error && <Text style={[styles.error, { color: theme.debt }]}>{error}</Text>}

          <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="tucorreo@ejemplo.com"
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="none"
            keyboardType="email-address"
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
          />

          <Text style={[styles.label, { color: theme.textSecondary }]}>Contraseña</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={theme.textSecondary}
            secureTextEntry
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
          />

          <Pressable
            onPress={handleLogin}
            disabled={!canSubmit}
            style={[styles.button, { backgroundColor: canSubmit ? theme.accent : theme.border }]}
          >
            <Text style={styles.buttonText}>{loading ? 'Entrando…' : 'Iniciar sesión'}</Text>
          </Pressable>

          <Link href="/forgot-password" style={[styles.link, { color: theme.accent }]}>
            ¿Olvidaste tu contraseña?
          </Link>

          <View style={styles.footer}>
            <Text style={{ color: theme.textSecondary }}>¿No tienes cuenta? </Text>
            <Link href="/signup" style={[styles.link, { color: theme.accent }]}>
              Crear cuenta
            </Link>
          </View>
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
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 28,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 14,
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
    marginTop: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
});
