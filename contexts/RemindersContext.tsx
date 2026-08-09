import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import {
  cancelMedicationNotifications,
  ensureNotificationSetup,
  scheduleMedicationNotifications,
} from '@/lib/medicationAlarms';

export type MedicationReminder = {
  id: string;
  petId: string;
  petName: string;
  medicineName: string;
  dosage: string;
  times: string[]; // "HH:mm", ordenados
  startDate: string; // "YYYY-MM-DD"
  durationDays: number;
  notificationIds: string[];
  scheduledCount: number;
  totalOccurrences: number;
  createdAt: string;
};

type AddReminderInput = {
  petId: string;
  petName: string;
  medicineName: string;
  dosage: string;
  times: string[];
  durationDays: number;
};

type AddReminderResult =
  | { ok: true; truncated: boolean }
  | { ok: false; reason: 'permission-denied' | 'invalid-input' };

type RemindersContextValue = {
  reminders: MedicationReminder[];
  loading: boolean;
  addReminder: (input: AddReminderInput) => Promise<AddReminderResult>;
  cancelReminder: (id: string) => Promise<void>;
  restoreReminders: (reminders: MedicationReminder[]) => Promise<void>;
};

const STORAGE_KEY = '@petcare/medication-reminders';

const RemindersContext = createContext<RemindersContextValue | null>(null);

export function RemindersProvider({ children }: { children: React.ReactNode }) {
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ensureNotificationSetup();
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setReminders(JSON.parse(raw));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reminders)).catch(() => {});
    }
  }, [reminders, loading]);

  const value = useMemo<RemindersContextValue>(
    () => ({
      reminders,
      loading,
      async addReminder(input) {
        if (!input.medicineName.trim() || input.times.length === 0 || input.durationDays < 1) {
          return { ok: false, reason: 'invalid-input' };
        }

        const startDate = new Date().toISOString().slice(0, 10);
        const result = await scheduleMedicationNotifications({
          petName: input.petName,
          medicineName: input.medicineName,
          dosage: input.dosage,
          times: input.times,
          startDate,
          durationDays: input.durationDays,
        });

        if (!result.granted) {
          return { ok: false, reason: 'permission-denied' };
        }

        const reminder: MedicationReminder = {
          id: `${Date.now()}`,
          petId: input.petId,
          petName: input.petName,
          medicineName: input.medicineName.trim(),
          dosage: input.dosage.trim(),
          times: [...input.times].sort(),
          startDate,
          durationDays: input.durationDays,
          notificationIds: result.notificationIds,
          scheduledCount: result.scheduledCount,
          totalOccurrences: result.totalOccurrences,
          createdAt: new Date().toISOString(),
        };

        setReminders((prev) => [reminder, ...prev]);
        return { ok: true, truncated: result.scheduledCount < result.totalOccurrences };
      },
      async cancelReminder(id) {
        const target = reminders.find((r) => r.id === id);
        if (target) {
          await cancelMedicationNotifications(target.notificationIds);
        }
        setReminders((prev) => prev.filter((r) => r.id !== id));
      },
      async restoreReminders(imported) {
        // cancela os alarmes atualmente agendados antes de substituir pelo backup
        await Promise.all(reminders.map((r) => cancelMedicationNotifications(r.notificationIds)));

        const rebuilt: MedicationReminder[] = [];
        for (const r of imported) {
          if (daysRemaining(r) > 0) {
            const result = await scheduleMedicationNotifications({
              petName: r.petName,
              medicineName: r.medicineName,
              dosage: r.dosage,
              times: r.times,
              startDate: r.startDate,
              durationDays: r.durationDays,
            });
            rebuilt.push({
              ...r,
              notificationIds: result.notificationIds,
              scheduledCount: result.scheduledCount,
              totalOccurrences: result.totalOccurrences,
            });
          } else {
            rebuilt.push({ ...r, notificationIds: [] });
          }
        }
        setReminders(rebuilt);
      },
    }),
    [reminders, loading]
  );

  return <RemindersContext.Provider value={value}>{children}</RemindersContext.Provider>;
}

export function useReminders() {
  const ctx = useContext(RemindersContext);
  if (!ctx) throw new Error('useReminders precisa estar dentro de RemindersProvider');
  return ctx;
}

export function daysRemaining(reminder: MedicationReminder): number {
  const start = new Date(`${reminder.startDate}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + reminder.durationDays);
  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / msPerDay));
}
