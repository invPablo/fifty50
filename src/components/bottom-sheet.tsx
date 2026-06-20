import { Feather } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface BottomSheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function BottomSheet({ visible, title, onClose, children }: BottomSheetProps) {
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.overlayTouchable} onPress={onClose}>
          <Pressable
            style={[styles.sheet, { backgroundColor: theme.card }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.text, fontFamily: Fonts.heading }]}>
                {title}
              </Text>
              <Pressable onPress={onClose} hitSlop={8} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
                <Feather name="x" size={22} color={theme.textSecondary} />
              </Pressable>
            </View>
            {children}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  overlayTouchable: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 19,
  },
});
