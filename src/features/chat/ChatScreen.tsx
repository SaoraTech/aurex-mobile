import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BrandMark } from '../../components/BrandMark';
import { ApiStatus } from '../../components/ApiStatus';
import { IconButton } from '../../components/IconButton';
import { useAuth } from '../../core/auth/AuthProvider';
import { restoreBearerToken } from '../../core/auth/authApi';
import type { ApiErrorEnvelope } from '../../core/api/apiTypes';
import { useApiStatus } from '../system/useApiStatus';
import { streamChatMessage } from './api/chatStream';
import { listConversationMessages, listConversations } from './api/conversationsApi';
import { PromptCard } from './components/PromptCard';
import { Composer } from './components/Composer';
import { MessageBubble } from './components/MessageBubble';
import type { MessageBubbleProps } from './components/MessageBubble';
import { colors, radius, spacing, typography } from '../../theme/tokens';

type UiMessage = MessageBubbleProps & { id: string };

const prompts = [
  { icon: '∑', title: 'Résoudre un exercice', description: 'Avancez étape par étape vers la solution.' },
  { icon: 'ƒ', title: 'Comprendre un concept', description: 'Clarifiez une notion avec des exemples.' },
  { icon: '△', title: 'Géométrie', description: 'Explorez les figures et leurs propriétés.' },
  { icon: 'π', title: 'Calcul et analyse', description: 'Travaillez les fonctions et les dérivées.' },
];

function describeStreamError(error: ApiErrorEnvelope | Error): string {
  if (error instanceof Error) return error.message;
  if (Array.isArray(error.message)) return error.message.join(' ');
  return error.message || error.code || 'La réponse n’a pas pu être générée.';
}

