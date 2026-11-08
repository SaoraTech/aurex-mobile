export const colors = {
  background: '#F7F8FC',
  surface: '#FFFFFF',
  surfaceMuted: '#F0F2FA',
  surfaceAccent: '#EEF0FF',
  primary: '#4F46E5',
  primaryPressed: '#4338CA',
  indigo: '#6366F1',
  cyan: '#22D3EE',
  violet: '#8B5CF6',
  text: '#17182B',
  textSecondary: '#62677D',
  textMuted: '#9297AA',
  border: '#E7E9F2',
  borderStrong: '#D9DDED',
  success: '#159A72',
  danger: '#D84B61',
  white: '#FFFFFF',
} as const;

export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 48,
} as const;

export const radius = {
  sm: 10, md: 14, lg: 20, xl: 26, pill: 999,
} as const;

export const typography = {
  family: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  mono: 'JetBrainsMono_400Regular',
  monoMedium: 'JetBrainsMono_500Medium',
  size: { xs: 11, sm: 13, md: 15, lg: 17, xl: 21, display: 29 },
  weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
} as const;
