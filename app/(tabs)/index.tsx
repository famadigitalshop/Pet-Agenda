import { ScrollView, StyleSheet, View } from 'react-native';

import { Card, CategoryTag, Eyebrow, Muted, ScreenTitle, StatusChip, useColors } from '@/components/PetCareUI';
import { Fonts } from '@/constants/Fonts';
import { healthEvents, pets } from '@/constants/mockData';
import { Text } from '@/components/Themed';

export default function DashboardScreen() {
  const c = useColors();

  const pendingReminders = pets.filter((p) => p.vaccinationStatus === 'atencao');

  return (
    <ScrollView style={{ backgroundColor: c.background }} contentContainerStyle={styles.container}>
      <Eyebrow>08 ago · Início</Eyebrow>
      <ScreenTitle style={{ marginBottom: 4 }}>Seus pets</ScreenTitle>
      <Muted style={{ marginBottom: 20 }}>{pets.length} pets cadastrados nesta carteira</Muted>

      {pendingReminders.length > 0 && (
        <Card style={[styles.alertCard, { borderColor: c.riskMed, backgroundColor: c.accentSoft }]}>
          <Text style={{ fontFamily: Fonts.mono, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: c.riskMed, marginBottom: 4 }}>
            Lembrete pendente
          </Text>
          <Text style={{ color: c.text, fontSize: 14 }}>
            {pendingReminders[0].name}: {pendingReminders[0].vaccinationLabel.toLowerCase()}
          </Text>
        </Card>
      )}

      <View style={{ gap: 12, marginTop: 16 }}>
        {pets.map((pet) => {
          const lastEvent = healthEvents.find((e) => e.petId === pet.id);
          return (
            <Card key={pet.id} style={styles.petCard}>
              <View style={styles.petRow}>
                <View style={[styles.avatar, { backgroundColor: c.accent }]}>
                  <Text style={{ color: '#fff', fontFamily: Fonts.serif, fontSize: 20, fontWeight: '600' }}>
                    {pet.initial}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontSize: 18, fontWeight: '600', fontFamily: Fonts.serif }}>
                    {pet.name}
                  </Text>
                  <Muted>
                    {pet.species} · {pet.breed} · {pet.age} · {pet.weight}
                  </Muted>
                </View>
              </View>

              <View style={{ marginTop: 12, gap: 8 }}>
                <StatusChip
                  label={pet.vaccinationLabel}
                  tone={pet.vaccinationStatus === 'em-dia' ? 'low' : 'med'}
                />
                {pet.nextAppointment && <Muted>Próxima consulta: {pet.nextAppointment}</Muted>}
              </View>

              {lastEvent && (
                <View style={[styles.lastEvent, { borderTopColor: c.border }]}>
                  <CategoryTag category={lastEvent.category} />
                  <Text style={{ color: c.text, fontSize: 13, marginTop: 4 }}>{lastEvent.title}</Text>
                  <Muted style={{ fontSize: 12, marginTop: 1 }}>
                    Registro mais recente · {formatDate(lastEvent.date)}
                  </Muted>
                </View>
              )}
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-');
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`;
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 48,
  },
  alertCard: {
    borderWidth: 1,
  },
  petCard: {},
  petRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lastEvent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
});
