import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { HealthEvent, healthEvents as seedEvents } from '@/constants/mockData';

const STORAGE_KEY = '@petcare/health-events';

type EventsContextValue = {
  events: HealthEvent[];
  loading: boolean;
  addEvent: (event: HealthEvent) => void;
  updateEvent: (id: string, patch: Partial<HealthEvent>) => void;
  replaceAll: (events: HealthEvent[]) => void;
};

const EventsContext = createContext<EventsContextValue | null>(null);

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<HealthEvent[]>(seedEvents);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setEvents(JSON.parse(raw));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(events)).catch(() => {});
    }
  }, [events, loading]);

  const value = useMemo<EventsContextValue>(
    () => ({
      events,
      loading,
      addEvent(event) {
        setEvents((prev) => [event, ...prev]);
      },
      updateEvent(id, patch) {
        setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
      },
      replaceAll(nextEvents) {
        setEvents(nextEvents);
      },
    }),
    [events, loading]
  );

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export function useEvents() {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useEvents precisa estar dentro de EventsProvider');
  return ctx;
}
