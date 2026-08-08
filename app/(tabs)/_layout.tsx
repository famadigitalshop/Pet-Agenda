import { SymbolView, SymbolViewProps } from 'expo-symbols';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

function TabBarIcon({ ios, android, color }: { ios: string; android: string; color: ColorValue }) {
  return (
    <SymbolView
      name={{ ios, android, web: android } as unknown as SymbolViewProps['name']}
      tintColor={color as string}
      size={26}
      style={{ marginBottom: -3 }}
    />
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <TabBarIcon ios="house.fill" android="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ color }) => <TabBarIcon ios="clock.fill" android="history" color={color} />,
        }}
      />
      <Tabs.Screen
        name="adicionar"
        options={{
          title: 'Adicionar',
          tabBarIcon: ({ color }) => <TabBarIcon ios="plus.circle.fill" android="add_circle" color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <TabBarIcon ios="person.crop.circle.fill" android="person" color={color} />,
        }}
      />
    </Tabs>
  );
}
