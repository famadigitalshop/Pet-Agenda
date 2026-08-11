import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';

import { FieldLabel, FilterChip, Muted, ScreenTitle, TextField, useColors } from '@/components/PetCareUI';
import { Text } from '@/components/Themed';
import { usePets } from '@/contexts/PetsContext';
import { useEvents } from '@/contexts/EventsContext';
import { useReminders } from '@/contexts/RemindersContext';

const SPECIES_OPTIONS = ['Cão', 'Gato', 'Outro'];
const VACCINATION_OPTIONS: { label: string; value: 'em-dia' | 'atencao' }[] = [
  { label: 'Em dia', value: 'em-dia' },
  { label: 'Precisa de atenção', value: 'atencao' },
];

export default function AdicionarPetScreen() {
  const c = useColors();
  const { pets, addPet, updatePet, deletePet } = usePets();
  const { deleteEventsForPet } = useEvents();
  const { cancelRemindersForPet } = useReminders();
  const params = useLocalSearchParams<{ editPetId?: string }>();
  const editingPet = params.editPetId ? pets.find((p) => p.id === params.editPetId) : undefined;

  const [name, setName] = useState('');
  const [species, setSpecies] = useState('Cão');
  const [customSpecies, setCustomSpecies] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [allergies, setAllergies] = useState('');
  const [vetContact, setVetContact] = useState('');
  const [vaccinationStatus, setVaccinationStatus] = useState<'em-dia' | 'atencao' | null>(null);
  const [vaccinationLabel, setVaccinationLabel] = useState('');
  const [nextAppointment, setNextAppointment] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editingPet) return;
    setName(editingPet.name);
    setSpecies(SPECIES_OPTIONS.includes(editingPet.species) ? editingPet.species : 'Outro');
    setCustomSpecies(SPECIES_OPTIONS.includes(editingPet.species) ? '' : editingPet.species);
    setBreed(editingPet.breed);
    setAge(editingPet.age === '—' ? '' : editingPet.age);
    setWeight(editingPet.weight === '—' ? '' : editingPet.weight);
    setAllergies(editingPet.allergies ?? '');
    setVetContact(editingPet.vetContact ?? '');
    setVaccinationStatus(editingPet.vaccinationStatus ?? null);
    setVaccinationLabel(editingPet.vaccinationLabel ?? '');
    setNextAppointment(editingPet.nextAppointment ?? '');
  }, [editingPet]);

  const isOtherSpecies = species === 'Outro';

  function handleSave() {
    if (!name.trim()) {
      Alert.alert('Falta o nome', 'Digite o nome do seu pet.');
      return;
    }
    if (isOtherSpecies && !customSpecies.trim()) {
      Alert.alert('Qual espécie?', 'Digite a espécie do seu pet (ex.: coelho, hamster, pássaro).');
      return;
    }
    const finalSpecies = isOtherSpecies ? customSpecies.trim() : species;
    const input = {
      name,
      species: finalSpecies,
      breed,
      age,
      weight,
      allergies,
      vetContact,
      vaccinationStatus: vaccinationStatus ?? undefined,
      vaccinationLabel,
      nextAppointment,
    };

    setSaving(true);
    if (editingPet) {
      updatePet(editingPet.id, input);
      setSaving(false);
      router.back();
      Alert.alert('Pet atualizado', `As informações de ${name.trim()} foram salvas.`);
    } else {
      const pet = addPet(input);
      setSaving(false);
      router.back();
      Alert.alert('Pet adicionado', `${pet.name} já está na sua carteira MeuPet+.`);
    }
  }

  function handleDelete() {
    if (!editingPet) return;
    Alert.alert(
      `Excluir ${editingPet.name}?`,
      'Isso remove o pet, todo o histórico de saúde e os alarmes de remédio dele. Essa ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await cancelRemindersForPet(editingPet.id);
            deleteEventsForPet(editingPet.id);
            deletePet(editingPet.id);
            router.back();
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={{ backgroundColor: c.background }} contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: editingPet ? 'Editar pet' : 'Novo pet' }} />
      <ScreenTitle style={{ marginBottom: 4 }}>{editingPet ? `Editar ${editingPet.name}` : 'Novo pet'}</ScreenTitle>
      <Muted style={{ marginBottom: 20 }}>
        {editingPet
          ? 'Atualize as informações dele — isso ajuda a manter o SOS e os lembretes de vacina corretos.'
          : 'Cadastre seu companheiro pra começar a guardar o histórico dele.'}
      </Muted>

      <View style={{ marginBottom: 16 }}>
        <FieldLabel>Nome</FieldLabel>
        <TextField value={name} onChangeText={setName} placeholder="ex.: Bidu" autoFocus={!editingPet} />
      </View>

      <View style={{ marginBottom: 16 }}>
        <FieldLabel>Espécie</FieldLabel>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {SPECIES_OPTIONS.map((option) => (
            <FilterChip key={option} label={option} active={species === option} onPress={() => setSpecies(option)} />
          ))}
        </View>
        {isOtherSpecies && (
          <TextField
            value={customSpecies}
            onChangeText={setCustomSpecies}
            placeholder="ex.: coelho, hamster, pássaro"
            style={{ marginTop: 10 }}
          />
        )}
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

      <View style={{ marginBottom: 16 }}>
        <FieldLabel>Alergias</FieldLabel>
        <TextField
          value={allergies}
          onChangeText={setAllergies}
          placeholder="ex.: Alergia a penicilina, nenhuma conhecida"
        />
      </View>

      <View style={{ marginBottom: 16 }}>
        <FieldLabel>Veterinário responsável</FieldLabel>
        <TextField value={vetContact} onChangeText={setVetContact} placeholder="ex.: Dra. Carolina Reis · (11) 98888-7777" />
      </View>

      <View style={{ marginBottom: 16 }}>
        <FieldLabel>Vacinação</FieldLabel>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
          {VACCINATION_OPTIONS.map((option) => (
            <FilterChip
              key={option.value}
              label={option.label}
              active={vaccinationStatus === option.value}
              onPress={() => setVaccinationStatus(vaccinationStatus === option.value ? null : option.value)}
            />
          ))}
        </View>
        <TextField
          value={vaccinationLabel}
          onChangeText={setVaccinationLabel}
          placeholder="ex.: Vacinas em dia, Antirrábica vence em 12 dias"
        />
      </View>

      <View style={{ marginBottom: 16 }}>
        <FieldLabel>Próxima consulta</FieldLabel>
        <TextField value={nextAppointment} onChangeText={setNextAppointment} placeholder="ex.: 20 ago · Consulta de rotina" />
      </View>

      <Pressable
        style={[styles.saveButton, { backgroundColor: c.accent, opacity: saving ? 0.6 : 1 }]}
        onPress={handleSave}
        disabled={saving}>
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
          {editingPet ? 'Salvar alterações' : 'Salvar pet'}
        </Text>
      </Pressable>

      <Pressable style={styles.cancelButton} onPress={() => router.back()}>
        <Text style={{ color: c.textMuted, fontWeight: '600', fontSize: 14 }}>Cancelar</Text>
      </Pressable>

      {editingPet && (
        <Pressable style={[styles.deleteButton, { borderColor: c.riskHigh }]} onPress={handleDelete}>
          <Text style={{ color: c.riskHigh, fontWeight: '700', fontSize: 14 }}>Excluir pet</Text>
        </Pressable>
      )}
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
  deleteButton: {
    marginTop: 24,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
});
