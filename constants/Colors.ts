// Paleta do PetCare Wallet — tons de "carteirinha de vacinação":
// verde-petróleo (confiança clínica) + vermelho-carimbo (destaque, ação).
const tealDark = '#1f332e';
const stampRed = '#a63a2e';
const stampRedDark = '#e2704f';

export default {
  light: {
    text: '#1f332e',
    textMuted: '#52655c',
    textFaint: '#7c8c81',
    background: '#eef0e8',
    card: '#f8f9f4',
    cardSunken: '#e3e6d9',
    border: '#d3d8c9',
    tint: stampRed,
    accent: stampRed,
    accentSoft: '#f0dcd3',
    riskLow: '#5b7a5e',
    riskMed: '#a3781f',
    riskHigh: stampRed,
    tabIconDefault: '#9aa79b',
    tabIconSelected: stampRed,
  },
  dark: {
    text: '#e9ede4',
    textMuted: '#a9b8ac',
    textFaint: '#7f9086',
    background: '#131f1a',
    card: '#1a2822',
    cardSunken: '#0e1712',
    border: '#2c3d35',
    tint: stampRedDark,
    accent: stampRedDark,
    accentSoft: '#35241d',
    riskLow: '#7fa583',
    riskMed: '#cf9f3f',
    riskHigh: stampRedDark,
    tabIconDefault: '#5c6f63',
    tabIconSelected: stampRedDark,
  },
};

export const brand = { tealDark, stampRed, stampRedDark };
