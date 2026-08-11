import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { Card, Eyebrow, Muted, ScreenTitle, useColors } from '@/components/PetCareUI';
import { Fonts } from '@/constants/Fonts';
import { Text } from '@/components/Themed';
import { Pet } from '@/constants/mockData';
import { usePets } from '@/contexts/PetsContext';
import { useEvents } from '@/contexts/EventsContext';
import { useReminders } from '@/contexts/RemindersContext';
import { useTrial } from '@/contexts/TrialContext';
import { exportBackup, pickBackup } from '@/lib/backup';
import { exportHistoryPdf } from '@/lib/exportHistory';

const settingsItems = ['Notificações e lembretes', 'Dados do tutor', 'Privacidade e LGPD', 'Sobre o MeuPet+'];

export default function PerfilScreen() {
  const c = useColors();
  const { pets, replaceAll: replacePets } = usePets();
  const { events, replaceAll: replaceEvents } = useEvents();
  const { reminders, restoreReminders } = useReminders();
  const { isSubscribed, daysLeft, subscribe } = useTrial();
  const [busy, setBusy] = useState<'export' | 'import' | 'export-history' | null>(null);

  async function handleExport() {
    setBusy('export');
    const result = await exportBackup({ pets, events, reminders });
    setBusy(null);
    if (!result.ok) {
      Alert.alert('Não foi possível compartilhar', 'Seu aparelho não permite compartilhar arquivos agora. Tente novamente mais tarde.');
      return;
    }
    Alert.alert(
      'Backup pronto',
      'Salve o arquivo num lugar seguro (Drive, e-mail, WhatsApp) — ele é sua cópia de segurança caso troque de celular ou reinstale o app.'
    );
  }

  async function runExportHistory(pet: Pet) {
    setBusy('export-history');
    const result = await exportHistoryPdf(pet, events.filter((e) => e.petId === pet.id));
    setBusy(null);
    if (!result.ok) {
      if (result.reason === 'popup-blocked') {
        Alert.alert('Pop-up bloqueado', 'Permita pop-ups para este site e tente novamente.');
      } else {
        Alert.alert('Não foi possível compartilhar', 'Seu aparelho não permite compartilhar arquivos agora. Tente novamente mais tarde.');
      }
    }
  }

  function handleExportHistory() {
    if (pets.length === 0) {
      Alert.alert('Nenhum pet cadastrado', 'Cadastre um pet antes de exportar o histórico.');
      return;
    }
    if (pets.length === 1) {
      runExportHistory(pets[0]);
      return;
    }
    Alert.alert('Exportar histórico de qual pet?', undefined, [
      ...pets.map((pet) => ({ text: pet.name, onPress: () => runExportHistory(pet) })),
      { text: 'Cancelar', style: 'cancel' as const },
    ]);
  }

  async function handleImport() {
    setBusy('import');
    const result = await pickBackup();
    if (!result.ok) {
      setBusy(null);
      if (result.reason === 'invalid') {
        Alert.alert('Arquivo inválido', 'Esse arquivo não parece ser um backup do MeuPet+.');
      }
      return;
    }

    const exportedDate = new Date(result.data.exportedAt).toLocaleDateString('pt-BR');
    Alert.alert(
      'Restaurar backup?',
      `Isso vai substituir os dados atuais por ${result.data.pets.length} pet(s) e ${result.data.events.length} registro(s) do backup de ${exportedDate}.`,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => setBusy(null) },
        {
          text: 'Restaurar',
          style: 'destructive',
          onPress: async () => {
            replacePets(result.data.pets);
            replaceEvents(result.data.events);
            await restoreReminders(result.data.reminders);
            setBusy(null);
            Alert.alert('Backup restaurado', 'Seus dados foram restaurados com sucesso.');
          },
        },
      ]
    );
  }

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
          {isSubscribed ? 'Premium ✓' : `Teste grátis · ${daysLeft} dia${daysLeft !== 1 ? 's' : ''} restante${daysLeft !== 1 ? 's' : ''}`}
        </Text>
        {isSubscribed ? (
          <Text style={{ color: '#fff', opacity: 0.9, fontSize: 13, marginTop: 6 }}>
            Sua assinatura está ativa. Obrigada por apoiar o MeuPet+!
          </Text>
        ) : (
          <>
            <Text style={{ color: '#fff', opacity: 0.9, fontSize: 13, marginTop: 6 }}>
              Depois do teste grátis, assine por R$ 12,90/mês e continue com busca completa por sintoma, alarmes de remédio e histórico em PDF.
            </Text>
            <Pressable style={styles.upgradeButton} onPress={subscribe}>
              <Text style={{ color: c.accent, fontWeight: '700', fontSize: 14 }}>Assinar Premium</Text>
            </Pressable>
          </>
        )}
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

      <SectionLabel>Backup e segurança</SectionLabel>
      <Muted style={{ marginBottom: 10, fontSize: 12.5 }}>
        Seus dados ficam só neste aparelho. Faça backup de vez em quando pra não perder o histórico se trocar de celular.
      </Muted>
      <Card style={{ padding: 0 }}>
        <Pressable style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: c.border }]} onPress={handleExport} disabled={busy !== null}>
          <Text style={{ color: c.text, fontSize: 14.5 }}>
            {busy === 'export' ? 'Gerando backup...' : 'Fazer backup dos dados'}
          </Text>
          <Text style={{ color: c.textFaint }}>›</Text>
        </Pressable>
        <Pressable style={styles.settingRow} onPress={handleImport} disabled={busy !== null}>
          <Text style={{ color: c.text, fontSize: 14.5 }}>
            {busy === 'import' ? 'Lendo arquivo...' : 'Restaurar backup'}
          </Text>
          <Text style={{ color: c.textFaint }}>›</Text>
        </Pressable>
      </Card>

      <SectionLabel>Configurações</SectionLabel>
      <Card style={{ padding: 0 }}>
        <Pressable
          style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: c.border }]}
          onPress={handleExportHistory}
          disabled={busy !== null}>
          <Text style={{ color: c.text, fontSize: 14.5 }}>
            {busy === 'export-history' ? 'Gerando PDF...' : 'Exportar histórico em PDF'}
          </Text>
          <Text style={{ color: c.textFaint }}>›</Text>
        </Pressable>
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
