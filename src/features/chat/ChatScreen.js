import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BrandMark } from '../../components/BrandMark';
import { IconButton } from '../../components/IconButton';
import { PromptCard } from './components/PromptCard';
import { Composer } from './components/Composer';
import { colors, radius, spacing, typography } from '../../theme/tokens';

const prompts = [
  { icon: '∑', title: 'Résoudre un exercice', description: 'Avancez étape par étape vers la solution.' },
  { icon: 'ƒ', title: 'Comprendre un concept', description: 'Clarifiez une notion avec des exemples.' },
  { icon: '△', title: 'Géométrie', description: 'Explorez les figures et leurs propriétés.' },
  { icon: 'π', title: 'Calcul et analyse', description: 'Travaillez les fonctions et les dérivées.' },
];

export default function ChatScreen() {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={styles.brand}>
          <BrandMark size={38} />
          <View>
            <Text style={styles.brandName}>Aurex</Text>
            <Text style={styles.brandCaption}>Votre assistant mathématique</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <IconButton label="＋" accessibilityLabel="Nouvelle conversation" disabled />
          <IconButton label="☰" accessibilityLabel="Ouvrir le menu" variant="muted" disabled />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.eyebrow}>
            <View style={styles.eyebrowDot} />
            <Text style={styles.eyebrowText}>ESPACE DE RÉFLEXION</Text>
          </View>
          <Text style={styles.title}>Les mathématiques, avec clarté.</Text>
          <Text style={styles.subtitle}>
            Posez une question, explorez une méthode ou approfondissez une notion. Aurex vous accompagne dans votre raisonnement.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Commencer avec Aurex</Text>
          <Text style={styles.sectionMeta}>SUGGESTIONS</Text>
        </View>

        <View style={styles.promptGrid}>
          {prompts.map((prompt) => (
            <PromptCard
              key={prompt.title}
              description={prompt.description}
              icon={prompt.icon}
              title={prompt.title}
            />
          ))}
        </View>

        <View style={styles.note}>
          <Text style={styles.noteIcon}>✦</Text>
          <Text style={styles.noteText}>
            Des explications structurées, des raisonnements détaillés et une attention particulière aux étapes de calcul.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.composerArea}>
        <Composer
          disabled
          onSend={() => {}}
          placeholder="La connexion à Aurex sera activée ici…"
          value=""
        />
        <Text style={styles.footerText}>Aurex · Saora</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    minHeight: 76,
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'android' ? spacing.md : spacing.xl,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  brandName: { color: colors.text, fontSize: typography.size.lg, fontWeight: typography.weight.bold, letterSpacing: -0.4 },
  brandCaption: { color: colors.textMuted, fontSize: typography.size.xs, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: spacing.sm },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.xxxl, paddingBottom: spacing.xxl },
  hero: { marginBottom: spacing.xxxl },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  eyebrowDot: { width: 7, height: 7, borderRadius: radius.pill, backgroundColor: colors.cyan },
  eyebrowText: { color: colors.primary, fontSize: 10, fontWeight: typography.weight.bold, letterSpacing: 1.4 },
  title: { maxWidth: 330, color: colors.text, fontSize: typography.size.display, lineHeight: 36, fontWeight: typography.weight.bold, letterSpacing: -1.1 },
  subtitle: { maxWidth: 440, color: colors.textSecondary, fontSize: typography.size.md, lineHeight: 23, marginTop: spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { color: colors.text, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  sectionMeta: { color: colors.textMuted, fontSize: 9, letterSpacing: 1.1, fontWeight: typography.weight.bold },
  promptGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  note: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceAccent,
  },
  noteIcon: { color: colors.primary, fontSize: 16, marginTop: 1 },
  noteText: { flex: 1, color: colors.textSecondary, fontSize: typography.size.xs, lineHeight: 18 },
  composerArea: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md },
  footerText: { color: colors.textMuted, textAlign: 'center', fontSize: 10, marginTop: spacing.sm, letterSpacing: 0.4 },
});
