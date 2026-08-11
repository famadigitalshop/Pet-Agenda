import { HealthEvent, Pet } from '@/constants/mockData';
import { escapeHtml, shareHtmlAsPdf, ShareHtmlResult } from '@/lib/pdf';

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-');
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`;
}

function eventHtml(event: HealthEvent) {
  const isPending = event.status === 'pendente';
  const medicinesHtml = event.medicines?.length
    ? `<ul>${event.medicines
        .map(
          (m) =>
            `<li><b>${escapeHtml(m.name)}</b> — ${escapeHtml(m.dosage)} — ${escapeHtml(m.times.join(', '))} · ${m.durationDays} dia${m.durationDays > 1 ? 's' : ''}</li>`
        )
        .join('')}</ul>`
    : '';

  return `
    <div class="event">
      <div class="event-top">
        <span class="tag">${escapeHtml(event.category)}</span>
        <span class="date">${formatDate(event.date)}</span>
      </div>
      <div class="event-title">${escapeHtml(event.title)}${isPending ? ' <span class="pending">(pendente — detalhes incompletos)</span>' : ''}</div>
      ${event.symptom ? `<div class="event-sub">Motivo: ${escapeHtml(event.symptom)}</div>` : ''}
      ${medicinesHtml}
      <div class="event-sub">${escapeHtml(event.vet)}</div>
    </div>`;
}

function buildHistoryHtml(pet: Pet, events: HealthEvent[]) {
  const sorted = [...events].sort((a, b) => (a.date < b.date ? 1 : -1));
  const body = sorted.length ? sorted.map(eventHtml).join('') : '<div class="empty">Nenhum registro ainda.</div>';

  return `<!doctype html>
<html>
<head><meta charset="utf-8" />
<style>
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; color:#2a1b45; padding:32px; }
  h1 { font-size: 22px; margin-bottom: 4px; }
  .sub { color:#5f5470; margin-bottom:24px; }
  .event { border: 1px solid #ecdccb; border-radius: 10px; padding: 14px 16px; margin-bottom: 12px; page-break-inside: avoid; }
  .event-top { display:flex; justify-content: space-between; align-items:center; margin-bottom: 6px; }
  .tag { background:#fbe0cc; color:#a1531f; font-size:10.5px; text-transform:uppercase; letter-spacing:0.4px; padding:3px 8px; border-radius:6px; }
  .date { font-size: 12px; color:#8d84a0; font-family: ui-monospace, Menlo, Consolas, monospace; }
  .event-title { font-size: 15px; font-weight:600; }
  .pending { color:#b2842c; font-weight:600; font-size: 12.5px; }
  .event-sub { font-size: 12.5px; color:#5f5470; margin-top: 4px; }
  ul { margin: 8px 0 0; padding-left:18px; }
  li { font-size: 13.5px; margin-bottom: 4px; }
  .empty { color:#8d84a0; }
  .footer { margin-top:32px; font-size:11px; color:#8d84a0; }
</style>
</head>
<body>
  <h1>Histórico de Saúde — ${escapeHtml(pet.name)}</h1>
  <div class="sub">${escapeHtml(pet.species)} · ${escapeHtml(pet.breed)} · ${escapeHtml(pet.age)} · ${sorted.length} registro${sorted.length !== 1 ? 's' : ''}</div>
  ${body}
  <div class="footer">Gerado pelo MeuPet+ em ${new Date().toLocaleString('pt-BR')}</div>
</body>
</html>`;
}

export type ExportHistoryResult = ShareHtmlResult;

export async function exportHistoryPdf(pet: Pet, events: HealthEvent[]): Promise<ExportHistoryResult> {
  const html = buildHistoryHtml(pet, events);
  return shareHtmlAsPdf(html, `Histórico de ${pet.name}`);
}
