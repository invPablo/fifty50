import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';

import { buildActivityFeed } from '@/lib/activity';
import type { Group } from '@/types/models';

const LAST_SEEN_KEY = 'tranzfr_activity_last_seen';

export function useActivityFeed(groups: Group[]) {
  const [lastSeen, setLastSeen] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(LAST_SEEN_KEY).then((value) => {
      setLastSeen(value ? Number(value) : 0);
      setLoaded(true);
    });
  }, []);

  const items = useMemo(() => buildActivityFeed(groups), [groups]);
  const unreadCount = loaded
    ? items.filter((item) => new Date(item.date).getTime() > lastSeen).length
    : 0;

  function markAllRead() {
    const now = Date.now();
    setLastSeen(now);
    AsyncStorage.setItem(LAST_SEEN_KEY, String(now));
  }

  return { items, unreadCount, markAllRead };
}
