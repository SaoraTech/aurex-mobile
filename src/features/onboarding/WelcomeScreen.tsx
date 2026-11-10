import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { aurexMarkSource } from '../../assets/aurexMark';
import { colors, radius, spacing, typography } from '../../theme/tokens';

export default function WelcomeScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <View style={styles.top}>
        <Image source={aurexMarkSource} style={styles.logo} resizeMode="contain" />
        <Text style={styles.wordmark}>Aurex</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.eyebrow}><View style={styles.dot} /><Text style={styles.eyebrowText}>UNDERSTAND · REASON · SOLVE</Text></View>
        <Text style={styles.title}>Les mathématiques, avec clarté.</Text>
        <Text style={styles.subtitle}>Un espace de réflexion conçu pour vous aider à comprendre les idées, construire votre raisonnement et résoudre les problèmes.</Text>
      </View>
      <View style={styles.footer}>
        <Pressable accessibilityRole="button" onPress={onContinue} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
          <Text style={styles.buttonText}>Continuer</Text><Text style={styles.arrow}>→</Text>
        </Pressable>
        <Text style={styles.caption}>Un assistant mathématique par Saora</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:colors.background,paddingHorizontal:spacing.xl,paddingTop:64,paddingBottom:spacing.xl,justifyContent:'space-between'},
  top:{alignItems:'center',gap:spacing.sm},logo:{width:76,height:76},wordmark:{fontFamily:typography.bold,fontSize:typography.size.xl,color:colors.text,letterSpacing:-0.7},
  content:{maxWidth:480,alignSelf:'center',width:'100%',gap:spacing.md},eyebrow:{flexDirection:'row',alignItems:'center',gap:spacing.sm},dot:{width:7,height:7,borderRadius:radius.pill,backgroundColor:colors.cyan},eyebrowText:{fontFamily:typography.semibold,fontSize:10,letterSpacing:1.1,color:colors.primary},
  title:{fontFamily:typography.bold,fontSize:34,lineHeight:41,letterSpacing:-1.2,color:colors.text},subtitle:{fontFamily:typography.family,fontSize:typography.size.md,lineHeight:24,color:colors.textSecondary,maxWidth:420},
  footer:{gap:spacing.md},button:{minHeight:56,borderRadius:radius.lg,backgroundColor:colors.primary,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:spacing.md},buttonPressed:{backgroundColor:colors.primaryPressed,transform:[{scale:0.99}]},buttonText:{fontFamily:typography.semibold,fontSize:typography.size.md,color:colors.white},arrow:{fontSize:20,color:colors.white},caption:{fontFamily:typography.family,fontSize:typography.size.xs,color:colors.textMuted,textAlign:'center'},
});
