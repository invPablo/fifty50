import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';

export default function ChangePasswordScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const canSubmit =
    currentPassword.trim().length > 0 &&
    newPassword.trim().length >= 6 &&
    confirmPassword.trim() === newPassword.trim() &&
    !loading;

  async function handleChangePassword() {
    if (!canSubmit) return;

    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      // Verify current password by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: supabase.auth.user()?.email || '',
        password: currentPassword,
      });

      if (signInError) {
        setError('Contraseña actual incorrecta');
        setLoading(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message || 'Error al cambiar contraseña');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Auto-redirect after 2 seconds
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (e: any) {
      setError(e.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Feather name="chevron-left" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: Fonts.heading }]}>
          Cambiar contraseña
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {success && (
          <View style={[styles.successCard, { backgroundColor: theme.creditSoft }]}>
            <Feather name="check-circle" size={20} color={theme.credit} />
            <Text style={[styles.successText, { color: theme.credit, fontFamily: Fonts.bold }]}>
              Contraseña cambiada correctamente
            </Text>
          </View>
        )}

        {error && <Text style={[styles.error, { color: theme.debt }]}>{error}</Text>}

        <Text style={[styles.label, { color: theme.textSecondary }]}>Contraseña actual</Text>
        <View style={[styles.inputWrapper, { borderColor: theme.border }]}>
          <TextInput
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="••••••••"
            placeholderTextColor={theme.textSecondary}
            secureTextEntry={!showCurrent}
            style={[styles.input, { color: theme.text }]}
            editable={!loading}
          />
          <Pressable
            onPress={() => setShowCurrent(!showCurrent)}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <Feather
              name={showCurrent ? 'eye' : 'eye-off'}
              size={20}
              color={theme.textSecondary}
            />
          </Pressable>
        </View>

        <Text style={[styles.label, { color: theme.textSecondary, marginTop: 20 }]}>
          Nueva contraseña
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
          <Text style={[styles.hint, { color: theme.debt }]}>
            Mínimo 6 caracteres
          </Text>
        )}

        <Text style={[styles.label, { color: theme.textSecondary, marginTop: 20 }]}>
          Confirmar nueva contraseña
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
          <Text style={[styles.hint, { color: theme.debt }]}>
            Las contraseñas no coinciden
          </Text>
        )}

        <Pressable
          onPress={handleChangePassword}
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
            {loading ? 'Cambiando…' : 'Cambiar contraseña'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
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
