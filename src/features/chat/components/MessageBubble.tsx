import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../../theme/tokens';

export type MessageBubbleProps = {
  role: 'user' | 'assistant';
  content: string;
  pending?: boolean;
  error?: string | null;
};

export function MessageBubble({ role, content, pending = false, error }: MessageBubbleProps) {
  const isUser = role === 'user';
  return (
    <View style={[styles.row, isUser && styles.userRow]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        {!isUser && <Text style={styles.assistantLabel}>AUREX</Text>}
        <Text selectable style={[styles.content, isUser && styles.userContent]}>
          {content || (pending ? 'Réflexion en cours…' : '')}
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {pending && content.length > 0 ? <Text style={styles.pending}>Génération en cours</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { width: '100%', alignItems: 'flex-start', marginBottom: spacing.lg },
  userRow: { alignItems: 'flex-end' },
  bubble: { maxWidth: '92%', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.lg },
  userBubble: { backgroundColor: colors.primary, borderBottomRightRadius: radius.sm },
  assistantBubble: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: radius.sm },
  assistantLabel: { color: colors.primary, fontSize: 9, letterSpacing: 1.2, fontWeight: typography.weight.bold, marginBottom: spacing.sm },
  content: { color: colors.text, fontSize: typography.size.md, lineHeight: 23 },
  userContent: { color: colors.white },
  error: { color: colors.danger, fontSize: typography.size.xs, marginTop: spacing.sm },
  pending: { color: colors.textMuted, fontSize: 10, marginTop: spacing.sm },
});
