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

        <View style={[styles.featureRow, { borderColor: theme.border }]}>
          <Feather name="home" size={16} color={theme.textSecondary} />
          <Text style={[styles.featureText, { color: theme.textSecondary }]}>
            Grupos de piso compartido
          </Text>
          <View style={[styles.soonPill, { backgroundColor: theme.accentSoft }]}>
            <Text style={[styles.soonPillText, { color: theme.accent }]}>Próximamente</Text>
          </View>
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
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    width: '100%',
  },
  featureText: {
    fontSize: 13,
    flex: 1,
  },
  soonPill: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  soonPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
