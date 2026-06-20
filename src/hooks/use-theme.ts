import { Colors } from '@/constants/theme';

// Tranzfr always uses the light (white/blue/graphite) brand palette,
// regardless of the system color scheme — there is no dark mode design yet.
export function useTheme() {
  return Colors.light;
}
