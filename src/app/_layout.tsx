import { Stack } from "expo-router";
import { useEffect } from "react";

import { useGroupsStore } from "@/store/use-groups-store";

export default function RootLayout() {
  const loadGroups = useGroupsStore((s) => s.loadGroups);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
