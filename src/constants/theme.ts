export const Colors = {
  light: {
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#212529',
    textSecondary: '#6B7280',
    border: '#E9ECEF',
    accent: '#208AEF',
    accentSoft: '#E6F4FE',
    credit: '#00966F',
    creditSoft: '#E1F3EC',
    debt: '#D8473F',
    debtSoft: '#FBEAE8',
  },
  dark: {
    background: '#16181B',
    card: '#212529',
    text: '#F4F4F6',
    textSecondary: '#9CA3AF',
    border: '#2C2F33',
    accent: '#4DA8F5',
    accentSoft: '#1B3A57',
    credit: '#34D9A6',
    creditSoft: '#193029',
    debt: '#F0867F',
    debtSoft: '#332220',
  },
};

export type ThemeColors = typeof Colors.light;

// Manrope for headings/amounts only — body text stays on the system font for
// legibility and to keep the bundle small. Loaded via useFonts in _layout.tsx.
export const Fonts = {
  heading: 'Manrope_800ExtraBold',
  bold: 'Manrope_700Bold',
};
