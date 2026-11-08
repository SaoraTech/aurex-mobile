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

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setError('Renseignez votre adresse e-mail et votre mot de passe.');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      setError('Renseignez votre nom.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      if (mode === 'signin') await signIn(email, password);
      else await signUp(name, email, password);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Une erreur est survenue. Réessayez.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMode = () => {
    setError(null);
    setMode((current) => current === 'signin' ? 'signup' : 'signin');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <BrandMark size={48} />
          <View>
            <Text style={styles.brandName}>Aurex</Text>
            <Text style={styles.brandCaption}>SAORA · MATHÉMATIQUES</Text>
          </View>
        </View>

        <View style={styles.intro}>
          <Text style={styles.eyebrow}>VOTRE ESPACE DE TRAVAIL</Text>
          <Text style={styles.title}>{mode === 'signin' ? 'Ravi de vous retrouver.' : 'Créez votre espace Aurex.'}</Text>
          <Text style={styles.subtitle}>
            {mode === 'signin'
              ? 'Connectez-vous pour retrouver vos conversations et poursuivre votre raisonnement.'
              : 'Un compte pour conserver vos conversations et accéder à votre assistant mathématique.'}
          </Text>
        </View>

        <View style={styles.form}>
          {mode === 'signup' && (
            <View style={styles.field}>
              <Text style={styles.label}>Nom complet</Text>
              <TextInput autoCapitalize="words" autoComplete="name" editable={!submitting} onChangeText={setName} placeholder="Votre nom" placeholderTextColor={colors.textMuted} style={styles.input} value={name} />
            </View>
          )}
          <View style={styles.field}>
            <Text style={styles.label}>Adresse e-mail</Text>
            <TextInput autoCapitalize="none" autoComplete="email" autoCorrect={false} editable={!submitting} keyboardType="email-address" onChangeText={setEmail} placeholder="nom@exemple.com" placeholderTextColor={colors.textMuted} style={styles.input} value={email} />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Mot de passe</Text>
            <TextInput autoCapitalize="none" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} editable={!submitting} onChangeText={setPassword} placeholder="Votre mot de passe" placeholderTextColor={colors.textMuted} secureTextEntry style={styles.input} value={password} />
          </View>

          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

          <Pressable accessibilityRole="button" disabled={submitting} onPress={handleSubmit} style={({ pressed }) => [styles.submit, pressed && styles.submitPressed, submitting && styles.submitDisabled]}>
            {submitting ? <ActivityIndicator color={colors.white} /> : <Text style={styles.submitText}>{mode === 'signin' ? 'Se connecter' : 'Créer mon compte'}</Text>}
          </Pressable>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>{mode === 'signin' ? 'Vous découvrez Aurex ?' : 'Vous avez déjà un compte ?'}</Text>
            <Pressable accessibilityRole="button" disabled={submitting} onPress={toggleMode}>
              <Text style={styles.switchAction}>{mode === 'signin' ? 'Créer un compte' : 'Se connecter'}</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.legal}>En continuant, vous utilisez les services Aurex fournis par Saora.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, width: '100%', maxWidth: 520, alignSelf: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.huge },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.huge },
  brandName: { color: colors.text, fontSize: typography.size.xl, fontFamily: typography.bold, fontWeight: typography.weight.bold, letterSpacing: -0.5 },
  brandCaption: { color: colors.textMuted, fontSize: 9, fontFamily: typography.family, letterSpacing: 1.1, marginTop: 2 },
  intro: { marginBottom: spacing.xxxl },
  eyebrow: { color: colors.primary, fontSize: 10, fontFamily: typography.bold, letterSpacing: 1.4, fontWeight: typography.weight.bold, marginBottom: spacing.md },
  title: { color: colors.text, fontSize: 30, lineHeight: 36, fontFamily: typography.bold, fontWeight: typography.weight.bold, letterSpacing: -1 },
  subtitle: { color: colors.textSecondary, fontSize: typography.size.md, fontFamily: typography.family, lineHeight: 23, marginTop: spacing.md },
  form: { gap: spacing.lg, padding: spacing.xl, backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border },
  field: { gap: spacing.sm },
  label: { color: colors.text, fontSize: typography.size.sm, fontFamily: typography.semibold, fontWeight: typography.weight.semibold },
  input: { minHeight: 50, paddingHorizontal: spacing.lg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, color: colors.text, fontSize: typography.size.md, fontFamily: typography.family },
  error: { color: colors.danger, fontSize: typography.size.sm, fontFamily: typography.family, lineHeight: 20 },
  submit: { minHeight: 52, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: radius.md, marginTop: spacing.sm },
  submitPressed: { backgroundColor: colors.primaryPressed },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: colors.white, fontSize: typography.size.md, fontFamily: typography.semibold, fontWeight: typography.weight.semibold },
  switchRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: spacing.xs },
  switchText: { color: colors.textSecondary, fontSize: typography.size.sm, fontFamily: typography.family },
  switchAction: { color: colors.primary, fontSize: typography.size.sm, fontFamily: typography.semibold, fontWeight: typography.weight.semibold },
  legal: { color: colors.textMuted, fontSize: 10, fontFamily: typography.family, textAlign: 'center', marginTop: spacing.xxl, lineHeight: 16 },
});
