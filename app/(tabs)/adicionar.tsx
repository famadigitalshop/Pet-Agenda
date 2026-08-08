import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Eyebrow, FilterChip, Muted, ScreenTitle, useColors } from '@/components/PetCareUI';
import { Fonts } from '@/constants/Fonts';
import { healthCategories, pets } from '@/constants/mockData';
import { Text } from '@/components/Themed';
import { useReminders } from '@/contexts/RemindersContext';

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export default function AdicionarScreen() {
  const c = useColors();
  const { addReminder } = useReminders();

  const [petId, setPetId] = useState(pets[0].id);
  const [category, setCategory] = useState<string | null>('Receita');
  const [symptom, setSymptom] = useState('');
  const [medicine, setMedicine] = useState('');
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [durationDays, setDurationDays] = useState('7');
  const [alarmOn, setAlarmOn] = useState(true);
  const [saving, setSaving] = useState(false);

  const pet = pets.find((p) => p.id === petId)!;
  const showAlarmFields = category === 'Receita';

  function updateTime(index: number, value: string) {
    setTimes((prev) => prev.map((t, i) => (i === index ? value : t)));
  }

  function addTimeField() {
    if (times.length >= 4) return;
    setTimes((prev) => [...prev, '']);
  }

  function removeTimeField(index: number) {
    setTimes((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!showAlarmFields || !alarmOn) {
      Alert.alert('Registro salvo', 'Documento adicionado à linha do tempo.');
      return;
    }

    if (!medicine.trim()) {
      Alert.alert('Falta o nome do remédio', 'Preencha o campo Remédio antes de ativar o alarme.');
      return;
    }
    const validTimes = times.map((t) => t.trim()).filter((t) => TIME_PATTERN.test(t));
    if (validTimes.length === 0) {
      Alert.alert('Horário inválido', 'Informe pelo menos um horário no formato HH:mm, ex.: 08:00.');
      return;
    }
    const days = parseInt(durationDays, 10);
    if (!days || days < 1) {
      Alert.alert('Duração inválida', 'Informe por quantos dias o tratamento vai durar.');
      return;
    }

    setSaving(true);
    const result = await addReminder({
      petId: pet.id,
      petName: pet.name,
      medicineName: medicine.trim(),
      times: validTimes,
      durationDays: days,
    });
    setSaving(false);

    if (!result.ok) {
      if (result.reason === 'permission-denied') {
        Alert.alert(
          'Permissão de notificação negada',
          'Para receber os alarmes, permita notificações para o PetCare Wallet nas configurações do aparelho.'
        );
      } else {
        Alert.alert('Revise os dados', 'Confira o remédio, os horários e a duração informados.');
      }
      return;
    }

    const totalDoses = validTimes.length * days;
    Alert.alert(
      'Alarme ativado',
      `${totalDoses} doses de ${medicine.trim()} agendadas para ${pet.name}, ${validTimes.join(
        ', '
      )}, por ${days} dia${days > 1 ? 's' : ''}. Você será avisado na última dose.` +
        (result.truncated ? '\n\nTratamento longo: apenas as próximas notificações foram agendadas por enquanto.' : '')
    );
    setMedicine('');
    setSymptom('');
    setTimes(['08:00']);
    setDurationDays('7');
  }

  return (
    <ScrollView style={{ backgroundColor: c.background }} contentContainerStyle={styles.container}>
      <Eyebrow>Novo registro</Eyebrow>
      <ScreenTitle style={{ marginBottom: 4 }}>Escanear documento</ScreenTitle>
      <Muted style={{ marginBottom: 18 }}>
        Fotografe a receita ou carteirinha. Depois confirme os dados abaixo — é o que garante que a busca funcione mesmo com letra difícil.
      </Muted>

      <Pressable style={[styles.scanBox, { borderColor: c.accent, backgroundColor: c.card }]}>
        <View style={[styles.scanIcon, { borderColor: c.accent }]}>
          <Text style={{ color: c.accent, fontSize: 22 }}>+</Text>
        </View>
        <Text style={{ color: c.accent, fontWeight: '600', marginTop: 10 }}>Toque para escanear</Text>
        <Muted style={{ marginTop: 2 }}>Câmera com corte automático de borda</Muted>
      </Pressable>

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

        <Field label="Remédio / procedimento">
          <Input value={medicine} onChangeText={setMedicine} placeholder="ex.: Otomax, V10, hemograma" />
        </Field>

        <Field label="Data">
          <Input value="08/08/2026" onChangeText={() => {}} placeholder="dd/mm/aaaa" />
        </Field>

        {showAlarmFields && (
          <View style={[styles.alarmSection, { borderColor: c.border, backgroundColor: c.card }]}>
            <Pressable style={styles.alarmHeader} onPress={() => setAlarmOn((v) => !v)}>
              <View>
                <Text style={{ color: c.text, fontWeight: '700', fontSize: 15 }}>⏰ Alarme de horário</Text>
                <Muted style={{ fontSize: 12.5, marginTop: 2 }}>Avisa em cada dose e na última do tratamento</Muted>
              </View>
              <View style={[styles.toggle, { backgroundColor: alarmOn ? c.accent : c.cardSunken, borderColor: c.border }]}>
                <View style={[styles.toggleDot, { backgroundColor: '#fff', alignSelf: alarmOn ? 'flex-end' : 'flex-start' }]} />
              </View>
            </Pressable>

            {alarmOn && (
              <View style={{ marginTop: 14, gap: 12 }}>
                <View>
                  <Text style={styles.miniLabel}>Horários (toque + para adicionar)</Text>
                  <View style={{ gap: 8 }}>
                    {times.map((time, i) => (
                      <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                        <Input
                          value={time}
                          onChangeText={(v) => updateTime(i, v)}
                          placeholder="08:00"
                          style={{ flex: 1 }}
                        />
                        {times.length > 1 && (
                          <Pressable
                            onPress={() => removeTimeField(i)}
                            style={[styles.smallBtn, { borderColor: c.border }]}>
                            <Text style={{ color: c.textFaint }}>–</Text>
                          </Pressable>
                        )}
                      </View>
                    ))}
                    {times.length < 4 && (
                      <Pressable onPress={addTimeField} style={[styles.addTimeBtn, { borderColor: c.accent }]}>
                        <Text style={{ color: c.accent, fontWeight: '600', fontSize: 13 }}>+ Adicionar horário</Text>
                      </Pressable>
                    )}
                  </View>
                </View>

                <View>
                  <Text style={styles.miniLabel}>Por quantos dias</Text>
                  <Input
                    value={durationDays}
                    onChangeText={setDurationDays}
                    placeholder="7"
                    keyboardType="number-pad"
                    style={{ maxWidth: 100 }}
                  />
                </View>
              </View>
            )}
          </View>
        )}

        <Pressable
          style={[styles.saveButton, { backgroundColor: c.accent, opacity: saving ? 0.6 : 1 }]}
          onPress={handleSave}
          disabled={saving}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
            {saving ? 'Agendando alarme...' : 'Salvar na carteira'}
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
  },
  scanIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
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
