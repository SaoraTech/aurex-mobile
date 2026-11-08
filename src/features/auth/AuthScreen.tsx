import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BrandMark } from '../../components/BrandMark';
import { useAuth } from '../../core/auth/AuthProvider';
import { colors, radius, spacing, typography } from '../../theme/tokens';

type AuthMode = 'signin' | 'signup';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSignUp = mode === 'signup';

  const handleSubmit = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (isSignUp && !name.trim()) {
      setError('Veuillez saisir votre nom complet.');
      return;
    }
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Veuillez saisir une adresse e-mail valide.');
      return;
    }
    if (!password) {
      setError('Veuillez saisir votre mot de passe.');
      return;
    }
    if (isSignUp && password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (isSignUp && password !== passwordConfirmation) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      if (isSignUp) await signUp(name.trim(), normalizedEmail, password);
      else await signIn(normalizedEmail, password);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Une erreur est survenue. Réessayez.');
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = () => {
    setError(null);
    setMode((current) => current === 'signup' ? 'signin' : 'signup');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.topBar}>
            <View style={styles.brand}>
              <BrandMark size={42} />
              <View>
                <Text style={styles.brandName}>Aurex</Text>
                <Text style={styles.brandCaption}>BY SAORA</Text>
              </View>
            </View>
            <View style={styles.secureLabel}>
              <View style={styles.secureDot} />
              <Text style={styles.secureText}>ESPACE SÉCURISÉ</Text>
            </View>
          </View>

          <View style={styles.hero}>
            <View style={styles.heroAccent} />
            <Text style={styles.eyebrow}>{isSignUp ? 'COMMENCEZ AVEC AUREX' : 'BON RETOUR'}</Text>
            <Text style={styles.title}>
              {isSignUp ? 'Donnez vie à vos idées.' : 'Ravi de vous retrouver.'}
            </Text>
            <Text style={styles.subtitle}>
              {isSignUp
                ? 'Créez votre compte et explorez les mathématiques avec un assistant conçu pour raisonner avec vous.'
                : 'Connectez-vous pour retrouver votre espace et reprendre vos conversations.'}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.formHeading}>
              <Text style={styles.formTitle}>{isSignUp ? 'Créer un compte' : 'Se connecter'}</Text>
              <Text style={styles.formStep}>{isSignUp ? '01 — INSCRIPTION' : 'ACCÈS AU COMPTE'}</Text>
            </View>

            {isSignUp && (
              <View style={styles.field}>
                <Text style={styles.label}>Nom complet</Text>
                <TextInput
                  accessibilityLabel="Nom complet"
                  autoCapitalize="words"
                  autoComplete="name"
                  editable={!submitting}
                  onChangeText={setName}
                  placeholder="Ex. Fousseyni Diallo"
                  placeholderTextColor={colors.textMuted}
                  returnKeyType="next"
                  style={styles.input}
                  value={name}
                />
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.label}>Adresse e-mail</Text>
              <TextInput
                accessibilityLabel="Adresse e-mail"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                editable={!submitting}
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="vous@exemple.com"
                placeholderTextColor={colors.textMuted}
                returnKeyType="next"
                style={styles.input}
                value={email}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.passwordInput}>
                <TextInput
                  accessibilityLabel="Mot de passe"
                  autoCapitalize="none"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  editable={!submitting}
                  onChangeText={setPassword}
                  placeholder="8 caractères minimum"
                  placeholderTextColor={colors.textMuted}
                  returnKeyType={isSignUp ? 'next' : 'done'}
                  secureTextEntry={!passwordVisible}
                  style={styles.passwordTextInput}
                  value={password}
                />
                <Pressable
                  accessibilityLabel={passwordVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  accessibilityRole="button"
                  hitSlop={10}
                  onPress={() => setPasswordVisible((visible) => !visible)}
                  style={styles.visibilityButton}
                >
                  <Text style={styles.visibilityText}>{passwordVisible ? 'Masquer' : 'Voir'}</Text>
                </Pressable>
              </View>
              {isSignUp && <Text style={styles.helper}>Utilisez au moins 8 caractères.</Text>}
            </View>

            {isSignUp && (
              <View style={styles.field}>
                <Text style={styles.label}>Confirmer le mot de passe</Text>
                <View style={styles.passwordInput}>
                  <TextInput
                    accessibilityLabel="Confirmer le mot de passe"
                    autoCapitalize="none"
                    editable={!submitting}
                    onChangeText={setPasswordConfirmation}
                    placeholder="Saisissez à nouveau le mot de passe"
                    placeholderTextColor={colors.textMuted}
                    returnKeyType="done"
                    secureTextEntry={!confirmationVisible}
                    style={styles.passwordTextInput}
                    value={passwordConfirmation}
                  />
                  <Pressable
                    accessibilityLabel={confirmationVisible ? 'Masquer la confirmation' : 'Afficher la confirmation'}
                    accessibilityRole="button"
                    hitSlop={10}
                    onPress={() => setConfirmationVisible((visible) => !visible)}
                    style={styles.visibilityButton}
                  >
                    <Text style={styles.visibilityText}>{confirmationVisible ? 'Masquer' : 'Voir'}</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

            <Pressable
              accessibilityRole="button"
              disabled={submitting}
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.submit,
                pressed && styles.submitPressed,
                submitting && styles.submitDisabled,
              ]}
            >
              {submitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Text style={styles.submitText}>
                    {isSignUp ? 'Créer mon compte' : 'Se connecter'}
                  </Text>
                  <Text style={styles.submitArrow}>→</Text>
                </>
              )}
            </Pressable>

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>
                {isSignUp ? 'Vous avez déjà un compte ?' : 'Vous découvrez Aurex ?'}
              </Text>
              <Pressable accessibilityRole="button" disabled={submitting} onPress={switchMode}>
                <Text style={styles.switchAction}>
                  {isSignUp ? 'Se connecter' : 'Créer un compte'}
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerLine} />
            <Text style={styles.footerText}>
              En continuant, vous acceptez les conditions d’utilisation et la politique de confidentialité d’Aurex.
            </Text>
            <Text style={styles.copyright}>© SAORA · AUREX</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  container: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 42,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  brandName: {
    color: colors.text,
    fontSize: typography.size.xl,
    fontFamily: typography.bold,
    fontWeight: typography.weight.bold,
    letterSpacing: -0.6,
  },
  brandCaption: {
    color: colors.textMuted,
    fontSize: 9,
    fontFamily: typography.semibold,
    fontWeight: typography.weight.semibold,
    letterSpacing: 1.6,
    marginTop: 2,
  },
  secureLabel: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  secureDot: { width: 6, height: 6, borderRadius: radius.pill, backgroundColor: colors.success },
  secureText: {
    color: colors.textMuted,
    fontSize: 9,
    fontFamily: typography.semibold,
    fontWeight: typography.weight.semibold,
    letterSpacing: 1,
  },
  hero: { marginBottom: spacing.xxxl },
  heroAccent: {
    width: 38,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.cyan,
    marginBottom: spacing.xl,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 10,
    fontFamily: typography.bold,
    fontWeight: typography.weight.bold,
    letterSpacing: 1.7,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    lineHeight: 39,
    fontFamily: typography.bold,
    fontWeight: typography.weight.bold,
    letterSpacing: -1.25,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: typography.size.md,
    fontFamily: typography.family,
    lineHeight: 23,
    marginTop: spacing.md,
    maxWidth: 440,
  },
  form: {
    gap: spacing.lg,
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formHeading: { gap: 5, marginBottom: spacing.xs },
  formTitle: {
    color: colors.text,
    fontSize: typography.size.lg,
    fontFamily: typography.bold,
    fontWeight: typography.weight.bold,
    letterSpacing: -0.3,
  },
  formStep: {
    color: colors.textMuted,
    fontSize: 9,
    fontFamily: typography.semibold,
    fontWeight: typography.weight.semibold,
    letterSpacing: 1.2,
  },
  field: { gap: spacing.sm },
  label: {
    color: colors.text,
    fontSize: typography.size.sm,
    fontFamily: typography.semibold,
    fontWeight: typography.weight.semibold,
  },
  input: {
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    color: colors.text,
    fontSize: typography.size.md,
    fontFamily: typography.family,
  },
  passwordInput: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingLeft: spacing.lg,
    paddingRight: spacing.md,
  },
  passwordTextInput: {
    flex: 1,
    minHeight: 50,
    color: colors.text,
    fontSize: typography.size.md,
    fontFamily: typography.family,
    paddingVertical: 0,
  },
  visibilityButton: { paddingVertical: spacing.sm, paddingLeft: spacing.sm },
  visibilityText: {
    color: colors.primary,
    fontSize: typography.size.xs,
    fontFamily: typography.semibold,
    fontWeight: typography.weight.semibold,
  },
  helper: { color: colors.textMuted, fontSize: typography.size.xs, fontFamily: typography.family },
  error: {
    color: colors.danger,
    fontSize: typography.size.sm,
    fontFamily: typography.family,
    lineHeight: 20,
  },
  submit: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    marginTop: spacing.xs,
  },
  submitPressed: { backgroundColor: colors.primaryPressed, transform: [{ scale: 0.99 }] },
  submitDisabled: { opacity: 0.65 },
  submitText: {
    color: colors.white,
    fontSize: typography.size.md,
    fontFamily: typography.semibold,
    fontWeight: typography.weight.semibold,
  },
  submitArrow: { color: colors.white, fontSize: 20, lineHeight: 22 },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  switchText: { color: colors.textSecondary, fontSize: typography.size.sm, fontFamily: typography.family },
  switchAction: {
    color: colors.primary,
    fontSize: typography.size.sm,
    fontFamily: typography.semibold,
    fontWeight: typography.weight.semibold,
  },
  footer: { alignItems: 'center', marginTop: spacing.xxl, gap: spacing.md },
  footerLine: { width: 34, height: 1, backgroundColor: colors.borderStrong, marginBottom: spacing.xs },
  footerText: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 16,
    fontFamily: typography.family,
    textAlign: 'center',
    maxWidth: 360,
  },
  copyright: {
    color: colors.textMuted,
    fontSize: 9,
    fontFamily: typography.semibold,
    fontWeight: typography.weight.semibold,
    letterSpacing: 1.4,
  },
});
