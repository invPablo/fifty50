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
    debt: '#D8473F',
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
    debt: '#F0867F',
  },
};

export type ThemeColors = typeof Colors.light;
