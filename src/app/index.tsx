import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CreateGroupSheet } from '@/components/create-group-sheet';
import { GroupCard } from '@/components/group-card';
import { useTheme } from '@/hooks/use-theme';
import { useGroupsStore } from '@/store/use-groups-store';

export default function GroupsListScreen() {
  const theme = useTheme();
  const router = useRouter();
  const groups = useGroupsStore((s) => s.groups);
  const [sheetVisible, setSheetVisible] = useState(false);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Tus grupos</Text>
        <Pressable
          onPress={() => setSheetVisible(true)}
          style={[styles.fab, { backgroundColor: theme.accent }]}
        >
          <Feather name="plus" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      {groups.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="users" size={40} color={theme.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Aún no tienes grupos. Crea el primero para empezar a repartir gastos.
          </Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <GroupCard
              group={item}
              onPress={() => router.push({ pathname: '/group/[id]', params: { id: item.id } })}
            />
          )}
        />
      )}

      <CreateGroupSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
  },
  fab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
