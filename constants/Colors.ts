// Paleta do MeuPet+ — extraída da identidade visual da marca:
// índigo profundo (texto/confiança) + laranja (ação/energia) + rosa-magenta (destaque secundário).
const inkIndigo = '#2a1b45';
const brandOrange = '#f0813e';
const brandOrangeDark = '#ff9a5c';
const brandMagenta = '#b23a6b';
const brandMagentaDark = '#e2588e';

export default {
  light: {
    text: inkIndigo,
    textMuted: '#5f5470',
    textFaint: '#8d84a0',
    background: '#fbf1e8',
    card: '#fff7ec',
    cardSunken: '#f3e6d8',
    border: '#ecdccb',
    tint: brandOrange,
    accent: brandOrange,
    accentSoft: '#fbe0cc',
    riskLow: '#5b8a63',
    riskMed: '#b2842c',
    riskHigh: brandMagenta,
    tabIconDefault: '#c3a8c4',
    tabIconSelected: brandOrange,
  },
  dark: {
    text: '#f5ede0',
    textMuted: '#c9bdd6',
    textFaint: '#8d84a0',
    background: '#1c1430',
    card: '#251b3d',
    cardSunken: '#150f24',
    border: '#3a2c55',
    tint: brandOrangeDark,
    accent: brandOrangeDark,
    accentSoft: '#402a26',
    riskLow: '#7fb587',
    riskMed: '#dcb15c',
    riskHigh: brandMagentaDark,
    tabIconDefault: '#6b5e82',
    tabIconSelected: brandOrangeDark,
  },
};

export const brand = { inkIndigo, brandOrange, brandOrangeDark, brandMagenta, brandMagentaDark };
