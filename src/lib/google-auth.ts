import * as WebBrowser from 'expo-web-browser';

import { supabase } from '@/lib/supabase';

// Supabase's signInWithOAuth() normally redirects the browser itself, which
// doesn't make sense on native. skipBrowserRedirect gets us the auth URL to
// open ourselves in an in-app browser session; once Google redirects back to
// tranzfr://, the session tokens arrive in the URL fragment (implicit flow,
// same shape as the password-recovery deep links) which we parse here
// directly rather than relying on the global Linking listener, since
// openAuthSessionAsync already gives us the final URL.
export async function signInWithGoogle(): Promise<{ error: string | null }> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'tranzfr://',
      skipBrowserRedirect: true,
    },
  });

  if (error) return { error: error.message };
  if (!data?.url) return { error: 'No se pudo iniciar el flujo de Google' };

  const result = await WebBrowser.openAuthSessionAsync(data.url, 'tranzfr://');

  if (result.type !== 'success' || !result.url) {
    return { error: null }; // user cancelled — not an error to surface
  }

  const fragment = result.url.split('#')[1] ?? result.url.split('?')[1];
  if (!fragment) return { error: 'No se pudo completar el inicio de sesión con Google' };

  const params = new URLSearchParams(fragment);
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (!accessToken || !refreshToken) {
    return { error: 'No se pudo completar el inicio de sesión con Google' };
  }

  const { error: setSessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return { error: setSessionError?.message ?? null };
}
