import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { aurexMarkSource } from '../../assets/aurexMark';
import { colors, radius, spacing, typography } from '../../theme/tokens';

type Props = { onSignIn: () => void; onSignUp: () => void; onGuest: () => void; guestLoading?: boolean; error?: string | null };

export default function AccessScreen({ onSignIn, onSignUp, onGuest, guestLoading = false, error }: Props) {
  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.top}><Image source={aurexMarkSource} style={styles.logo} resizeMode="contain" /><Text style={styles.wordmark}>Aurex</Text></View>
      <View style={styles.content}>
        <Text style={styles.kicker}>VOTRE ESPACE MATHÉMATIQUE</Text>
        <Text style={styles.title}>Comment souhaitez-vous continuer ?</Text>
        <Text style={styles.subtitle}>Retrouvez vos conversations ou commencez immédiatement, sans créer de compte.</Text>
        {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
        <Pressable accessibilityRole="button" onPress={onSignIn} style={({pressed})=>[styles.primary,pressed&&styles.pressed]}>
          <Text style={styles.primaryText}>Se connecter</Text><Text style={styles.primaryArrow}>→</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onSignUp} style={({pressed})=>[styles.secondary,pressed&&styles.pressed]}>
          <Text style={styles.secondaryText}>Créer un compte</Text>
        </Pressable>
        <View style={styles.separator}><View style={styles.line}/><Text style={styles.or}>OU</Text><View style={styles.line}/></View>
        <Pressable accessibilityRole="button" disabled={guestLoading} onPress={onGuest} style={({pressed})=>[styles.guest,pressed&&styles.guestPressed,guestLoading&&styles.disabled]}>
          <Text style={styles.guestText}>{guestLoading ? 'Préparation du mode invité…' : 'Continuer en tant qu’invité'}</Text>
        </Pressable>
        <Text style={styles.guestHint}>Le mode invité est temporaire. Créez un compte pour conserver vos échanges.</Text>
      </View>
      <Text style={styles.footer}>AUREX · SAORA</Text>
    </View>
  );
}

const styles=StyleSheet.create({
 screen:{flex:1,backgroundColor:colors.background,paddingHorizontal:spacing.xl,paddingTop:54,paddingBottom:spacing.xl,justifyContent:'space-between'},
 top:{alignItems:'center',gap:spacing.xs},logo:{width:62,height:62},wordmark:{fontFamily:typography.bold,fontSize:typography.size.lg,color:colors.text},
 content:{width:'100%',maxWidth:480,alignSelf:'center',gap:spacing.md},kicker:{fontFamily:typography.semibold,fontSize:10,letterSpacing:1.2,color:colors.primary},title:{fontFamily:typography.bold,fontSize:29,lineHeight:36,letterSpacing:-0.9,color:colors.text},subtitle:{fontFamily:typography.family,fontSize:typography.size.md,lineHeight:23,color:colors.textSecondary,marginBottom:spacing.md},
 primary:{minHeight:54,borderRadius:radius.md,backgroundColor:colors.primary,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:spacing.md},pressed:{opacity:0.88,transform:[{scale:0.99}]},primaryText:{fontFamily:typography.semibold,color:colors.white,fontSize:typography.size.md},primaryArrow:{fontSize:20,color:colors.white},
 secondary:{minHeight:54,borderRadius:radius.md,borderWidth:1,borderColor:colors.borderStrong,backgroundColor:colors.surface,alignItems:'center',justifyContent:'center'},secondaryText:{fontFamily:typography.semibold,color:colors.text,fontSize:typography.size.md},
 separator:{flexDirection:'row',alignItems:'center',gap:spacing.md,marginVertical:spacing.xs},line:{flex:1,height:1,backgroundColor:colors.border},or:{fontFamily:typography.semibold,fontSize:9,letterSpacing:1,color:colors.textMuted},
 guest:{minHeight:52,borderRadius:radius.md,backgroundColor:colors.surfaceMuted,alignItems:'center',justifyContent:'center'},guestPressed:{backgroundColor:colors.surfaceAccent},guestText:{fontFamily:typography.semibold,color:colors.primary,fontSize:typography.size.md},guestHint:{fontFamily:typography.family,fontSize:typography.size.xs,lineHeight:17,color:colors.textMuted,textAlign:'center'},error:{fontFamily:typography.family,color:colors.danger,fontSize:typography.size.sm},disabled:{opacity:0.6},footer:{fontFamily:typography.semibold,fontSize:9,letterSpacing:1.5,color:colors.textMuted,textAlign:'center'}
});
