export type Pet = {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  weight: string;
  initial: string;
  vaccinationStatus: 'em-dia' | 'atencao';
  vaccinationLabel: string;
  nextAppointment?: string;
};

export const pets: Pet[] = [
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
  },
];

export type HealthEventCategory = 'Vacina' | 'Receita' | 'Exame' | 'Cirurgia';

export type Medicine = {
  name: string;
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
    medicines: [{ name: 'Otomax', times: ['08:00', '14:00', '20:00'], durationDays: 7 }],
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
      { name: 'Apoquel 16mg', times: ['08:00'], durationDays: 14 },
      { name: 'Otomax', times: ['08:00', '20:00'], durationDays: 7 },
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
    medicines: [{ name: 'Otosynalar', times: ['08:00', '20:00'], durationDays: 10 }],
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
