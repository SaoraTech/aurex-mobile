import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { AuthProvider, useAuth } from './core/auth/AuthProvider';
import AuthScreen from './features/auth/AuthScreen';
import ChatScreen from './features/chat/ChatScreen';
import { colors, typography } from './theme/tokens';

function AppContent() {
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Préparation de votre espace Aurex…</Text>
      </View>
    );
  }

  return status === 'authenticated' ? <ChatScreen /> : <AuthScreen />;
}

export default function AppRoot() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: colors.background },
  loadingText: { color: colors.textSecondary, fontSize: typography.size.sm },
});
