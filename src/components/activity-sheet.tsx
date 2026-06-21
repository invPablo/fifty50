import { Feather } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/bottom-sheet';
import { useTheme } from '@/hooks/use-theme';
import type { ActivityItem } from '@/lib/activity';

interface ActivitySheetProps {
  visible: boolean;
  onClose: () => void;
  items: ActivityItem[];
  onOpenGroup: (groupId: string) => void;
}

export function ActivitySheet({ visible, onClose, items, onOpenGroup }: ActivitySheetProps) {
  const theme = useTheme();

  return (
    <BottomSheet visible={visible} title="Actividad" onClose={onClose}>
      <ScrollView>
        {items.length === 0 ? (
          <Text style={[styles.empty, { color: theme.textSecondary }]}>
            Todavía no hay movimientos en tus grupos.
          </Text>
        ) : (
          items.slice(0, 30).map((item) => (
            <Pressable
              key={item.id}
              onPress={() => {
                onClose();
                onOpenGroup(item.groupId);
              }}
              style={({ pressed }) => [
                styles.row,
                { borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <View style={[styles.iconWrap, { backgroundColor: theme.accentSoft }]}>
                <Feather name="activity" size={16} color={theme.accent} />
              </View>
              <View style={styles.textWrap}>
                <Text style={[styles.text, { color: theme.text }]}>{item.text}</Text>
                <Text style={[styles.date, { color: theme.textSecondary }]}>
                  {new Date(item.date).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  empty: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  text: {
    fontSize: 14,
    lineHeight: 19,
  },
  date: {
    fontSize: 12,
  },
});
