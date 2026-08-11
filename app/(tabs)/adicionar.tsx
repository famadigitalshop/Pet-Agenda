import { useEffect, useState } from 'react';
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { Eyebrow, FilterChip, Muted, ScreenTitle, useColors } from '@/components/PetCareUI';
import { Fonts } from '@/constants/Fonts';
import { HealthEventCategory, Medicine, dosagePresets, frequencyPresets, healthCategories } from '@/constants/mockData';
import { Text } from '@/components/Themed';
import { useReminders } from '@/contexts/RemindersContext';
import { useEvents } from '@/contexts/EventsContext';
import { usePets } from '@/contexts/PetsContext';

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

type MedicineForm = {
  name: string;
  dosage: string;
  times: string[];
  durationDays: string;
};

function emptyMedicine(): MedicineForm {
  return { name: '', dosage: '', times: ['08:00'], durationDays: '7' };
}

async function capturePhoto(): Promise<string | null> {
  if (Platform.OS === 'web') {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
    return !result.canceled && result.assets?.[0]?.uri ? result.assets[0].uri : null;
  }

  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (permission.status !== 'granted') {
    Alert.alert('Permissão da câmera negada', 'Para fotografar a receita, permita o acesso à câmera do MeuPet+ nas configurações do aparelho.');
    return null;
  }
  const result = await ImagePicker.launchCameraAsync({ quality: 0.6 });
  return !result.canceled && result.assets?.[0]?.uri ? result.assets[0].uri : null;
}

