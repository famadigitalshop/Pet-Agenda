import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

import { HealthEvent, Pet } from '@/constants/mockData';
import { MedicationReminder } from '@/contexts/RemindersContext';

export type BackupPayload = {
  version: 1;
  exportedAt: string;
  pets: Pet[];
  events: HealthEvent[];
  reminders: MedicationReminder[];
};

export type ExportResult = { ok: true } | { ok: false; reason: 'sharing-unavailable' };

export async function exportBackup(payload: {
  pets: Pet[];
  events: HealthEvent[];
  reminders: MedicationReminder[];
}): Promise<ExportResult> {
  const data: BackupPayload = { version: 1, exportedAt: new Date().toISOString(), ...payload };
  const json = JSON.stringify(data, null, 2);
  const filename = `meupet-backup-${new Date().toISOString().slice(0, 10)}.json`;

  if (Platform.OS === 'web') {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return { ok: true };
  }

  const fileUri = FileSystem.documentDirectory + filename;
  await FileSystem.writeAsStringAsync(fileUri, json, { encoding: FileSystem.EncodingType.UTF8 });

  const available = await Sharing.isAvailableAsync();
  if (!available) {
    return { ok: false, reason: 'sharing-unavailable' };
  }
  await Sharing.shareAsync(fileUri, { mimeType: 'application/json', dialogTitle: 'Salvar backup do MeuPet+' });
  return { ok: true };
}

export type ImportResult = { ok: true; data: BackupPayload } | { ok: false; reason: 'canceled' | 'invalid' };

function isValidBackup(data: unknown): data is BackupPayload {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return Array.isArray(d.pets) && Array.isArray(d.events) && Array.isArray(d.reminders);
}

export async function pickBackup(): Promise<ImportResult> {
  const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
  if (result.canceled || !result.assets?.[0]) {
    return { ok: false, reason: 'canceled' };
  }
  const asset = result.assets[0];

  try {
    let text: string;
    if (Platform.OS === 'web' && asset.base64) {
      // No navegador o base64 vem como Data URL completa (data:...;base64,XXXX)
      const base64 = asset.base64.includes(',') ? asset.base64.split(',')[1] : asset.base64;
      const bytes = Uint8Array.from(atob(base64), (ch) => ch.charCodeAt(0));
      text = new TextDecoder('utf-8').decode(bytes);
    } else {
      text = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.UTF8 });
    }
    const data = JSON.parse(text);
    if (!isValidBackup(data)) {
      return { ok: false, reason: 'invalid' };
    }
    return { ok: true, data };
  } catch {
    return { ok: false, reason: 'invalid' };
  }
}
