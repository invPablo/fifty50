import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';

const TAB_DARK = '#212529';

function FloatingTabBar({ state, navigation }: any) {
  const theme = useTheme();

  const icons: Record<string, ComponentProps<typeof Feather>['name']> = {
    index: 'home',
    profile: 'user',
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <View style={[styles.bar, { backgroundColor: TAB_DARK }]}>
        {state.routes.map((route: any, index: number) => {
          const focused = state.index === index;
          return (
            <Pressable
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={[styles.tabItem, focused && { backgroundColor: '#FFFFFF' }]}
            >
              <Feather
                name={icons[route.name] ?? 'circle'}
                size={20}
                color={focused ? TAB_DARK : '#FFFFFF'}
              />
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  bar: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 8,
    padding: 8,
    marginBottom: 12,
    borderRadius: 32,
    boxShadow: '0px 8px 20px rgba(0,0,0,0.25)',
  },
  tabItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
