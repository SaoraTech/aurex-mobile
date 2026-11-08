import { useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { ConversationRecord } from '../../core/api/apiTypes';
import { colors, radius, spacing, typography } from '../../theme/tokens';

type ConversationDrawerProps = {
  visible: boolean;
  conversations: ConversationRecord[];
  onClose: () => void;
  onNewConversation: () => void;
  onSelectConversation: (conversationId: string) => void;
};

const subjectLabels: Record<string, string> = {
  calculus: 'Analyse',
  algebra: 'Algèbre',
  geometry: 'Géométrie',
  statistics: 'Statistiques',
  general: 'Général',
};

function formatUpdatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

export function ConversationDrawer({
  visible,
  conversations,
  onClose,
  onNewConversation,
  onSelectConversation,
}: ConversationDrawerProps) {
  const [query, setQuery] = useState('');
  const filteredConversations = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('fr');
    if (!normalized) return conversations;
    return conversations.filter((item) =>
      item.title.toLocaleLowerCase('fr').includes(normalized)
      || subjectLabels[item.subject]?.toLocaleLowerCase('fr').includes(normalized),
    );
  }, [conversations, query]);

  const closeAndReset = () => {
    setQuery('');
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={closeAndReset}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <View style={styles.panel}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Conversations</Text>
              <Text style={styles.subtitle}>{conversations.length} conversation{conversations.length > 1 ? 's' : ''}</Text>
            </View>
            <Pressable accessibilityLabel="Fermer l’historique" accessibilityRole="button" onPress={closeAndReset} style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>

          <Pressable accessibilityRole="button" onPress={() => { setQuery(''); onNewConversation(); }} style={styles.newButton}>
            <Text style={styles.newIcon}>＋</Text>
            <Text style={styles.newLabel}>Nouvelle conversation</Text>
          </Pressable>

          <TextInput
            accessibilityLabel="Rechercher dans les conversations"
            onChangeText={setQuery}
            placeholder="Rechercher…"
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
            style={styles.search}
            value={query}
          />

          <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {filteredConversations.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>{query ? 'Aucun résultat' : 'Aucune conversation'}</Text>
                <Text style={styles.emptyText}>{query ? 'Essayez un autre terme.' : 'Vos échanges apparaîtront ici.'}</Text>
              </View>
            ) : filteredConversations.map((item) => (
              <Pressable
                accessibilityRole="button"
                key={item.id}
                onPress={() => { closeAndReset(); onSelectConversation(item.id); }}
                style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
              >
                <View style={styles.itemIcon}><Text style={styles.itemIconText}>∑</Text></View>
                <View style={styles.itemBody}>
                  <Text numberOfLines={1} style={styles.itemTitle}>{item.title || 'Nouvelle conversation'}</Text>
                  <Text style={styles.itemMeta}>{subjectLabels[item.subject] || 'Général'} · {formatUpdatedAt(item.updatedAt)}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            ))}
          </ScrollView>
          <Text style={styles.footer}>Aurex · Saora</Text>
        </View>
        <Pressable accessibilityLabel="Fermer l’historique" onPress={closeAndReset} style={styles.backdrop} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(16, 19, 43, 0.36)' },
  panel: { width: '86%', maxWidth: 360, height: '100%', paddingTop: Platform.OS === 'android' ? spacing.xxxl : spacing.huge, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, backgroundColor: colors.surface },
  backdrop: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl },
  title: { color: colors.text, fontSize: typography.size.xl, fontFamily: typography.bold },
  subtitle: { color: colors.textMuted, fontSize: typography.size.xs, fontFamily: typography.family, marginTop: 3 },
  closeButton: { width: 38, height: 38, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceMuted },
  closeText: { color: colors.textSecondary, fontSize: 26, lineHeight: 30 },
  newButton: { minHeight: 48, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.primary, marginBottom: spacing.md },
  newIcon: { color: colors.white, fontSize: 20 },
  newLabel: { color: colors.white, fontSize: typography.size.sm, fontFamily: typography.semibold },
  search: { minHeight: 46, paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, color: colors.text, fontSize: typography.size.sm, fontFamily: typography.family, marginBottom: spacing.md },
  list: { flexGrow: 1, gap: spacing.xs },
  item: { minHeight: 66, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, borderRadius: radius.md, gap: spacing.md },
  itemPressed: { backgroundColor: colors.surfaceAccent },
  itemIcon: { width: 36, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAccent },
  itemIconText: { color: colors.primary, fontSize: 17 },
  itemBody: { flex: 1, minWidth: 0 },
  itemTitle: { color: colors.text, fontSize: typography.size.sm, fontFamily: typography.medium },
  itemMeta: { color: colors.textMuted, fontSize: 10, fontFamily: typography.family, marginTop: 4 },
  chevron: { color: colors.textMuted, fontSize: 24 },
  empty: { flex: 1, minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  emptyTitle: { color: colors.text, fontSize: typography.size.md, fontFamily: typography.semibold },
  emptyText: { color: colors.textMuted, fontSize: typography.size.sm, fontFamily: typography.family },
  footer: { color: colors.textMuted, fontSize: 10, fontFamily: typography.family, textAlign: 'center', paddingTop: spacing.md },
});
