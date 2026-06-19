import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';

export default function SignupScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    setError(null);
    setInfo(null);
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { display_name: displayName.trim() } },
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    if (data.session) {
      router.replace('/');
      return;
    }
    // Account created but email not verified yet
    // Show message and auto-login after 2 seconds
    setInfo('¡Cuenta creada! Verifica tu email en los próximos 30 días.');
    setTimeout(() => {
      // Try to login with the credentials
      supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      }).then(() => {
        router.replace('/');
      });
    }, 2000);
  }

  const canSubmit =
    displayName.trim().length > 0 && email.trim().length > 0 && password.length >= 6 && !loading;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Crear cuenta</Text>

      {error && <Text style={[styles.error, { color: theme.debt }]}>{error}</Text>}
      {info && <Text style={[styles.info, { color: theme.credit }]}>{info}</Text>}

      <Text style={[styles.label, { color: theme.textSecondary }]}>Tu nombre</Text>
      <TextInput
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Pablo"
        placeholderTextColor={theme.textSecondary}
        style={[styles.input, { color: theme.text, borderColor: theme.border }]}
      />

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
        placeholder="Mínimo 6 caracteres"
        placeholderTextColor={theme.textSecondary}
        secureTextEntry
        style={[styles.input, { color: theme.text, borderColor: theme.border }]}
      />

      <Pressable
        onPress={handleSignup}
        disabled={!canSubmit}
        style={[styles.button, { backgroundColor: canSubmit ? theme.accent : theme.border }]}
      >
        <Text style={styles.buttonText}>{loading ? 'Creando…' : 'Crear cuenta'}</Text>
      </Pressable>

      <View style={styles.footer}>
        <Text style={{ color: theme.textSecondary }}>¿Ya tienes cuenta? </Text>
        <Link href="/login" style={[styles.link, { color: theme.accent }]}>
          Iniciar sesión
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 24,
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
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
});
