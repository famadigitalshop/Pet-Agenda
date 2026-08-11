import { ScrollView, StyleSheet, View } from 'react-native';

import { Card, Muted, ScreenTitle, useColors } from '@/components/PetCareUI';
import { Fonts } from '@/constants/Fonts';
import { Text } from '@/components/Themed';

const rights = [
  {
    title: 'Acessar',
    body: 'Todos os dados que você cadastrou ficam sempre visíveis dentro do próprio app — não existe nada "escondido".',
  },
  {
    title: 'Corrigir',
    body: 'Edite as informações de qualquer pet ou registro do histórico a qualquer momento, na aba Histórico ou no Perfil.',
  },
  {
    title: 'Excluir',
    body: 'Exclua um registro, um pet inteiro, ou desinstale o app pra apagar todos os seus dados deste aparelho.',
  },
  {
    title: 'Portar',
    body: 'Exporte uma cópia completa dos seus dados a qualquer momento em Perfil → Fazer backup dos dados.',
  },
];

const permissions = [
  {
    title: 'Câmera e fotos',
    body: 'Usada só quando você tira ou escolhe a foto de uma receita. A imagem fica salva apenas neste aparelho.',
  },
  {
    title: 'Notificações',
    body: 'Usadas só para os alarmes de remédio que você mesmo agenda. São notificações locais, geradas pelo próprio aparelho.',
  },
];

export default function PrivacidadeScreen() {
  const c = useColors();

  return (
    <ScrollView style={{ backgroundColor: c.background }} contentContainerStyle={styles.container}>
      <ScreenTitle style={{ marginBottom: 4 }}>Privacidade e LGPD</ScreenTitle>
      <Muted style={{ marginBottom: 24 }}>Como cuidamos dos dados do seu pet — e dos seus.</Muted>

      <SectionLabel>Onde seus dados ficam</SectionLabel>
      <Card style={{ marginBottom: 20 }}>
        <Text style={{ color: c.text, fontSize: 14, lineHeight: 21 }}>
          O nome, histórico de saúde, fotos de receita e contato do veterinário dos seus pets ficam guardados
          somente neste aparelho. O MeuPet+ não envia esses dados para nenhum servidor — nem nosso, nem de
          terceiros — a não ser quando você mesmo decide compartilhar algo, como gerar um PDF e mandar por
          WhatsApp ou e-mail, ou fazer um backup manual.
        </Text>
      </Card>

      <SectionLabel>O que a gente nunca faz</SectionLabel>
      <Card style={{ marginBottom: 20, gap: 10 }}>
        <BulletLine text="Não vendemos nem compartilhamos seus dados com terceiros." />
        <BulletLine text="Não usamos seus dados para anúncios." />
        <BulletLine text="Não temos acesso ao histórico de saúde do seu pet — ele nunca sai deste aparelho sem você mandar." />
        <BulletLine text="Não pedimos cadastro, e-mail ou login para usar o app." />
      </Card>

      <SectionLabel>Seus direitos (LGPD)</SectionLabel>
      <Card style={{ marginBottom: 20, gap: 14 }}>
        {rights.map((right) => (
          <View key={right.title}>
            <Text style={{ color: c.text, fontWeight: '700', fontSize: 14.5, marginBottom: 2 }}>{right.title}</Text>
            <Muted style={{ fontSize: 13, lineHeight: 19 }}>{right.body}</Muted>
          </View>
        ))}
      </Card>

      <SectionLabel>Permissões que o app pede</SectionLabel>
      <Card style={{ marginBottom: 20, gap: 14 }}>
        {permissions.map((permission) => (
          <View key={permission.title}>
            <Text style={{ color: c.text, fontWeight: '700', fontSize: 14.5, marginBottom: 2 }}>
              {permission.title}
            </Text>
            <Muted style={{ fontSize: 13, lineHeight: 19 }}>{permission.body}</Muted>
          </View>
        ))}
      </Card>

      <SectionLabel>Assinatura</SectionLabel>
      <Card style={{ marginBottom: 20 }}>
        <Text style={{ color: c.text, fontSize: 14, lineHeight: 21 }}>
          O pagamento da assinatura Premium é processado pela loja de aplicativos (App Store ou Google Play).
          O MeuPet+ não vê nem guarda dados do seu cartão ou meio de pagamento.
        </Text>
      </Card>

      <Muted style={{ fontSize: 12, textAlign: 'center', marginTop: 8 }}>
        Dúvidas sobre privacidade? Escreva para contatomeupetmais@gmail.com.{'\n'}Última atualização: agosto de 2026.
      </Muted>
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
        marginBottom: 10,
      }}>
      {children}
    </Text>
  );
}

function BulletLine({ text }: { text: string }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
      <Text style={{ color: c.accent, fontSize: 14 }}>·</Text>
      <Text style={{ color: c.text, fontSize: 14, flex: 1, lineHeight: 20 }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 48,
  },
});
