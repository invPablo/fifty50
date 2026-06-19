import {
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/manrope';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { useSession } from '@/hooks/use-session';

export default function RootLayout() {
  const { session, initializing } = useSession();
  const [fontsLoaded] = useFonts({ Manrope_700Bold, Manrope_800ExtraBold });
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (initializing) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!session && !inAuthGroup) {
      router.replace('/login');
    } else if (session && inAuthGroup) {
      router.replace('/');
    }
  }, [session, initializing, segments]);

  if (initializing || !fontsLoaded) return null;

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="group/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
