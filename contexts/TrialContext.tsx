import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const TRIAL_STARTED_KEY = '@petcare/trial-started-at';
const SUBSCRIBED_KEY = '@petcare/subscribed';
export const TRIAL_DAYS = 7;

type TrialContextValue = {
  loading: boolean;
  daysLeft: number;
  isTrialActive: boolean;
  isSubscribed: boolean;
  isPremium: boolean; // trial ativo OU assinante
  subscribe: () => Promise<void>;
};

const TrialContext = createContext<TrialContextValue | null>(null);

export function TrialProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [trialStartedAt, setTrialStartedAt] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    (async () => {
      let started = await AsyncStorage.getItem(TRIAL_STARTED_KEY);
      if (!started) {
        started = new Date().toISOString();
        await AsyncStorage.setItem(TRIAL_STARTED_KEY, started);
      }
      setTrialStartedAt(started);
      const subscribed = await AsyncStorage.getItem(SUBSCRIBED_KEY);
      setIsSubscribed(subscribed === 'true');
      setLoading(false);
    })();
  }, []);

  const daysLeft = useMemo(() => {
    if (!trialStartedAt) return TRIAL_DAYS;
    const msPerDay = 1000 * 60 * 60 * 24;
    const elapsedDays = Math.floor((Date.now() - new Date(trialStartedAt).getTime()) / msPerDay);
    return Math.max(0, TRIAL_DAYS - elapsedDays);
  }, [trialStartedAt]);

  const isTrialActive = daysLeft > 0;

  const value = useMemo<TrialContextValue>(
    () => ({
      loading,
      daysLeft,
      isTrialActive,
      isSubscribed,
      isPremium: isTrialActive || isSubscribed,
      async subscribe() {
        await AsyncStorage.setItem(SUBSCRIBED_KEY, 'true');
        setIsSubscribed(true);
      },
    }),
    [loading, daysLeft, isTrialActive, isSubscribed]
  );

  return <TrialContext.Provider value={value}>{children}</TrialContext.Provider>;
}

export function useTrial() {
  const ctx = useContext(TrialContext);
  if (!ctx) throw new Error('useTrial precisa estar dentro de TrialProvider');
  return ctx;
}
