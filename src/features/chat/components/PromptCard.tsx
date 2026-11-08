import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../../theme/tokens';

type PromptCardProps = { icon: string; title: string; description: string };

export function PromptCard({ icon, title, description }: PromptCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}><Text style={styles.icon}>{icon}</Text></View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minHeight: 132, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  iconWrap: { width: 32, height: 32, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAccent, marginBottom: spacing.md },
  icon: { fontSize: 16 },
  title: { color: colors.text, fontSize: typography.size.sm, fontWeight: typography.weight.semibold, marginBottom: spacing.xs },
  description: { color: colors.textSecondary, fontSize: typography.size.xs, lineHeight: 17 },
});
