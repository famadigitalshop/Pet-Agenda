import { useMemo, useState } from 'react';
import { FlatList, Image, StyleSheet, TextInput, View } from 'react-native';

import { Card, CategoryTag, Eyebrow, FilterChip, Muted, ScreenTitle, useColors } from '@/components/PetCareUI';
import { Fonts } from '@/constants/Fonts';
import { HealthEvent, healthCategories } from '@/constants/mockData';
import { Text } from '@/components/Themed';
import { useEvents } from '@/contexts/EventsContext';
import { usePets } from '@/contexts/PetsContext';

export default function HistoricoScreen() {
  const c = useColors();
  const { events } = useEvents();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  const results = useMemo(() => {
    return events
      .filter((e) => (category ? e.category === category : true))
      .filter((e) => {
        if (!query.trim()) return true;
        const q = query.trim().toLowerCase();
        const medicineNames = e.medicines?.map((m) => m.name).join(' ') ?? '';
        return (
          e.title.toLowerCase().includes(q) ||
          medicineNames.toLowerCase().includes(q) ||
          e.symptom?.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.vet.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [events, query, category]);

  const isRecallMoment = query.trim().length > 0 && results.length > 1;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <View style={styles.header}>
        <Eyebrow>Histórico de saúde</Eyebrow>
        <ScreenTitle style={{ marginBottom: 12 }}>Buscar no histórico</ScreenTitle>

        <View style={[styles.searchBox, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={{ color: c.textFaint, marginRight: 6 }}>⌕</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar por sintoma, remédio, veterinário..."
            placeholderTextColor={c.textFaint}
            style={{ flex: 1, color: c.text, fontSize: 15, paddingVertical: 10 }}
          />
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['Todos', ...healthCategories]}
          keyExtractor={(item) => item}
          contentContainerStyle={{ gap: 8, marginTop: 12, paddingRight: 20 }}
          renderItem={({ item }) => (
            <FilterChip
              label={item}
              active={item === 'Todos' ? category === null : category === item}
              onPress={() => setCategory(item === 'Todos' ? null : item)}
            />
          )}
        />
      </View>

      {isRecallMoment && (
        <View style={[styles.recallBanner, { backgroundColor: c.accentSoft, borderColor: c.accent }]}>
          <Text style={{ color: c.accent, fontSize: 13, fontWeight: '600' }}>
            {results.length} registros encontrados para "{query.trim()}" — já aconteceu antes.
          </Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Muted style={{ paddingHorizontal: 20, marginTop: 20 }}>
            Nada encontrado. Tente outro termo ou categoria.
          </Muted>
        }
        renderItem={({ item }) => <EventCard event={item} />}
      />
    </View>
  );
}

function EventCard({ event }: { event: HealthEvent }) {
  const c = useColors();
  const { pets } = usePets();
  const pet = pets.find((p) => p.id === event.petId);
  const hasMedicines = (event.medicines?.length ?? 0) > 0;

  return (
    <Card style={{ marginBottom: 10 }}>
      <View style={styles.eventTop}>
        <CategoryTag category={event.category} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Muted style={{ fontFamily: Fonts.mono, fontSize: 12 }}>{formatDate(event.date)}</Muted>
          {event.photoUri && <Image source={{ uri: event.photoUri }} style={styles.thumb} />}
        </View>
      </View>

      {hasMedicines ? (
        <View style={{ marginTop: 8, gap: 6 }}>
          {event.medicines!.map((med, i) => (
            <View key={i} style={i > 0 ? [styles.medicineRow, { borderTopColor: c.border }] : undefined}>
              <Text style={{ color: c.text, fontSize: 15, fontWeight: '600' }}>{med.name}</Text>
              <Muted style={{ fontSize: 12.5 }}>{med.dosage}</Muted>
              <Muted style={{ fontSize: 12.5 }}>
                {med.times.join(', ')} · {med.durationDays} dia{med.durationDays > 1 ? 's' : ''}
              </Muted>
            </View>
          ))}
        </View>
      ) : (
        <Text style={{ color: c.text, fontSize: 15.5, fontWeight: '600', marginTop: 8 }}>{event.title}</Text>
      )}

      {event.symptom && <Muted style={{ marginTop: 6 }}>Motivo: {event.symptom}</Muted>}
      <Muted style={{ marginTop: 2, fontSize: 12.5 }}>
        {pet?.name} · {event.vet}
      </Muted>
    </Card>
  );
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-');
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} ${y}`;
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  recallBanner: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  list: {
    padding: 20,
    paddingTop: 14,
  },
  eventTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  medicineRow: {
    paddingTop: 6,
    borderTopWidth: 1,
  },
  thumb: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
});
