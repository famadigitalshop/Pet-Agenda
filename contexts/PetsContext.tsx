import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { Pet } from '@/constants/mockData';

const STORAGE_KEY = '@petcare/pets';

type NewPetInput = {
  name: string;
  species: string;
  breed: string;
  age: string;
  weight: string;
  allergies?: string;
  vetContact?: string;
  vaccinationStatus?: 'em-dia' | 'atencao';
  vaccinationLabel?: string;
  nextAppointment?: string;
};

type PetsContextValue = {
  pets: Pet[];
  loading: boolean;
  addPet: (input: NewPetInput) => Pet;
  updatePet: (id: string, input: NewPetInput) => void;
  deletePet: (id: string) => void;
  replaceAll: (pets: Pet[]) => void;
};

const PetsContext = createContext<PetsContextValue | null>(null);

export function PetsProvider({ children }: { children: React.ReactNode }) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setPets(JSON.parse(raw));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pets)).catch(() => {});
    }
  }, [pets, loading]);

  const value = useMemo<PetsContextValue>(
    () => ({
      pets,
      loading,
      addPet(input) {
        const pet: Pet = {
          id: `pet-${Date.now()}`,
          name: input.name.trim(),
          species: input.species.trim(),
          breed: input.breed.trim() || 'SRD',
          age: input.age.trim() || '—',
          weight: input.weight.trim() || '—',
          initial: input.name.trim().charAt(0).toUpperCase() || '?',
          allergies: input.allergies?.trim() || undefined,
          vetContact: input.vetContact?.trim() || undefined,
          vaccinationStatus: input.vaccinationStatus,
          vaccinationLabel: input.vaccinationLabel?.trim() || undefined,
          nextAppointment: input.nextAppointment?.trim() || undefined,
        };
        setPets((prev) => [...prev, pet]);
        return pet;
      },
      updatePet(id, input) {
        setPets((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  name: input.name.trim(),
                  species: input.species.trim(),
                  breed: input.breed.trim() || 'SRD',
                  age: input.age.trim() || '—',
                  weight: input.weight.trim() || '—',
                  initial: input.name.trim().charAt(0).toUpperCase() || '?',
                  allergies: input.allergies?.trim() || undefined,
                  vetContact: input.vetContact?.trim() || undefined,
                  vaccinationStatus: input.vaccinationStatus,
                  vaccinationLabel: input.vaccinationLabel?.trim() || undefined,
                  nextAppointment: input.nextAppointment?.trim() || undefined,
                }
              : p
          )
        );
      },
      deletePet(id) {
        setPets((prev) => prev.filter((p) => p.id !== id));
      },
      replaceAll(nextPets) {
        setPets(nextPets);
      },
    }),
    [pets, loading]
  );

  return <PetsContext.Provider value={value}>{children}</PetsContext.Provider>;
}

export function usePets() {
  const ctx = useContext(PetsContext);
  if (!ctx) throw new Error('usePets precisa estar dentro de PetsProvider');
  return ctx;
}
