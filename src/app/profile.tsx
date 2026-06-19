import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSession } from '@/hooks/use-session';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { session } = useSession();
  const user = session?.user;
  const userEmail = user?.email || 'No disponible';
  const userName = user?.user_metadata?.full_name || userEmail?.split('@')[0] || 'Usuario';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

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
          Mi perfil
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {user && <Avatar id={user.id} name={userName} size={80} />}
          <Text style={[styles.userName, { color: theme.text, fontFamily: Fonts.bold }]}>
            {userName}
          </Text>
          <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
            {userEmail}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            INFORMACIÓN
          </Text>
          <View style={[styles.infoItem, { borderBottomColor: theme.border }]}>
            <View style={styles.infoLabel}>
              <Feather name="mail" size={18} color={theme.textSecondary} />
              <Text style={[styles.infoLabelText, { color: theme.textSecondary }]}>
                Email
              </Text>
            </View>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {userEmail}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoLabel}>
              <Feather name="calendar" size={18} color={theme.textSecondary} />
              <Text style={[styles.infoLabelText, { color: theme.textSecondary }]}>
                Miembro desde
              </Text>
            </View>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : '-'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            PREFERENCIAS
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <View style={styles.menuItemContent}>
              <Feather name="moon" size={18} color={theme.textSecondary} />
              <Text style={[styles.menuItemText, { color: theme.text }]}>
                Tema oscuro
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={theme.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.logoutButton,
              { backgroundColor: theme.debtSoft, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Feather name="log-out" size={18} color={theme.debt} />
            <Text style={[styles.logoutText, { color: theme.debt }]}>
              Cerrar sesión
            </Text>
          </Pressable>
        </View>
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
  profileCard: {
    alignItems: 'center',
    paddingVertical: 32,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 32,
  },
  userName: {
    fontSize: 20,
    marginTop: 16,
  },
  userEmail: {
    fontSize: 14,
    marginTop: 6,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoLabelText: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
