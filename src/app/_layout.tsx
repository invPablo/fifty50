import {
  Quicksand_600SemiBold,
  Quicksand_700Bold,
  useFonts,
} from '@expo-google-fonts/quicksand';
import * as Linking from 'expo-linking';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useSession } from '@/hooks/use-session';
import { initI18n } from '@/i18n';
import { supabase } from '@/lib/supabase';

export default function RootLayout() {
  const { session, initializing } = useSession();
  const [fontsLoaded] = useFonts({ Quicksand_600SemiBold, Quicksand_700Bold });
  const [i18nReady, setI18nReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    initI18n().then(() => setI18nReady(true));
  }, []);

  // Password-reset and signup-confirmation emails deep-link back into the
  // app as tranzfr://...#access_token=...&type=recovery|signup (Supabase's
  // default project uses the implicit flow, tokens in the fragment, not the
  // PKCE ?code= flow). Supabase doesn't auto-detect this on native
  // (detectSessionInUrl is web-only), so we parse the tokens ourselves and
  // route recovery links to the dedicated reset screen instead of dropping
  // the user on the app home.
  useEffect(() => {
    function handleUrl(url: string | null) {
      if (!url) return;
      const paramsString = url.includes('#') ? url.split('#')[1] : url.split('?')[1];
      if (!paramsString) return;
      const params = new URLSearchParams(paramsString);
      const code = params.get('code');
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const type = params.get('type');

      if (code) {
        supabase.auth.exchangeCodeForSession(url).then(({ error }) => {
          if (!error && type === 'recovery') router.replace('/reset-password');
        });
      } else if (accessToken && refreshToken) {
        supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(
          ({ error }) => {
            if (!error && type === 'recovery') router.replace('/reset-password');
          }
        );
      }
    }
    Linking.getInitialURL().then(handleUrl);
    const subscription = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (initializing) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!session && !inAuthGroup) {
      router.replace('/welcome');
    } else if (session && inAuthGroup) {
      router.replace('/');
    }
  }, [session, initializing, segments]);

  if (initializing || !fontsLoaded || !i18nReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="change-password" options={{ headerShown: false }} />
        <Stack.Screen name="reset-password" options={{ headerShown: false }} />
        <Stack.Screen name="group/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="join/[groupId]" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
