import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/tokens';

const labels = {
  checking: 'Connexion…',
  ready: 'API prête',
  unavailable: 'Hors ligne',
  'not-configured': 'API à configurer',
};

export function ApiStatus({ status }) {
  const color = status === 'ready'
    ? colors.success
    : status === 'unavailable'
      ? colors.danger
      : colors.textMuted;

  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole="text"
      accessibilityLabel={labels[status] ?? labels.checking}
      style={styles.container}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.label}>{labels[status] ?? labels.checking}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
  },
  dot: { width: 7, height: 7, borderRadius: radius.pill },
  label: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: typography.weight.medium,
  },
});
