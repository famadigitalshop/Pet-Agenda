import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// iOS permite no máximo 64 notificações locais pendentes por app — deixamos
// uma margem de segurança. Tratamentos mais longos que isso precisariam de
// push remoto (servidor) em vez de notificação agendada localmente.
const MAX_SCHEDULED_NOTIFICATIONS = 60;

export type ScheduleInput = {
  petName: string;
  medicineName: string;
  dosage: string;
  times: string[]; // "HH:mm"
  startDate: string; // "YYYY-MM-DD"
  durationDays: number;
};

export type ScheduleResult = {
  granted: boolean;
  notificationIds: string[];
  totalOccurrences: number;
  scheduledCount: number;
};

export async function ensureNotificationSetup() {
  // Alarme agendado (scheduleNotificationAsync) só existe em build nativo
  // iOS/Android — no navegador (Expo web) a API não está disponível.
  if (Platform.OS === 'web') return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('medication-alarms', {
      name: 'Alarmes de remédio',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
    });
  }
}

function buildOccurrences({ times, startDate, durationDays }: Omit<ScheduleInput, 'petName' | 'medicineName' | 'dosage'>) {
  const sortedTimes = [...times].sort();
  const occurrences: { date: Date; isLast: boolean }[] = [];

  for (let day = 0; day < durationDays; day++) {
    sortedTimes.forEach((time, timeIndex) => {
      const [hours, minutes] = time.split(':').map(Number);
      const date = new Date(`${startDate}T00:00:00`);
      date.setDate(date.getDate() + day);
      date.setHours(hours, minutes, 0, 0);

      if (date.getTime() > Date.now()) {
        occurrences.push({
          date,
          isLast: day === durationDays - 1 && timeIndex === sortedTimes.length - 1,
        });
      }
    });
  }
  return occurrences;
}

export async function scheduleMedicationNotifications(input: ScheduleInput): Promise<ScheduleResult> {
  const { petName, medicineName, dosage, times, startDate, durationDays } = input;
  const occurrences = buildOccurrences({ times, startDate, durationDays });

  if (Platform.OS === 'web') {
    // Simula o agendamento no protótipo web para o fluxo poder ser demonstrado
    // sem um dispositivo físico. Em iOS/Android (Expo Go ou build) os alarmes
    // são de verdade, agendados pelo sistema operacional.
    return {
      granted: true,
      notificationIds: [],
      totalOccurrences: occurrences.length,
      scheduledCount: occurrences.length,
    };
  }

  const permission = await Notifications.requestPermissionsAsync();
  if (permission.status !== 'granted') {
    return { granted: false, notificationIds: [], totalOccurrences: 0, scheduledCount: 0 };
  }

  // Garante que a notificação da última dose sempre seja agendada,
  // mesmo que o meio do tratamento precise ser truncado pelo limite do iOS.
  let toSchedule = occurrences;
  if (occurrences.length > MAX_SCHEDULED_NOTIFICATIONS) {
    const last = occurrences[occurrences.length - 1];
    toSchedule = [...occurrences.slice(0, MAX_SCHEDULED_NOTIFICATIONS - 1), last];
  }

  const notificationIds: string[] = [];
  for (const occurrence of toSchedule) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: occurrence.isLast ? `Última dose — ${medicineName}` : `Hora do remédio de ${petName}`,
        body: occurrence.isLast
          ? `${petName} toma agora a última dose de ${medicineName} (${dosage}). Tratamento concluído! 🎉`
          : `Dar ${dosage} de ${medicineName} para ${petName} agora.`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: occurrence.date,
        channelId: Platform.OS === 'android' ? 'medication-alarms' : undefined,
      },
    });
    notificationIds.push(id);
  }

  return {
    granted: true,
    notificationIds,
    totalOccurrences: occurrences.length,
    scheduledCount: toSchedule.length,
  };
}

export async function cancelMedicationNotifications(notificationIds: string[]) {
  if (Platform.OS === 'web' || notificationIds.length === 0) return;
  await Promise.all(notificationIds.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
}
