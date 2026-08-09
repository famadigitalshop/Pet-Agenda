import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { Card, Eyebrow, Muted, ScreenTitle, useColors } from '@/components/PetCareUI';
import { Fonts } from '@/constants/Fonts';
import { Text } from '@/components/Themed';
import { usePets } from '@/contexts/PetsContext';

const settingsItems = ['Exportar histórico em PDF', 'Notificações e lembretes', 'Dados do tutor', 'Privacidade e LGPD', 'Sobre o MeuPet+'];

export default function PerfilScreen() {
  const c = useColors();
  const { pets } = usePets();

  return (
    <ScrollView style={{ backgroundColor: c.background }} contentContainerStyle={styles.container}>
      <Eyebrow>Perfil</Eyebrow>
      <ScreenTitle style={{ marginBottom: 4 }}>Sua conta</ScreenTitle>
      <Muted style={{ marginBottom: 20 }}>MeuPet+ · A história do seu melhor amigo, sempre com você.</Muted>

      <Card style={[styles.planCard, { backgroundColor: c.accent, borderColor: c.accent }]}>
        <Text style={{ fontFamily: Fonts.mono, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#fff', opacity: 0.85 }}>
          Plano atual
        </Text>
        <Text style={{ color: '#fff', fontSize: 20, fontFamily: Fonts.serif, fontWeight: '700', marginTop: 4 }}>
          Gratuito
        </Text>
        <Text style={{ color: '#fff', opacity: 0.9, fontSize: 13, marginTop: 6 }}>
          Assine o Premium por R$ 12,90/mês e desbloqueie busca completa por sintoma, pets ilimitados e exportação para o vet.
        </Text>
        <Pressable style={styles.upgradeButton}>
          <Text style={{ color: c.accent, fontWeight: '700', fontSize: 14 }}>Assinar Premium</Text>
        </Pressable>
      </Card>

      <SectionLabel>Pets cadastrados</SectionLabel>
      <View style={{ gap: 10 }}>
        {pets.map((pet) => (
          <Card key={pet.id} style={styles.petRow}>
            <View style={[styles.avatar, { backgroundColor: c.cardSunken }]}>
              <Text style={{ color: c.text, fontFamily: Fonts.serif, fontWeight: '600' }}>{pet.initial}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.text, fontWeight: '600' }}>{pet.name}</Text>
              <Muted style={{ fontSize: 12.5 }}>
                {pet.species} · {pet.breed}
              </Muted>
            </View>
            <Text style={{ color: c.textFaint }}>›</Text>
          </Card>
        ))}
        <Pressable style={[styles.addPet, { borderColor: c.border }]} onPress={() => router.push('/adicionar-pet')}>
          <Text style={{ color: c.accent, fontWeight: '600' }}>+ Adicionar outro pet</Text>
        </Pressable>
      </View>

      <SectionLabel>Configurações</SectionLabel>
      <Card style={{ padding: 0 }}>
        {settingsItems.map((item, i) => (
          <View
            key={item}
            style={[
              styles.settingRow,
              i < settingsItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.border },
            ]}>
            <Text style={{ color: c.text, fontSize: 14.5 }}>{item}</Text>
            <Text style={{ color: c.textFaint }}>›</Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  const c = useColors();
  return (
    <Text
      style={{
        fontFamily: Fonts.mono,
        fontSize: 11,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        color: c.textFaint,
        marginTop: 24,
        marginBottom: 10,
      }}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 48,
  },
  planCard: {
    borderWidth: 1,
  },
  upgradeButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  petRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPet: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
});
