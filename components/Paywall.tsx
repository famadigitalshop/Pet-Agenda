import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Card, Eyebrow, Muted, ScreenTitle, useColors } from '@/components/PetCareUI';
import { Fonts } from '@/constants/Fonts';
import { Text } from '@/components/Themed';
import { useTrial } from '@/contexts/TrialContext';

const benefits = [
  'Busca completa por sintoma no histórico de todos os pets',
  'Alarmes de remédio com dosagem e horário',
  'Ficha de emergência (SOS) e histórico em PDF',
  'Backup dos dados e pets ilimitados',
];

export default function Paywall() {
  const c = useColors();
  const { subscribe } = useTrial();

  return (
    <ScrollView style={{ backgroundColor: c.background }} contentContainerStyle={styles.container}>
      <Eyebrow>Teste grátis encerrado</Eyebrow>
      <ScreenTitle style={{ marginBottom: 4 }}>Continue com o histórico do seu pet sempre à mão</ScreenTitle>
      <Muted style={{ marginBottom: 24 }}>
        Assine o MeuPet+ Premium pra manter acesso ao histórico, aos alarmes de remédio e a tudo que você já cadastrou.
      </Muted>

      <Card style={[styles.planCard, { backgroundColor: c.accent, borderColor: c.accent }]}>
        <Text style={{ fontFamily: Fonts.mono, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#fff', opacity: 0.85 }}>
          MeuPet+ Premium
        </Text>
        <Text style={{ color: '#fff', fontSize: 24, fontFamily: Fonts.serif, fontWeight: '700', marginTop: 4 }}>
          R$ 12,90/mês
        </Text>

        <View style={{ marginTop: 16, gap: 10 }}>
          {benefits.map((benefit) => (
            <View key={benefit} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
              <Text style={{ color: '#fff', fontSize: 14 }}>✓</Text>
              <Text style={{ color: '#fff', opacity: 0.95, fontSize: 13.5, flex: 1, lineHeight: 19 }}>{benefit}</Text>
            </View>
          ))}
        </View>

        <Pressable style={styles.upgradeButton} onPress={subscribe}>
          <Text style={{ color: c.accent, fontWeight: '700', fontSize: 15 }}>Assinar Premium</Text>
        </Pressable>
      </Card>

      <Muted style={{ textAlign: 'center', fontSize: 12 }}>
        Seus dados continuam guardados neste aparelho — assinar libera o acesso de novo.
      </Muted>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  planCard: {
    borderWidth: 1,
    marginBottom: 16,
  },
  upgradeButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 18,
  },
});
