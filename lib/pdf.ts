import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export type ShareHtmlResult = { ok: true } | { ok: false; reason: 'sharing-unavailable' | 'popup-blocked' };

export async function shareHtmlAsPdf(html: string, dialogTitle: string): Promise<ShareHtmlResult> {
  if (Platform.OS === 'web') {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      return { ok: false, reason: 'popup-blocked' };
    }
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    return { ok: true };
  }

  const { uri } = await Print.printToFileAsync({ html });
  const available = await Sharing.isAvailableAsync();
  if (!available) {
    return { ok: false, reason: 'sharing-unavailable' };
  }
  await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle });
  return { ok: true };
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]!));
}
