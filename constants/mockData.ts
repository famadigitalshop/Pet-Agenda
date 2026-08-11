export type Pet = {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  weight: string;
  initial: string;
  vaccinationStatus?: 'em-dia' | 'atencao';
  vaccinationLabel?: string;
  nextAppointment?: string;
  allergies?: string; // ex.: "Nenhuma alergia conhecida", "Alergia a penicilina"
  vetContact?: string; // ex.: "Dra. Carolina Reis · (11) 98888-7777"
};

export type HealthEventCategory = 'Vacina' | 'Receita' | 'Exame' | 'Cirurgia';

export type Medicine = {
  name: string;
  dosage: string; // ex.: "1 comprimido", "5 ml", "3 gotas em cada ouvido"
  times: string[]; // "HH:mm", ordenados
  durationDays: number;
};

export type HealthEvent = {
  id: string;
  petId: string;
  date: string; // ISO
  category: HealthEventCategory;
  symptom?: string;
  title: string;
  vet: string;
  medicines?: Medicine[]; // uma receita pode ter mais de um remédio
  photoUri?: string; // foto da receita/documento escaneado
  status?: 'pendente' | 'completo'; // pendente = só a foto foi salva, falta completar os detalhes
};

export const healthCategories: HealthEventCategory[] = ['Vacina', 'Receita', 'Exame', 'Cirurgia'];

export const dosagePresets = ['1 comprimido', '1/2 comprimido', '5 ml', '10 ml', '1 gota', '3 gotas'];

export type FrequencyPreset = { label: string; times: string[] };

export const frequencyPresets: FrequencyPreset[] = [
  { label: '1x ao dia', times: ['08:00'] },
  { label: '2x ao dia', times: ['08:00', '20:00'] },
  { label: '3x ao dia', times: ['08:00', '14:00', '20:00'] },
  { label: '4x ao dia', times: ['06:00', '12:00', '18:00', '00:00'] },
];
