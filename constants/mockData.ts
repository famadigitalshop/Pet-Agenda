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

export const seedPets: Pet[] = [
  {
    id: 'nina',
    name: 'Nina',
    species: 'Cadela',
    breed: 'Vira-lata',
    age: '4 anos',
    weight: '14 kg',
    initial: 'N',
    vaccinationStatus: 'em-dia',
    vaccinationLabel: 'Vacinas em dia',
    nextAppointment: '20 ago · Consulta de rotina',
    allergies: 'Alergia de pele (Apoquel controla os sintomas)',
    vetContact: 'Dra. Carolina Reis · (11) 98888-7777',
  },
  {
    id: 'trufa',
    name: 'Trufa',
    species: 'Gato',
    breed: 'SRD',
    age: '2 anos',
    weight: '4,2 kg',
    initial: 'T',
    vaccinationStatus: 'atencao',
    vaccinationLabel: 'Antirrábica vence em 12 dias',
    allergies: 'Nenhuma alergia conhecida',
    vetContact: 'Dra. Carolina Reis · (11) 98888-7777',
  },
];

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

export const healthEvents: HealthEvent[] = [
  {
    id: '1',
    petId: 'nina',
    date: '2026-07-02',
    category: 'Receita',
    symptom: 'Otite',
    title: 'Otomax — 3x ao dia por 7 dias',
    vet: 'Dra. Carolina Reis',
    medicines: [
      { name: 'Otomax', dosage: '3 gotas em cada ouvido', times: ['08:00', '14:00', '20:00'], durationDays: 7 },
    ],
  },
  {
    id: '2',
    petId: 'nina',
    date: '2026-06-15',
    category: 'Vacina',
    title: 'V10 (múltipla)',
    vet: 'Clínica AmigoVet',
  },
  {
    id: '3',
    petId: 'nina',
    date: '2026-03-10',
    category: 'Receita',
    symptom: 'Alergia de pele e otite secundária',
    title: 'Apoquel 16mg, Otomax',
    vet: 'Dra. Carolina Reis',
    medicines: [
      { name: 'Apoquel 16mg', dosage: '1 comprimido', times: ['08:00'], durationDays: 14 },
      { name: 'Otomax', dosage: '3 gotas em cada ouvido', times: ['08:00', '20:00'], durationDays: 7 },
    ],
  },
  {
    id: '4',
    petId: 'trufa',
    date: '2026-05-01',
    category: 'Exame',
    symptom: 'Check-up',
    title: 'Hemograma completo — normal',
    vet: 'Dra. Carolina Reis',
  },
  {
    id: '5',
    petId: 'nina',
    date: '2024-05-18',
    category: 'Receita',
    symptom: 'Otite',
    title: 'Otosynalar — 2x ao dia por 10 dias',
    vet: 'Dr. Marcelo Souza',
    medicines: [{ name: 'Otosynalar', dosage: '3 gotas em cada ouvido', times: ['08:00', '20:00'], durationDays: 10 }],
  },
  {
    id: '6',
    petId: 'nina',
    date: '2023-11-02',
    category: 'Cirurgia',
    title: 'Castração',
    vet: 'Clínica AmigoVet',
  },
];

export const healthCategories: HealthEventCategory[] = ['Vacina', 'Receita', 'Exame', 'Cirurgia'];

export const dosagePresets = ['1 comprimido', '1/2 comprimido', '5 ml', '10 ml', '1 gota', '3 gotas'];

export type FrequencyPreset = { label: string; times: string[] };

export const frequencyPresets: FrequencyPreset[] = [
  { label: '1x ao dia', times: ['08:00'] },
  { label: '2x ao dia', times: ['08:00', '20:00'] },
  { label: '3x ao dia', times: ['08:00', '14:00', '20:00'] },
  { label: '4x ao dia', times: ['06:00', '12:00', '18:00', '00:00'] },
];
