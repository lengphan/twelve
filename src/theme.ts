// One place for the look. Change a value here and the whole app follows.

export const colors = {
  ivory: '#F7F5EF', // app background
  card: '#FFFDF8', // cards and inputs
  line: '#E4E0D6', // hairlines and borders
  lineSoft: '#EEEAE1',
  sunken: '#ECE8DE', // segmented controls, inactive fills
  slate: '#1F252B', // text, buttons, hero cards
  slateMid: '#3A434C',
  muted: '#5D666F', // secondary text (passes contrast on ivory)
  onSlate: '#F7F5EF',
  onSlateMuted: '#B9C0C7',
  slateLine: '#39424B',
  accent: '#E8743B', // progress only, never text
  win: '#2F7D57', // positive changes only. No red anywhere.
};

// Swap the text font in one line (e.g. to Instrument Sans) without touching screens.
export const fonts = {
  regular: 'Geist_400Regular',
  medium: 'Geist_500Medium',
  semibold: 'Geist_600SemiBold',
  mono: 'GeistMono_400Regular',
  monoMedium: 'GeistMono_500Medium',
};

export const radius = { sm: 12, md: 16, lg: 20, xl: 24, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 };

// Motion: one spring for everything so the app feels consistent.
export const spring = { damping: 18, stiffness: 220, mass: 0.8 };
