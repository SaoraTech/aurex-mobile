import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/tokens';

const labels = {
  checking: 'Vérification du service',
  ready: 'Service prêt',
  unavailable: 'Service indisponible',
  'not-configured': 'API non configurée',
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
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
  },
});
