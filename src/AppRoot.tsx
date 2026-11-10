import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { JetBrainsMono_400Regular, JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from './core/auth/AuthProvider';
import { restoreBearerToken } from './core/auth/authApi';
import { GuestProvider, useGuestSession } from './features/guest/GuestProvider';
import GuestChatScreen from './features/guest/GuestChatScreen';
import AccessScreen from './features/onboarding/AccessScreen';
import WelcomeScreen from './features/onboarding/WelcomeScreen';
import AuthScreen from './features/auth/AuthScreen';
import ChatScreen from './features/chat/ChatScreen';
import { colors, spacing, typography } from './theme/tokens';

void SplashScreen.preventAutoHideAsync();

type EntryScreen = 'welcome' | 'access' | 'auth' | 'guest';
type AuthMode = 'signin' | 'signup';

function AppContent() {
  const { status } = useAuth();
  const guest = useGuestSession();
  const { token: guestToken, transcript: guestTranscript, revokeSession, importToAccount } = guest;
  const [entry, setEntry] = useState<EntryScreen>('welcome');
  const [authMode, setAuthMode] = useState<AuthMode>('signup');
  const [guestStarting, setGuestStarting] = useState(false);
  const [entryError, setEntryError] = useState<string | null>(null);
  const [guestImporting, setGuestImporting] = useState(false);
  const [guestImportError, setGuestImportError] = useState<string | null>(null);
  const [chatRevision, setChatRevision] = useState(0);
  const attemptedGuestToken = useRef<string | null>(null);

  const importGuestConversation = useCallback(async () => {
    if (!guestToken || guestTranscript.length === 0) return;
    setGuestImporting(true);
    setGuestImportError(null);
    try {
      const accessToken = await restoreBearerToken();
      if (!accessToken) throw new Error('La session Aurex est introuvable. Reconnectez-vous pour terminer le transfert.');
      await importToAccount(accessToken);
      setChatRevision((current) => current + 1);
      setGuestImportError(null);
    } catch (cause) {
      setGuestImportError(cause instanceof Error ? cause.message : 'Le transfert de la conversation a échoué.');
    } finally {
      setGuestImporting(false);
    }
  }, [guestToken, guestTranscript.length, importToAccount]);

  useEffect(() => {
    if (status !== 'authenticated' || !guestToken || attemptedGuestToken.current === guestToken) return;
    attemptedGuestToken.current = guestToken;
    if (guestTranscript.length === 0) {
      void revokeSession();
      return;
    }
    void Promise.resolve().then(importGuestConversation);
  }, [status, guestToken, guestTranscript.length, revokeSession, importGuestConversation]);

  const startGuest = async () => {
    setGuestStarting(true);
    setEntryError(null);
    try {
      await guest.startSession();
      setEntry('guest');
    } catch (cause) {
      setEntryError(cause instanceof Error ? cause.message : 'Le mode invité est momentanément indisponible.');
    } finally {
      setGuestStarting(false);
    }
  };

  const retryGuestImport = () => {
    attemptedGuestToken.current = null;
    void importGuestConversation();
  };

  if (status === 'loading') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Préparation de votre espace Aurex…</Text>
      </View>
    );
  }

  if (status === 'authenticated') {
    return (
      <View style={styles.authenticated}>
        {guestImporting ? (
          <View style={styles.importBanner}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.importText}>Transfert sécurisé de votre conversation invitée…</Text>
          </View>
        ) : null}
        {guestImportError ? (
          <View style={styles.importError}>
            <Text style={styles.importErrorText}>Votre compte est prêt, mais la conversation invitée n’a pas encore été importée. Elle reste conservée temporairement sur cet appareil.</Text>
            <Pressable accessibilityRole="button" onPress={retryGuestImport}><Text style={styles.retryText}>Réessayer le transfert</Text></Pressable>
          </View>
        ) : null}
        <ChatScreen key={chatRevision} />
      </View>
    );
  }

  if (entry === 'welcome') {
    return <WelcomeScreen onContinue={() => setEntry('access')} />;
  }

  if (entry === 'access') {
    return (
      <AccessScreen
        onSignIn={() => { setAuthMode('signin'); setEntry('auth'); }}
        onSignUp={() => { setAuthMode('signup'); setEntry('auth'); }}
        onGuest={() => { void startGuest(); }}
        guestLoading={guestStarting}
        error={entryError}
      />
    );
  }

  if (entry === 'auth') {
    return <AuthScreen initialMode={authMode} onBack={() => setEntry('access')} />;
  }

  return (
    <GuestChatScreen
      onSignIn={() => { setAuthMode('signin'); setEntry('auth'); }}
      onSignUp={() => { setAuthMode('signup'); setEntry('auth'); }}
    />
  );
}

export default function AppRoot() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) void SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GuestProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GuestProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, backgroundColor: colors.background },
  loadingText: { color: colors.textSecondary, fontSize: typography.size.sm, fontFamily: typography.family },
  authenticated: { flex: 1, backgroundColor: colors.background },
  importBanner: { minHeight: 42, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surfaceAccent, borderBottomWidth: 1, borderBottomColor: colors.border },
  importText: { color: colors.textSecondary, fontFamily: typography.medium, fontSize: typography.size.xs },
  importError: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.xs, backgroundColor: '#FFF1F2', borderBottomWidth: 1, borderBottomColor: '#FECDD3' },
  importErrorText: { color: colors.danger, fontFamily: typography.family, fontSize: typography.size.xs, lineHeight: 17 },
  retryText: { color: colors.primary, fontFamily: typography.semibold, fontSize: typography.size.xs },
});
