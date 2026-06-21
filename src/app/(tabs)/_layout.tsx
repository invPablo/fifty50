import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CreateGroupSheet } from '@/components/create-group-sheet';
import { PaywallSheet } from '@/components/paywall-sheet';
import { useTheme } from '@/hooks/use-theme';
import { useUiStore } from '@/store/use-ui-store';

const TAB_DARK = '#212529';

function FloatingTabBar({ state, navigation }: any) {
  const theme = useTheme();
  const openCreateGroupSheet = useUiStore((s) => s.openCreateGroupSheet);

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
            <View key={route.key} style={styles.itemSlot}>
              <Pressable
                onPress={() => navigation.navigate(route.name)}
                style={[styles.tabItem, focused && { backgroundColor: '#FFFFFF' }]}
              >
                <Feather
                  name={icons[route.name] ?? 'circle'}
                  size={20}
                  color={focused ? TAB_DARK : '#FFFFFF'}
                />
              </Pressable>
              {index === 0 && (
                <Pressable
                  onPress={openCreateGroupSheet}
                  style={[styles.addItem, { backgroundColor: theme.accent }]}
                >
                  <Feather name="plus" size={22} color="#FFFFFF" />
                </Pressable>
              )}
            </View>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

export default function TabsLayout() {
  const createGroupSheetOpen = useUiStore((s) => s.createGroupSheetOpen);
  const closeCreateGroupSheet = useUiStore((s) => s.closeCreateGroupSheet);
  const [paywallVisible, setPaywallVisible] = useState(false);

  return (
    <>
      <Tabs
        tabBar={(props) => <FloatingTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="profile" />
      </Tabs>

      <CreateGroupSheet
        visible={createGroupSheetOpen}
        onClose={closeCreateGroupSheet}
        onPremiumRequired={() => {
          closeCreateGroupSheet();
          setTimeout(() => setPaywallVisible(true), 300);
        }}
      />
      <PaywallSheet visible={paywallVisible} onClose={() => setPaywallVisible(false)} />
    </>
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
  itemSlot: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
