import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/bottom-sheet';
import { useTheme } from '@/hooks/use-theme';

interface PaywallSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function PaywallSheet({ visible, onClose }: PaywallSheetProps) {
  const theme = useTheme();

  return (
    <BottomSheet visible={visible} title="Ya usaste tu grupo gratis" onClose={onClose}>
      <View style={styles.body}>
        <View style={[styles.iconCircle, { backgroundColor: theme.accentSoft }]}>
          <Feather name="lock" size={28} color={theme.accent} />
        </View>
        <Text style={[styles.text, { color: theme.textSecondary }]}>
          Puedes unirte a todos los grupos que quieras gratis. Para crear más de uno propio,
          desbloquea grupos ilimitados con un pago único.
        </Text>

        <View style={[styles.priceTag, { backgroundColor: theme.accentSoft }]}>
          <Text style={[styles.priceText, { color: theme.accent }]}>2,99 €</Text>
          <Text style={[styles.priceHint, { color: theme.accent }]}>pago único</Text>
        </View>

        <Text style={[styles.comingSoon, { color: theme.textSecondary }]}>
          Los pagos llegarán antes de publicar la app en las tiendas. De momento esta pantalla es
          solo para probar el flujo.
        </Text>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  priceTag: {
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  priceText: {
    fontSize: 24,
    fontWeight: '800',
  },
  priceHint: {
    fontSize: 12,
    marginTop: 2,
  },
  comingSoon: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
});
