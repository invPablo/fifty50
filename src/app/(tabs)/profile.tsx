import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSession } from '@/hooks/use-session';
import { setAppLanguage, SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n';
import { supabase } from '@/lib/supabase';

const LANGUAGE_LABELS: Record<SupportedLanguage, string> = { es: 'ES', en: 'EN' };

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { session } = useSession();
  const user = session?.user;
  const userEmail = user?.email || t('profile.notAvailable');
  const userName = user?.user_metadata?.display_name || userEmail?.split('@')[0] || t('profile.defaultName');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text, fontFamily: Fonts.heading }]}>
          {t('profile.title')}
        </Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
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
            {t('profile.information')}
          </Text>
          <View style={[styles.infoItem, { borderBottomColor: theme.border }]}>
            <View style={styles.infoLabel}>
              <Feather name="mail" size={18} color={theme.textSecondary} />
              <Text style={[styles.infoLabelText, { color: theme.textSecondary }]}>
                {t('profile.email')}
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
                {t('profile.memberSince')}
              </Text>
            </View>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {user?.created_at ? new Date(user.created_at).toLocaleDateString(i18n.language) : '-'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            {t('profile.security')}
          </Text>
          <Pressable
            onPress={() => router.push('/change-password')}
            style={({ pressed }) => [
              styles.menuItem,
              { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <View style={styles.menuItemContent}>
              <Feather name="lock" size={18} color={theme.textSecondary} />
              <Text style={[styles.menuItemText, { color: theme.text }]}>
                {t('profile.changePassword')}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={theme.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            {t('profile.preferences')}
          </Text>
          <View
            style={[
              styles.menuItem,
              { backgroundColor: theme.card, borderColor: theme.border, marginBottom: 10 },
            ]}
          >
            <View style={styles.menuItemContent}>
              <Feather name="globe" size={18} color={theme.textSecondary} />
              <Text style={[styles.menuItemText, { color: theme.text }]}>
                {t('welcome.chooseLanguage')}
              </Text>
            </View>
            <View style={styles.languagePicker}>
              {SUPPORTED_LANGUAGES.map((lang) => {
                const active = i18n.language === lang;
                return (
                  <Pressable
                    key={lang}
                    onPress={() => setAppLanguage(lang)}
                    style={[
                      styles.languageOption,
                      { backgroundColor: active ? theme.accent : theme.accentSoft },
                    ]}
                  >
                    <Text
                      style={[
                        styles.languageOptionText,
                        { color: active ? '#FFFFFF' : theme.accent },
                      ]}
                    >
                      {LANGUAGE_LABELS[lang]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.menuItem,
              { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <View style={styles.menuItemContent}>
              <Feather name="moon" size={18} color={theme.textSecondary} />
              <Text style={[styles.menuItemText, { color: theme.text }]}>
                {t('profile.darkTheme')}
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
              {t('profile.logout')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 140,
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
  languagePicker: {
    flexDirection: 'row',
    gap: 6,
  },
  languageOption: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  languageOptionText: {
    fontSize: 12,
    fontWeight: '700',
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
