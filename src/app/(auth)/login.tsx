import { Feather } from "@expo/vector-icons";
import { GlassView } from "expo-glass-effect";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Fonts } from "@/constants/theme";
import { signInWithGoogle } from "@/lib/google-auth";
import { supabase } from "@/lib/supabase";

const isIOS = Platform.OS === "ios";
const ACCENT = "#4DA8F5";
const LOGO_WORDMARK = require("../../../assets/images/logo-wordmark.png");

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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
    router.replace("/");
  }

  async function handleGoogleLogin() {
    setError(null);
    setGoogleLoading(true);
    const { error: googleError } = await signInWithGoogle();
    setGoogleLoading(false);
    if (googleError) setError(googleError);
  }

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

  return (
    <View style={styles.root}>
      <ImageBackground
        source={require("../../../assets/images/onboarding/login-hero.jpg")}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      <SafeAreaView style={styles.flex} edges={["top", "bottom"]}>
        <View style={styles.logoRow}>
          <GlassView
            style={[styles.logoPill, !isIOS && styles.glassFallback]}
            glassEffectStyle="regular"
            tintColor="rgba(0,0,0,0.25)"
          >
            <Image source={LOGO_WORDMARK} style={styles.logoWordmark} resizeMode="contain" />
          </GlassView>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            <GlassView
              style={[styles.card, !isIOS && styles.glassFallback]}
              glassEffectStyle="regular"
              tintColor="rgba(0,0,0,0.35)"
            >
              <Text style={[styles.cardTitle, { fontFamily: Fonts.heading }]}>
                {t('login.title')}
              </Text>

              {error && <Text style={styles.error}>{error}</Text>}

              <Text style={styles.label}>{t('login.email')}</Text>
              <View style={styles.inputWrapper}>
                <Feather name="mail" size={18} color="rgba(255,255,255,0.7)" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder={t('login.emailPlaceholder')}
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                />
              </View>

              <Text style={[styles.label, { marginTop: 16 }]}>{t('login.password')}</Text>
              <View style={styles.inputWrapper}>
                <Feather name="lock" size={18} color="rgba(255,255,255,0.7)" />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  secureTextEntry={!showPassword}
                  style={styles.input}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={8}
                  style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                >
                  <Feather
                    name={showPassword ? "eye" : "eye-off"}
                    size={18}
                    color="rgba(255,255,255,0.7)"
                  />
                </Pressable>
              </View>

              <Pressable
                onPress={handleLogin}
                disabled={!canSubmit}
                style={({ pressed }) => [
                  styles.button,
                  {
                    backgroundColor: canSubmit ? "#FFFFFF" : "rgba(255,255,255,0.3)",
                    opacity: pressed && canSubmit ? 0.85 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.buttonText,
                    { color: canSubmit ? "#16161D" : "rgba(255,255,255,0.7)" },
                  ]}
                >
                  {loading ? t('login.submitting') : t('login.submit')}
                </Text>
              </Pressable>

              <Link href="/forgot-password" style={styles.link}>
                {t('login.forgotPassword')}
              </Link>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>{t('login.orDivider')}</Text>
                <View style={styles.dividerLine} />
              </View>

              <Pressable
                onPress={handleGoogleLogin}
                disabled={googleLoading}
                style={({ pressed }) => [
                  styles.googleButton,
                  { opacity: pressed || googleLoading ? 0.8 : 1 },
                ]}
              >
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleButtonText}>
                  {googleLoading ? t('login.googleLoading') : t('login.continueWithGoogle')}
                </Text>
              </Pressable>

              <View style={styles.footer}>
                <Text style={styles.footerText}>{t('login.noAccount')} </Text>
                <Link href="/signup" style={styles.footerLink}>
                  {t('login.createAccount')}
                </Link>
              </View>
            </GlassView>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000000",
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  logoRow: {
    alignItems: "center",
    paddingTop: 12,
  },
  logoPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    overflow: "hidden",
  },
  logoWordmark: {
    width: 75,
    height: 22,
  },
  glassFallback: {
    backgroundColor: "rgba(20,20,28,0.55)",
  },
  card: {
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 28,
    overflow: "hidden",
  },
  cardTitle: {
    fontSize: 20,
    color: "#FFFFFF",
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    color: "rgba(255,255,255,0.75)",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#FFFFFF",
  },
  error: {
    fontSize: 13,
    marginBottom: 12,
    textAlign: "center",
    color: "#F0867F",
  },
  button: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 28,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  link: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 18,
    color: ACCENT,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  footerText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: "700",
    color: ACCENT,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  dividerText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 16,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  googleIcon: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
