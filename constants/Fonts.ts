import { Platform } from 'react-native';

// Sans arredondada e amigável pros títulos (clima MeuPet+), sans do
// sistema pro corpo, mono pras tags/labels de categoria.
export const Fonts = {
  serif: Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'system-ui' }),
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
};
