import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/tokens';

export function IconButton({ label, onPress, accessibilityLabel, disabled = false, variant = 'default' }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'muted' && styles.muted,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.label, variant === 'muted' && styles.mutedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  muted: {
    backgroundColor: colors.surfaceMuted,
    borderColor: 'transparent',
  },
  pressed: { backgroundColor: colors.surfaceAccent, transform: [{ scale: 0.97 }] },
  disabled: { opacity: 0.45 },
  label: {
    color: colors.text,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.medium,
  },
  mutedLabel: { color: colors.textSecondary },
});
