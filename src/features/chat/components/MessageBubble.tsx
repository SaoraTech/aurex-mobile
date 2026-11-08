import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { EnrichedMarkdownText } from 'react-native-enriched-markdown';
import { colors, radius, spacing, typography } from '../../../theme/tokens';

export type MessageBubbleProps = {
  role: 'user' | 'assistant';
  content: string;
  pending?: boolean;
  error?: string | null;
  onCopy?: () => void | Promise<void>;
  onShare?: () => void | Promise<void>;
};

function openSafeLink(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      void Linking.openURL(url).catch(() => undefined);
    }
  } catch {
    // Reject malformed and non-HTTP(S) links from model-generated Markdown.
  }
}

const markdownStyle = {
  paragraph: {
    color: colors.text,
    fontFamily: typography.family,
    fontSize: typography.size.md,
    lineHeight: 23,
    marginBottom: spacing.md,
  },
  h1: {
    color: colors.text,
    fontSize: typography.size.xl,
    fontFamily: typography.bold,
    fontWeight: 'bold' as const,
    marginBottom: spacing.md,
  },
  h2: {
    color: colors.text,
    fontSize: typography.size.lg,
    fontFamily: typography.bold,
    fontWeight: 'bold' as const,
    marginBottom: spacing.sm,
  },
  h3: {
    color: colors.text,
    fontSize: typography.size.md,
    fontFamily: typography.bold,
    fontWeight: 'bold' as const,
    marginBottom: spacing.sm,
  },
  strong: { color: colors.text, fontFamily: typography.bold, fontWeight: 'bold' as const },
  em: { color: colors.textSecondary, fontFamily: typography.family },
  link: { color: colors.primary, fontFamily: typography.medium, underline: true },
  code: {
    color: colors.primary,
    fontFamily: typography.mono,
    fontSize: 12,
    backgroundColor: colors.surfaceAccent,
  },
  codeBlock: {
    color: colors.text,
    fontFamily: typography.mono,
    fontSize: 12,
    backgroundColor: '#17182B',
    padding: spacing.md,
    borderRadius: radius.md,
  },
  math: {
    color: colors.text,
    fontSize: 19,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    marginBottom: spacing.md,
    textAlign: 'center' as const,
  },
  inlineMath: { color: colors.primary },
  blockquote: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
  },
};

export function MessageBubble({ role, content, pending = false, error, onCopy, onShare }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = role === 'user';
  const renderedContent = content || (pending ? 'Réflexion en cours…' : '');

  return (
    <View style={[styles.row, isUser && styles.userRow]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        {!isUser && <Text style={styles.assistantLabel}>AUREX</Text>}
        {isUser ? (
          <Text selectable style={[styles.content, styles.userContent]}>{content}</Text>
        ) : (
          <EnrichedMarkdownText
            containerStyle={styles.markdown}
            flavor="github"
            markdown={renderedContent}
            markdownStyle={markdownStyle}
            onLinkPress={({ url }) => openSafeLink(url)}
            streamingAnimation={pending}
          />
        )}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {pending && content.length > 0 ? <Text style={styles.pending}>Génération en cours</Text> : null}
        {!isUser && !pending && content.length > 0 ? (
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" onPress={async () => { try { await onCopy?.(); setCopied(true); } catch { /* Clipboard may be unavailable on the current platform. */ } }} style={styles.action}>
              <Text style={styles.actionText}>{copied ? '✓ Copié' : 'Copier'}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={async () => { try { await onShare?.(); } catch { /* The native share sheet can be dismissed or unavailable. */ } }} style={styles.action}>
              <Text style={styles.actionText}>Partager</Text>
            </Pressable>
          </View>
        ) : null}
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
  assistantLabel: { color: colors.primary, fontSize: 9, letterSpacing: 1.2, fontFamily: typography.bold, fontWeight: typography.weight.bold, marginBottom: spacing.sm },
  markdown: { minWidth: 0 },
  content: { color: colors.text, fontSize: typography.size.md, fontFamily: typography.family, lineHeight: 23 },
  userContent: { color: colors.white },
  error: { color: colors.danger, fontSize: typography.size.xs, fontFamily: typography.family, marginTop: spacing.sm },
  pending: { color: colors.textMuted, fontSize: 10, fontFamily: typography.family, marginTop: spacing.sm },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginTop: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  action: { paddingVertical: spacing.xs, paddingRight: spacing.sm },
  actionText: { color: colors.primary, fontSize: typography.size.xs, fontFamily: typography.medium },
});
