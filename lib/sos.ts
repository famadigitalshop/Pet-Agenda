import { Pet } from '@/constants/mockData';
import { MedicationReminder } from '@/contexts/RemindersContext';
import { escapeHtml, shareHtmlAsPdf, ShareHtmlResult } from '@/lib/pdf';

function buildHtml(pet: Pet, activeReminders: MedicationReminder[]) {
  const treatmentsHtml = activeReminders.length
    ? `<ul>${activeReminders
        .map((r) => `<li><b>${escapeHtml(r.medicineName)}</b> — ${escapeHtml(r.dosage)} — ${escapeHtml(r.times.join(', '))}</li>`)
        .join('')}</ul>`
    : '<div class="value">Nenhum tratamento ativo no momento</div>';

  return `<!doctype html>
<html>
<head><meta charset="utf-8" />
<style>
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; color:#2a1b45; padding:32px; }
  h1 { font-size: 22px; margin-bottom: 4px; }
  .sub { color:#5f5470; margin-bottom:24px; }
  .section { margin-bottom: 20px; }
  .label { font-size:11px; text-transform:uppercase; letter-spacing:0.6px; color:#8d84a0; margin-bottom:4px; }
  .value { font-size:15px; margin-bottom: 12px; }
  .alert { background:#fbe0cc; border:1px solid #f0813e; border-radius:8px; padding:12px 16px; margin-bottom:20px; }
  ul { margin:0; padding-left:18px; }
  li { margin-bottom:8px; font-size: 15px; }
  .footer { margin-top:32px; font-size:11px; color:#8d84a0; }
</style>
</head>
<body>
  <h1>🆘 Ficha de Emergência — ${escapeHtml(pet.name)}</h1>
  <div class="sub">${escapeHtml(pet.species)} · ${escapeHtml(pet.breed)} · ${escapeHtml(pet.age)}</div>

  <div class="alert">
    <div class="label">Alergias conhecidas</div>
    <div class="value" style="margin:0">${escapeHtml(pet.allergies || 'Nenhuma registrada')}</div>
  </div>

  <div class="section">
    <div class="label">Peso atual</div>
    <div class="value">${escapeHtml(pet.weight)}</div>
    <div class="label">Veterinário responsável</div>
    <div class="value">${escapeHtml(pet.vetContact || 'Não informado')}</div>
  </div>

  <div class="section">
    <div class="label">Tratamentos ativos</div>
    ${treatmentsHtml}
  </div>

  <div class="footer">Gerado pelo MeuPet+ em ${new Date().toLocaleString('pt-BR')}</div>
</body>
</html>`;
}

export type SosResult = ShareHtmlResult;

export async function generateSosReport(pet: Pet, activeReminders: MedicationReminder[]): Promise<SosResult> {
  const html = buildHtml(pet, activeReminders);
  return shareHtmlAsPdf(html, `Ficha de emergência de ${pet.name}`);
}
