import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { Pet, seedPets } from '@/constants/mockData';

const STORAGE_KEY = '@petcare/pets';

type NewPetInput = {
  name: string;
  species: string;
  breed: string;
  age: string;
  weight: string;
};

type PetsContextValue = {
  pets: Pet[];
  loading: boolean;
  addPet: (input: NewPetInput) => Pet;
};

const PetsContext = createContext<PetsContextValue | null>(null);

export function PetsProvider({ children }: { children: React.ReactNode }) {
  const [pets, setPets] = useState<Pet[]>(seedPets);
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
        };
        setPets((prev) => [...prev, pet]);
        return pet;
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
