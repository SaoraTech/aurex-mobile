import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../../theme/tokens';
import { IconButton } from '../../../components/IconButton';

type ComposerProps = {
  value: string;
  onChangeText?: (value: string) => void;
  onSend?: () => void;
  onStop?: () => void;
  disabled?: boolean;
  sending?: boolean;
  placeholder?: string;
};

export function Composer({
  value,
  onChangeText,
  onSend,
  onStop,
  disabled = false,
  sending = false,
  placeholder = 'Posez votre question de mathématiques…',
}: ComposerProps) {
  const canSend = value.trim().length > 0 && !disabled && !sending;
  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          accessibilityLabel="Votre message"
          editable={!disabled && !sending}
          multiline
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          returnKeyType="default"
          style={styles.input}
          value={value}
        />
        <IconButton
          accessibilityLabel={sending ? 'Arrêter la réponse' : 'Envoyer le message'}
          disabled={sending ? false : !canSend}
          label={sending ? '■' : '↑'}
          onPress={sending ? onStop : onSend}
          variant="muted"
        />
      </View>
      <View style={styles.footer}>
        <Text style={styles.hint}>Aurex peut faire des erreurs. Vérifiez les résultats importants.</Text>
        <Text style={styles.shortcut}>MATH · AI</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, shadowColor: '#20234A', shadowOpacity: 0.06, shadowRadius: 18, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.md },
  input: { flex: 1, minHeight: 42, maxHeight: 116, paddingTop: spacing.sm, paddingBottom: spacing.sm, color: colors.text, fontSize: typography.size.md, lineHeight: 22, textAlignVertical: 'top' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  hint: { flex: 1, color: colors.textMuted, fontSize: 10, lineHeight: 14 },
  shortcut: { color: colors.textMuted, fontSize: 9, letterSpacing: 1, fontWeight: typography.weight.semibold },
});
