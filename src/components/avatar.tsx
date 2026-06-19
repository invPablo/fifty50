import { StyleSheet, Text, View } from 'react-native';

import { getAvatarColor, getInitials } from '@/lib/avatar';

interface AvatarProps {
  id: string;
  name: string;
  size?: number;
}

export function Avatar({ id, name, size = 32 }: AvatarProps) {
  const color = getAvatarColor(id);

  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.4 }]}>{getInitials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
