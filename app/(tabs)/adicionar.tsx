import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Eyebrow, FilterChip, Muted, ScreenTitle, useColors } from '@/components/PetCareUI';
import { Fonts } from '@/constants/Fonts';
import { healthCategories } from '@/constants/mockData';
import { Text } from '@/components/Themed';

export default function AdicionarScreen() {
  const c = useColors();
  const [category, setCategory] = useState<string | null>(null);
  const [symptom, setSymptom] = useState('');
  const [medicine, setMedicine] = useState('');

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

        <Pressable style={[styles.saveButton, { backgroundColor: c.accent }]}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Salvar na carteira</Text>
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
      style={[
        styles.input,
        { backgroundColor: c.card, borderColor: c.border, color: c.text },
      ]}
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
});