export default function ChatScreen() {
  const apiStatus = useApiStatus();
  const { user, signOut } = useAuth();
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const streamRef = useRef<{ close: () => void } | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const restoreLatestConversation = async () => {
      const token = await restoreBearerToken();
      if (!token) return;

      const conversations = await listConversations(token, controller.signal);
      const latest = conversations.find((item) => !item.archivedAt);
      if (!latest) return;

      const history = await listConversationMessages(latest.id, token, controller.signal);
      if (!active) return;

      setConversationId(latest.id);
      setMessages(history.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
      })));
    };

    void restoreLatestConversation().catch(() => {
      // Keep the welcome state available if history cannot be loaded.
    });

    return () => {
      active = false;
      controller.abort();
      streamRef.current?.close();
    };
  }, []);

  const startNewConversation = () => {
    streamRef.current?.close();
    streamRef.current = null;
    setSending(false);
    setConversationId(undefined);
    setMessages([]);
    setDraft('');
  };

  const send = async () => {
    const content = draft.trim();
    if (!content || sending) return;

    const userId = `user-${Date.now()}`;
    const assistantId = `assistant-${Date.now()}`;
    setSending(true);
    try {
      const token = await restoreBearerToken();
      if (!token) {
        setMessages((current) => [...current, {
          id: `auth-${Date.now()}`,
          role: 'assistant',
          content: '',
          error: 'Votre session a expiré. Reconnectez-vous pour continuer.',
        }]);
        setSending(false);
        return;
      }

      setMessages((current) => [
        ...current,
        { id: userId, role: 'user', content },
        { id: assistantId, role: 'assistant', content: '', pending: true },
      ]);
      setDraft('');

      streamRef.current = streamChatMessage(
        { conversationId, content, webSearch: 'off' },
        token,
        {
          onDelta: (delta) => {
            setMessages((current) => current.map((message) =>
              message.id === assistantId
                ? { ...message, content: message.content + delta }
                : message,
            ));
          },
          onDone: (result) => {
            setConversationId(result.conversationId);
            setMessages((current) => current.map((message) =>
              message.id === assistantId
                ? { ...message, content: result.message.content, pending: false }
                : message,
            ));
            streamRef.current = null;
            setSending(false);
          },
          onError: (error) => {
            setMessages((current) => current.map((message) =>
              message.id === assistantId
                ? { ...message, pending: false, error: describeStreamError(error) }
                : message,
            ));
            streamRef.current = null;
            setSending(false);
          },
        },
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Connexion impossible.';
      setMessages((current) => current.some((item) => item.id === assistantId)
        ? current.map((item) => item.id === assistantId
          ? { ...item, pending: false, error: message }
          : item)
        : [...current, { id: assistantId, role: 'assistant', content: '', error: message }]);
      setSending(false);
      streamRef.current = null;
    }
  };

  const stop = () => {
    streamRef.current?.close();
    streamRef.current = null;
    setSending(false);
    setMessages((current) => current.map((message) =>
      message.pending
        ? { ...message, pending: false, content: message.content || 'Réponse interrompue.' }
        : message,
    ));
  };

  const choosePrompt = (title: string) => {
    setDraft(`${title} : `);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={styles.brand}>
          <BrandMark size={38} />
          <View>
            <Text style={styles.brandName}>Aurex</Text>
            <Text style={styles.brandCaption}>{user?.name || user?.email || 'Assistant mathématique'}</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <IconButton label="＋" accessibilityLabel="Nouvelle conversation" onPress={startNewConversation} />
          <ApiStatus status={apiStatus} />
          <IconButton label="↗" accessibilityLabel="Se déconnecter" onPress={() => { void signOut(); }} variant="muted" />
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <>
            <View style={styles.hero}>
              <View style={styles.eyebrow}>
                <View style={styles.eyebrowDot} />
                <Text style={styles.eyebrowText}>ESPACE DE RÉFLEXION</Text>
              </View>
              <Text style={styles.title}>Les mathématiques, avec clarté.</Text>
              <Text style={styles.subtitle}>Posez une question, explorez une méthode ou approfondissez une notion. Aurex vous accompagne dans votre raisonnement.</Text>
            </View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Commencer avec Aurex</Text>
              <Text style={styles.sectionMeta}>SUGGESTIONS</Text>
            </View>
            <View style={styles.promptGrid}>
              {prompts.map((prompt) => <PromptCard key={prompt.title} {...prompt} onPress={() => choosePrompt(prompt.title)} />)}
            </View>
            <View style={styles.note}>
              <Text style={styles.noteIcon}>✦</Text>
              <Text style={styles.noteText}>Des explications structurées, des raisonnements détaillés et une attention particulière aux étapes de calcul.</Text>
            </View>
          </>
        ) : (
          <View style={styles.messages}>
            {messages.map((message) => <MessageBubble key={message.id} {...message} />)}
          </View>
        )}
      </ScrollView>

      <View style={styles.composerArea}>
        <Composer
          value={draft}
          onChangeText={setDraft}
          onSend={() => { void send(); }}
          onStop={stop}
          sending={sending}
          placeholder="Posez votre question de mathématiques…"
        />
        <Text style={styles.footerText}>Aurex · Saora</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { minHeight: 76, paddingHorizontal: spacing.xl, paddingTop: Platform.OS === 'android' ? spacing.md : spacing.xl, paddingBottom: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexShrink: 1 },
  brandName: { color: colors.text, fontSize: typography.size.lg, fontWeight: typography.weight.bold, letterSpacing: -0.4 },
  brandCaption: { color: colors.textMuted, fontSize: typography.size.xs, marginTop: 2, maxWidth: 150 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  content: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xxxl, paddingBottom: spacing.xxl },
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
  note: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start', marginTop: spacing.xl, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.surfaceAccent },
  noteIcon: { color: colors.primary, fontSize: 16, marginTop: 1 },
  noteText: { flex: 1, color: colors.textSecondary, fontSize: typography.size.xs, lineHeight: 18 },
  messages: { paddingBottom: spacing.xxl },
  composerArea: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md },
  footerText: { color: colors.textMuted, textAlign: 'center', fontSize: 10, marginTop: spacing.sm, letterSpacing: 0.4 },
});