export default function AdicionarScreen() {
  const c = useColors();
  const { addReminder } = useReminders();
  const { events, addEvent, updateEvent } = useEvents();
  const { pets } = usePets();
  const params = useLocalSearchParams<{ editEventId?: string; repeatPetId?: string; repeatSymptom?: string; repeatMedicines?: string }>();

  const [petId, setPetId] = useState(pets[0]?.id ?? '');
  const [category, setCategory] = useState<string | null>('Receita');
  const [symptom, setSymptom] = useState('');
  const [procedureTitle, setProcedureTitle] = useState('');
  const [medicines, setMedicines] = useState<MedicineForm[]>([emptyMedicine()]);
  const [alarmOn, setAlarmOn] = useState(true);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingWasPending, setEditingWasPending] = useState(false);

  const pet = pets.find((p) => p.id === petId) ?? pets[0];
  const isReceita = category === 'Receita';

  // completar um registro pendente (só tinha a foto)
  useEffect(() => {
    if (!params.editEventId) return;
    const target = events.find((e) => e.id === params.editEventId);
    if (!target) return;
    setEditingEventId(target.id);
    setEditingWasPending(target.status === 'pendente');
    setPetId(target.petId);
    setCategory(target.category);
    setSymptom(target.symptom ?? '');
    setPhotoUri(target.photoUri ?? null);
    setProcedureTitle(target.category !== 'Receita' ? target.title : '');
    if (target.medicines?.length) {
      setMedicines(
        target.medicines.map((m) => ({ name: m.name, dosage: m.dosage, times: m.times, durationDays: String(m.durationDays) }))
      );
    }
  }, [params.editEventId]);

  // repetir um tratamento anterior (pré-preenche um registro novo)
  useEffect(() => {
    if (!params.repeatMedicines) return;
    try {
      const parsed: { name: string; dosage: string; times: string[]; durationDays: number }[] = JSON.parse(params.repeatMedicines);
      setCategory('Receita');
      if (params.repeatPetId) setPetId(params.repeatPetId);
      setSymptom(params.repeatSymptom ?? '');
      setMedicines(parsed.map((m) => ({ name: m.name, dosage: m.dosage, times: [...m.times], durationDays: String(m.durationDays) })));
    } catch {
      // ignora payload inválido
    }
  }, [params.repeatMedicines]);

  async function handleScanPress() {
    const uri = await capturePhoto();
    if (uri) setPhotoUri(uri);
  }

  function updateMedicineName(index: number, value: string) {
    setMedicines((prev) => prev.map((m, i) => (i === index ? { ...m, name: value } : m)));
  }

  function updateMedicineDosage(index: number, value: string) {
    setMedicines((prev) => prev.map((m, i) => (i === index ? { ...m, dosage: value } : m)));
  }

  function updateMedicineDuration(index: number, value: string) {
    setMedicines((prev) => prev.map((m, i) => (i === index ? { ...m, durationDays: value } : m)));
  }

  function updateMedicineTime(medIndex: number, timeIndex: number, value: string) {
    setMedicines((prev) =>
      prev.map((m, i) => (i === medIndex ? { ...m, times: m.times.map((t, ti) => (ti === timeIndex ? value : t)) } : m))
    );
  }

  function applyFrequencyPreset(medIndex: number, times: string[]) {
    setMedicines((prev) => prev.map((m, i) => (i === medIndex ? { ...m, times: [...times] } : m)));
  }

  function addMedicineTime(medIndex: number) {
    setMedicines((prev) => prev.map((m, i) => (i === medIndex && m.times.length < 4 ? { ...m, times: [...m.times, ''] } : m)));
  }

  function removeMedicineTime(medIndex: number, timeIndex: number) {
    setMedicines((prev) =>
      prev.map((m, i) => (i === medIndex ? { ...m, times: m.times.filter((_, ti) => ti !== timeIndex) } : m))
    );
  }

  function addMedicineBlock() {
    setMedicines((prev) => [...prev, emptyMedicine()]);
  }

  function removeMedicineBlock(index: number) {
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  }

  function resetForm() {
    setSymptom('');
    setProcedureTitle('');
    setMedicines([emptyMedicine()]);
    setPhotoUri(null);
    setEditingEventId(null);
    setEditingWasPending(false);
  }

  async function handleSavePending() {
    if (!photoUri) {
      Alert.alert('Falta a foto', 'Tire uma foto da receita antes de salvar como pendente.');
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    if (editingEventId) {
      updateEvent(editingEventId, { petId: pet.id, symptom: symptom.trim() || undefined, photoUri, status: 'pendente' });
    } else {
      addEvent({
        id: `${Date.now()}`,
        petId: pet.id,
        date: today,
        category: 'Receita',
        symptom: symptom.trim() || undefined,
        title: 'Receita pendente — completar depois',
        vet: 'Você',
        photoUri,
        status: 'pendente',
      });
    }
    Alert.alert('Salvo como pendente', 'A foto já está guardada. Complete os detalhes do remédio quando tiver um tempinho — o registro fica te esperando no Histórico.');
    resetForm();
    router.push('/(tabs)/historico');
  }

  async function handleSave() {
    const today = new Date().toISOString().slice(0, 10);

    if (!isReceita) {
      if (!procedureTitle.trim()) {
        Alert.alert('Falta a informação', 'Preencha o campo Remédio / procedimento.');
        return;
      }
      if (editingEventId) {
        updateEvent(editingEventId, {
          petId: pet.id,
          category: category as HealthEventCategory,
          symptom: symptom.trim() || undefined,
          title: procedureTitle.trim(),
          photoUri: photoUri ?? undefined,
          status: 'completo',
        });
        Alert.alert('Registro atualizado', 'As alterações foram salvas.');
      } else {
        addEvent({
          id: `${Date.now()}`,
          petId: pet.id,
          date: today,
          category: category as HealthEventCategory,
          symptom: symptom.trim() || undefined,
          title: procedureTitle.trim(),
          vet: 'Você',
          photoUri: photoUri ?? undefined,
        });
        Alert.alert('Registro salvo', 'Documento adicionado à linha do tempo.');
      }
      resetForm();
      return;
    }

    const filled = medicines.filter((m) => m.name.trim());
    if (filled.length === 0) {
      Alert.alert('Falta o remédio', 'Adicione pelo menos um remédio à receita.');
      return;
    }

    const parsed: Medicine[] = [];
    for (const med of filled) {
      if (!med.dosage.trim()) {
        Alert.alert('Falta a dosagem', `Informe a dosagem de ${med.name} (ex.: 1 comprimido, 5 ml).`);
        return;
      }
      const validTimes = med.times.map((t) => t.trim()).filter((t) => TIME_PATTERN.test(t));
      if (validTimes.length === 0) {
        Alert.alert('Horário inválido', `Informe pelo menos um horário válido (HH:mm) para ${med.name}.`);
        return;
      }
      const days = parseInt(med.durationDays, 10);
      if (!days || days < 1) {
        Alert.alert('Duração inválida', `Informe por quantos dias tomar ${med.name}.`);
        return;
      }
      parsed.push({ name: med.name.trim(), dosage: med.dosage.trim(), times: [...validTimes].sort(), durationDays: days });
    }

    setSaving(true);
    let truncatedAny = false;
    let totalDoses = 0;

    if (alarmOn) {
      for (const med of parsed) {
        const result = await addReminder({
          petId: pet.id,
          petName: pet.name,
          medicineName: med.name,
          dosage: med.dosage,
          times: med.times,
          durationDays: med.durationDays,
        });
        if (!result.ok) {
          setSaving(false);
          if (result.reason === 'permission-denied') {
            Alert.alert(
              'Permissão de notificação negada',
              'Para receber os alarmes, permita notificações para o MeuPet+ nas configurações do aparelho.'
            );
          } else {
            Alert.alert('Revise os dados', `Confira os horários e a duração de ${med.name}.`);
          }
          return;
        }
        truncatedAny = truncatedAny || result.truncated;
        totalDoses += med.times.length * med.durationDays;
      }
    }
    setSaving(false);

    if (editingEventId) {
      updateEvent(editingEventId, {
        petId: pet.id,
        category: 'Receita',
        symptom: symptom.trim() || undefined,
        title: parsed.map((m) => m.name).join(', '),
        medicines: parsed,
        photoUri: photoUri ?? undefined,
        status: 'completo',
      });
    } else {
      addEvent({
        id: `${Date.now()}`,
        petId: pet.id,
        date: today,
        category: 'Receita',
        symptom: symptom.trim() || undefined,
        title: parsed.map((m) => m.name).join(', '),
        vet: 'Você',
        medicines: parsed,
        photoUri: photoUri ?? undefined,
      });
    }

    const medicineNames = parsed.map((m) => m.name).join(', ');
    Alert.alert(
      alarmOn ? 'Alarmes ativados' : 'Receita salva',
      alarmOn
        ? `${parsed.length} remédio${parsed.length > 1 ? 's' : ''} agendado${parsed.length > 1 ? 's' : ''} para ${pet.name} (${totalDoses} doses no total). Você será avisado na última dose de cada um.` +
            (truncatedAny ? '\n\nTratamento longo: apenas as próximas notificações foram agendadas por enquanto.' : '')
        : `${medicineNames} adicionado(s) à carteira de ${pet.name}.`
    );
    resetForm();
  }

  return (
    <ScrollView style={{ backgroundColor: c.background }} contentContainerStyle={styles.container}>
      <Eyebrow>{editingEventId ? (editingWasPending ? 'Completar registro' : 'Editar registro') : 'Novo registro'}</Eyebrow>
      <ScreenTitle style={{ marginBottom: 4 }}>
        {editingEventId ? (editingWasPending ? 'Completar receita pendente' : 'Editar registro') : 'Escanear documento'}
      </ScreenTitle>
      <Muted style={{ marginBottom: 18 }}>
        {editingEventId
          ? editingWasPending
            ? 'Preencha os remédios dessa receita — a foto que você já tirou continua anexada.'
            : 'Altere os dados desse registro e salve.'
          : 'Fotografe a receita ou carteirinha. Sem tempo agora? Salve só a foto como pendente e complete os detalhes depois.'}
      </Muted>

      <Pressable
        onPress={handleScanPress}
        style={[styles.scanBox, { borderColor: c.accent, backgroundColor: c.card }, photoUri && styles.scanBoxWithPhoto]}>
        {photoUri ? (
          <>
            <Image source={{ uri: photoUri }} style={styles.photoPreview} resizeMode="cover" />
            <Text style={{ color: c.accent, fontWeight: '600', marginTop: 10 }}>Toque para trocar a foto</Text>
          </>
        ) : (
          <>
            <View style={[styles.scanIcon, { borderColor: c.accent }]}>
              <Text style={{ color: c.accent, fontSize: 22 }}>+</Text>
            </View>
            <Text style={{ color: c.accent, fontWeight: '600', marginTop: 10 }}>Toque para escanear</Text>
            <Muted style={{ marginTop: 2 }}>Câmera com corte automático de borda</Muted>
          </>
        )}
      </Pressable>

      {!editingEventId && photoUri && isReceita && (
        <Pressable onPress={handleSavePending} style={[styles.pendingBtn, { borderColor: c.border }]}>
          <Text style={{ color: c.textMuted, fontWeight: '600', fontSize: 13 }}>
            ⏳ Sem tempo agora? Salvar só a foto e completar depois
          </Text>
        </Pressable>
      )}

      <View style={styles.form}>
        <Field label="Pet">
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {pets.map((p) => (
              <FilterChip key={p.id} label={p.name} active={petId === p.id} onPress={() => setPetId(p.id)} />
            ))}
          </View>
        </Field>

        <Field label="Categoria">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {healthCategories.map((cat) => (
              <FilterChip key={cat} label={cat} active={category === cat} onPress={() => setCategory(cat)} />
            ))}
          </View>
        </Field>

        <Field label="Sintoma ou motivo">
          <Input value={symptom} onChangeText={setSymptom} placeholder="ex.: otite, alergia de pele, vômito" />
        </Field>

        {!isReceita && (
          <Field label="Remédio / procedimento">
            <Input value={procedureTitle} onChangeText={setProcedureTitle} placeholder="ex.: V10, hemograma, castração" />
          </Field>
        )}

        <Field label="Data">
          <Input value="08/08/2026" onChangeText={() => {}} placeholder="dd/mm/aaaa" />
        </Field>

        {isReceita && (
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.sectionLabel}>Remédios desta receita</Text>
            <View style={{ gap: 12 }}>
              {medicines.map((med, medIndex) => (
                <View key={medIndex} style={[styles.medicineBlock, { borderColor: c.border, backgroundColor: c.card }]}>
                  <View style={styles.medicineHeader}>
                    <Text style={{ fontFamily: Fonts.mono, fontSize: 11, letterSpacing: 0.5, color: c.textFaint, textTransform: 'uppercase' }}>
                      Remédio {medIndex + 1}
                    </Text>
                    {medicines.length > 1 && (
                      <Pressable onPress={() => removeMedicineBlock(medIndex)}>
                        <Text style={{ color: c.textFaint, fontSize: 13, fontWeight: '600' }}>Remover</Text>
                      </Pressable>
                    )}
                  </View>

                  <Input
                    value={med.name}
                    onChangeText={(v) => updateMedicineName(medIndex, v)}
                    placeholder="ex.: Otomax, Apoquel 16mg"
                    style={{ marginBottom: 10 }}
                  />

                  <Text style={styles.miniLabel}>Dosagem</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {dosagePresets.map((preset) => (
                      <FilterChip
                        key={preset}
                        label={preset}
                        active={med.dosage === preset}
                        onPress={() => updateMedicineDosage(medIndex, preset)}
                      />
                    ))}
                  </View>
                  <Input
                    value={med.dosage}
                    onChangeText={(v) => updateMedicineDosage(medIndex, v)}
                    placeholder="ex.: 1 comprimido, 5 ml, 3 gotas em cada ouvido"
                    style={{ marginBottom: 10 }}
                  />

                  <Text style={styles.miniLabel}>Frequência</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {frequencyPresets.map((preset) => (
                      <FilterChip
                        key={preset.label}
                        label={preset.label}
                        active={JSON.stringify(med.times) === JSON.stringify(preset.times)}
                        onPress={() => applyFrequencyPreset(medIndex, preset.times)}
                      />
                    ))}
                  </View>

                  <Text style={styles.miniLabel}>Horários</Text>
                  <View style={{ gap: 8, marginBottom: 10 }}>
                    {med.times.map((time, timeIndex) => (
                      <View key={timeIndex} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                        <Input
                          value={time}
                          onChangeText={(v) => updateMedicineTime(medIndex, timeIndex, v)}
                          placeholder="08:00"
                          style={{ flex: 1 }}
                        />
                        {med.times.length > 1 && (
                          <Pressable
                            onPress={() => removeMedicineTime(medIndex, timeIndex)}
                            style={[styles.smallBtn, { borderColor: c.border }]}>
                            <Text style={{ color: c.textFaint }}>–</Text>
                          </Pressable>
                        )}
                      </View>
                    ))}
                    {med.times.length < 4 && (
                      <Pressable onPress={() => addMedicineTime(medIndex)} style={[styles.addTimeBtn, { borderColor: c.accent }]}>
                        <Text style={{ color: c.accent, fontWeight: '600', fontSize: 13 }}>+ Adicionar horário</Text>
                      </Pressable>
                    )}
                  </View>

                  <Text style={styles.miniLabel}>Por quantos dias</Text>
                  <Input
                    value={med.durationDays}
                    onChangeText={(v) => updateMedicineDuration(medIndex, v)}
                    placeholder="7"
                    keyboardType="number-pad"
                    style={{ maxWidth: 100 }}
                  />
                </View>
              ))}

              <Pressable onPress={addMedicineBlock} style={[styles.addMedicineBtn, { borderColor: c.accent }]}>
                <Text style={{ color: c.accent, fontWeight: '700', fontSize: 14 }}>+ Adicionar outro remédio</Text>
              </Pressable>
            </View>
          </View>
        )}

        {isReceita && (
          <Pressable
            style={[styles.alarmSection, styles.alarmHeader, { borderColor: c.border, backgroundColor: c.card }]}
            onPress={() => setAlarmOn((v) => !v)}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, fontWeight: '700', fontSize: 15 }}>⏰ Alarme de horário</Text>
              <Muted style={{ fontSize: 12.5, marginTop: 2 }}>
                Avisa em cada dose de todos os remédios acima, e na última do tratamento
              </Muted>
            </View>
            <View style={[styles.toggle, { backgroundColor: alarmOn ? c.accent : c.cardSunken, borderColor: c.border }]}>
              <View style={[styles.toggleDot, { backgroundColor: '#fff', alignSelf: alarmOn ? 'flex-end' : 'flex-start' }]} />
            </View>
          </Pressable>
        )}

        <Pressable
          style={[styles.saveButton, { backgroundColor: c.accent, opacity: saving ? 0.6 : 1 }]}
          onPress={handleSave}
          disabled={saving}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
            {saving
              ? 'Agendando alarmes...'
              : editingEventId
                ? editingWasPending
                  ? 'Concluir registro'
                  : 'Salvar alterações'
                : 'Salvar na carteira'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const c = useColors();
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontFamily: Fonts.mono, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: c.textFaint, marginBottom: 6 }}>
        {label}
      </Text>
      {children}
    </View>
  );
}

function Input(props: React.ComponentProps<typeof TextInput>) {
  const c = useColors();
  return (
    <TextInput
      placeholderTextColor={c.textFaint}
      style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }, props.style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 48,
  },
  scanBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  scanBoxWithPhoto: {
    paddingVertical: 14,
  },
  photoPreview: {
    width: '100%',
    height: 160,
    borderRadius: 10,
  },
  scanIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingBtn: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  form: {
    marginTop: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  saveButton: {
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sectionLabel: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: '#8a988e',
    marginBottom: 8,
  },
  medicineBlock: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addMedicineBtn: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  alarmSection: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  alarmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    padding: 2,
    justifyContent: 'center',
  },
  toggleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  miniLabel: {
    fontFamily: Fonts.mono,
    fontSize: 10.5,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#8a988e',
    marginBottom: 6,
  },
  smallBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTimeBtn: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
});
