import { Feather } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <View style={[styles.root, { backgroundColor: theme.accent }]}>
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.hero}>
              <View style={[styles.heroBlobLarge, { backgroundColor: theme.accentSoft }]} />
              <View style={[styles.heroBlobSmall, { backgroundColor: theme.accentSoft }]} />

              <View style={styles.logoMark}>
                <Feather name="repeat" size={34} color={theme.accent} />
              </View>
              <Text style={[styles.heroTitle, { fontFamily: Fonts.heading }]}>Tranzfr</Text>
              <Text style={styles.heroTagline}>Comparte gastos sin líos</Text>
            </View>

            <View style={[styles.card, { backgroundColor: theme.card }]}>
              <Text style={[styles.cardTitle, { color: theme.text, fontFamily: Fonts.heading }]}>
                Inicia sesión
              </Text>

              {error && <Text style={[styles.error, { color: theme.debt }]}>{error}</Text>}

              <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
              <View style={[styles.inputWrapper, { borderColor: theme.border }]}>
                <Feather name="mail" size={18} color={theme.textSecondary} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="tucorreo@ejemplo.com"
                  placeholderTextColor={theme.textSecondary}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={[styles.input, { color: theme.text }]}
                />
              </View>

              <Text style={[styles.label, { color: theme.textSecondary, marginTop: 16 }]}>
                Contraseña
              </Text>
              <View style={[styles.inputWrapper, { borderColor: theme.border }]}>
                <Feather name="lock" size={18} color={theme.textSecondary} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry={!showPassword}
                  style={[styles.input, { color: theme.text }]}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={8}
                  style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                >
                  <Feather
                    name={showPassword ? 'eye' : 'eye-off'}
                    size={18}
                    color={theme.textSecondary}
                  />
                </Pressable>
              </View>

              <Pressable
                onPress={handleLogin}
                disabled={!canSubmit}
                style={({ pressed }) => [
                  styles.button,
                  {
                    backgroundColor: canSubmit ? theme.accent : theme.border,
                    opacity: pressed && canSubmit ? 0.85 : 1,
                  },
                ]}
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
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  hero: {
    paddingTop: 36,
    paddingBottom: 48,
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroBlobLarge: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -90,
    right: -60,
    opacity: 0.25,
  },
  heroBlobSmall: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    bottom: -50,
    left: -40,
    opacity: 0.2,
  },
  logoMark: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    boxShadow: '0px 8px 20px rgba(0,0,0,0.18)',
  },
  heroTitle: {
    fontSize: 28,
    color: '#FFFFFF',
  },
  heroTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  card: {
    flexGrow: 1,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 32,
  },
  cardTitle: {
    fontSize: 20,
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
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  error: {
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  button: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
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
    marginTop: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
  },
});
