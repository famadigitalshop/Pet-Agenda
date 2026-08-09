import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { FieldLabel, FilterChip, Muted, ScreenTitle, TextField, useColors } from '@/components/PetCareUI';
import { Text } from '@/components/Themed';
import { usePets } from '@/contexts/PetsContext';

const SPECIES_OPTIONS = ['Cão', 'Gato', 'Outro'];

export default function AdicionarPetScreen() {
  const c = useColors();
  const { addPet } = usePets();

  const [name, setName] = useState('');
  const [species, setSpecies] = useState('Cão');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [saving, setSaving] = useState(false);

  function handleSave() {
    if (!name.trim()) {
      Alert.alert('Falta o nome', 'Digite o nome do seu pet.');
      return;
    }
    setSaving(true);
    const pet = addPet({ name, species, breed, age, weight });
    setSaving(false);
    router.back();
    Alert.alert('Pet adicionado', `${pet.name} já está na sua carteira MeuPet+.`);
  }

  return (
    <ScrollView style={{ backgroundColor: c.background }} contentContainerStyle={styles.container}>
      <ScreenTitle style={{ marginBottom: 4 }}>Novo pet</ScreenTitle>
      <Muted style={{ marginBottom: 20 }}>Cadastre seu companheiro pra começar a guardar o histórico dele.</Muted>

      <View style={{ marginBottom: 16 }}>
        <FieldLabel>Nome</FieldLabel>
        <TextField value={name} onChangeText={setName} placeholder="ex.: Bidu" autoFocus />
      </View>

      <View style={{ marginBottom: 16 }}>
        <FieldLabel>Espécie</FieldLabel>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {SPECIES_OPTIONS.map((option) => (
            <FilterChip key={option} label={option} active={species === option} onPress={() => setSpecies(option)} />
          ))}
        </View>
      </View>

      <View style={{ marginBottom: 16 }}>
        <FieldLabel>Raça</FieldLabel>
        <TextField value={breed} onChangeText={setBreed} placeholder="ex.: Vira-lata, SRD, Poodle" />
      </View>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <FieldLabel>Idade</FieldLabel>
          <TextField value={age} onChangeText={setAge} placeholder="ex.: 2 anos" />
        </View>
        <View style={{ flex: 1 }}>
          <FieldLabel>Peso</FieldLabel>
          <TextField value={weight} onChangeText={setWeight} placeholder="ex.: 8 kg" />
        </View>
      </View>

      <Pressable
        style={[styles.saveButton, { backgroundColor: c.accent, opacity: saving ? 0.6 : 1 }]}
        onPress={handleSave}
        disabled={saving}>
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Salvar pet</Text>
      </Pressable>

      <Pressable style={styles.cancelButton} onPress={() => router.back()}>
        <Text style={{ color: c.textMuted, fontWeight: '600', fontSize: 14 }}>Cancelar</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 48,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
});
