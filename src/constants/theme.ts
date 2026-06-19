export const Colors = {
  light: {
    background: '#F7F7FA',
    card: '#FFFFFF',
    text: '#16161D',
    textSecondary: '#6B6B76',
    border: '#E7E6EE',
    accent: '#6C5CE7',
    accentSoft: '#EEEDFE',
    credit: '#00966F',
    creditSoft: '#E1F3EC',
    debt: '#D8473F',
    debtSoft: '#FBEAE8',
  },
  dark: {
    background: '#12121A',
    card: '#1C1C26',
    text: '#F4F4F6',
    textSecondary: '#9999A6',
    border: '#2C2C38',
    accent: '#7F77DD',
    accentSoft: '#26215C',
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
