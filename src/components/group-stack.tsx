import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { GROUP_CARD_HEIGHT, GROUP_CARD_WIDTH, GroupCard } from '@/components/group-card';
import type { Group } from '@/types/models';

interface GroupStackProps {
  groups: Group[];
  onOpenGroup: (id: string) => void;
}

const SWIPE_THRESHOLD = 110;
const MAX_VISIBLE = 3;

export function GroupStack({ groups, onOpenGroup }: GroupStackProps) {
  const [order, setOrder] = useState<string[]>(() => groups.map((g) => g.id));

  // Keep existing order stable as groups load/refresh, append new ones,
  // drop ones that no longer exist (e.g. deleted).
  useEffect(() => {
    setOrder((prev) => {
      const ids = groups.map((g) => g.id);
      const kept = prev.filter((id) => ids.includes(id));
      const added = ids.filter((id) => !kept.includes(id));
      return [...kept, ...added];
    });
  }, [groups]);

  const byId = Object.fromEntries(groups.map((g) => [g.id, g]));
  const visibleIds = order.slice(0, MAX_VISIBLE);

  function sendToBack() {
    setOrder((prev) => [...prev.slice(1), prev[0]]);
  }

  if (visibleIds.length === 0) return null;

  return (
    <View style={styles.wrap}>
      {visibleIds
        .map((id, position) => ({ id, position }))
        .reverse()
        .map(({ id, position }) => {
          const group = byId[id];
          if (!group) return null;
          return (
            <StackCard
              key={id}
              group={group}
              position={position}
              onOpen={() => onOpenGroup(id)}
              onSwiped={sendToBack}
            />
          );
        })}
    </View>
  );
}

function StackCard({
  group,
  position,
  onOpen,
  onSwiped,
}: {
  group: Group;
  position: number;
  onOpen: () => void;
  onSwiped: () => void;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isFront = position === 0;

  const pan = Gesture.Pan()
    .enabled(isFront)
    .minDistance(10)
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY * 0.15;
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > SWIPE_THRESHOLD) {
        const direction = e.translationX > 0 ? 1 : -1;
        translateX.value = withTiming(direction * 520, { duration: 220 }, () => {
          translateX.value = 0;
          translateY.value = 0;
          runOnJS(onSwiped)();
        });
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    zIndex: 10 - position,
    transform: [
      { translateX: isFront ? translateX.value : 0 },
      { translateY: (isFront ? translateY.value : 0) + position * 12 },
      { scale: 1 - position * 0.05 },
    ],
    opacity: 1 - position * 0.18,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={animatedStyle}>
        <GroupCard group={group} onPress={onOpen} />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: GROUP_CARD_WIDTH,
    height: GROUP_CARD_HEIGHT,
    alignSelf: 'center',
  },
});
