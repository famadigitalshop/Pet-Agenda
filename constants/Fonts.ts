import { Platform } from 'react-native';

// Serifada para títulos (clima de documento/carteirinha oficial),
// sans do sistema pro corpo, mono pra tags/labels (clima de carimbo).
export const Fonts = {
  serif: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' }),
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
};
