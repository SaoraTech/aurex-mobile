import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BrandMark } from '../../components/BrandMark';
import { Composer } from '../chat/components/Composer';
import { MessageBubble } from '../chat/components/MessageBubble';
import { useGuestSession } from './GuestProvider';
import { colors, radius, spacing, typography } from '../../theme/tokens';

type Props = { onSignIn: () => void; onSignUp: () => void };

export default function GuestChatScreen({ onSignIn, onSignUp }: Props) {
  const { transcript, quota, status, streamingText, error, sendMessage, stopGeneration, revokeSession } = useGuestSession();
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const sending = status === 'sending';

  useEffect(() => () => { if (sending) stopGeneration(); }, [sending, stopGeneration]);

  const send = async () => {
    const content = draft.trim();
    if (!content || sending || (quota && quota.remaining <= 0)) return;
    setDraft('');
    try { await sendMessage(content); }
    catch { /* The provider exposes the recoverable error and retains the pending user turn. */ }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={styles.brand}><BrandMark size={34}/><View><Text style={styles.brandName}>Aurex</Text><Text style={styles.brandCaption}>Mode invité</Text></View></View>
        <View style={styles.headerActions}>
          <Pressable accessibilityRole="button" onPress={onSignIn} style={styles.textAction}><Text style={styles.actionText}>Connexion</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={onSignUp} style={styles.accountAction}><Text style={styles.accountText}>Créer un compte</Text></Pressable>
        </View>
      </View>
      {quota ? <View style={styles.quota}><Text style={styles.quotaText}>{quota.remaining} message{quota.remaining === 1 ? '' : 's'} invité restant{quota.remaining === 1 ? '' : 's'}</Text><View style={styles.quotaTrack}><View style={[styles.quotaFill,{width:`${Math.max(0,Math.min(100,(quota.remaining/quota.limit)*100))}%`}]} /></View></View> : null}
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" onContentSizeChange={()=>scrollRef.current?.scrollToEnd({animated:true})} showsVerticalScrollIndicator={false}>
        {transcript.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.markHalo}><BrandMark size={52}/></View>
            <Text style={styles.eyebrow}>VOTRE ESPACE DE RÉFLEXION</Text>
            <Text style={styles.title}>Par où commencer ?</Text>
            <Text style={styles.subtitle}>Posez une question de mathématiques. Aurex vous accompagne étape par étape.</Text>
            <View style={styles.suggestions}>
              {['Explique-moi les limites','Résous une équation du second degré','Comment calculer une dérivée ?'].map((item)=><Pressable key={item} onPress={()=>setDraft(item)} style={({pressed})=>[styles.suggestion,pressed&&styles.suggestionPressed]}><Text style={styles.suggestionText}>{item}</Text><Text style={styles.suggestionArrow}>↗</Text></Pressable>)}
            </View>
          </View>
        ) : (
          <View style={styles.messages}>
            {transcript.map((message,index)=><MessageBubble key={`${message.role}-${message.createdAt}-${index}`} role={message.role} content={message.content}/>)}
            {sending && streamingText.length > 0 ? <MessageBubble role="assistant" content={streamingText} pending/> : null}
            {sending && streamingText.length === 0 ? <MessageBubble role="assistant" content="" pending/> : null}
          </View>
        )}
      </ScrollView>
      {error ? <View style={styles.errorBanner}><Text style={styles.errorText}>{error}</Text></View> : null}
      {quota?.remaining === 0 ? <View style={styles.limitBanner}><Text style={styles.limitText}>Votre quota invité est atteint.</Text><Pressable onPress={onSignUp}><Text style={styles.limitLink}>Créer un compte pour continuer →</Text></Pressable></View> : null}
      <View style={styles.composerArea}>
        <Composer value={draft} onChangeText={setDraft} onSend={()=>{void send();}} onStop={stopGeneration} sending={sending} disabled={quota?.remaining === 0} placeholder="Posez votre question de mathématiques…"/>
        <Text style={styles.footer}>Les conversations invitées sont temporaires.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles=StyleSheet.create({
 screen:{flex:1,backgroundColor:colors.background},header:{minHeight:72,paddingHorizontal:spacing.lg,paddingTop:Platform.OS==='android'?spacing.md:spacing.xl,paddingBottom:spacing.md,flexDirection:'row',alignItems:'center',justifyContent:'space-between',backgroundColor:colors.surface,borderBottomWidth:1,borderBottomColor:colors.border},
 brand:{flexDirection:'row',alignItems:'center',gap:spacing.sm},brandName:{fontFamily:typography.bold,fontSize:typography.size.md,color:colors.text},brandCaption:{fontFamily:typography.family,fontSize:10,color:colors.textMuted,marginTop:2},
 headerActions:{flexDirection:'row',alignItems:'center',gap:spacing.sm},textAction:{paddingHorizontal:spacing.sm,paddingVertical:spacing.sm},actionText:{fontFamily:typography.medium,color:colors.primary,fontSize:typography.size.xs},accountAction:{backgroundColor:colors.surfaceAccent,paddingHorizontal:spacing.md,paddingVertical:spacing.sm,borderRadius:radius.md},accountText:{fontFamily:typography.semibold,color:colors.primary,fontSize:typography.size.xs},
 quota:{paddingHorizontal:spacing.lg,paddingVertical:spacing.sm,backgroundColor:colors.surface,borderBottomWidth:1,borderBottomColor:colors.border,gap:6},quotaText:{fontFamily:typography.medium,fontSize:10,color:colors.textSecondary},quotaTrack:{height:3,backgroundColor:colors.surfaceMuted,borderRadius:radius.pill,overflow:'hidden'},quotaFill:{height:3,backgroundColor:colors.primary,borderRadius:radius.pill},
 content:{flexGrow:1,paddingHorizontal:spacing.lg,paddingTop:spacing.xxl,paddingBottom:spacing.xl},empty:{flex:1,justifyContent:'center',alignItems:'flex-start',maxWidth:500,width:'100%',alignSelf:'center'},markHalo:{width:76,height:76,borderRadius:24,backgroundColor:colors.surfaceAccent,alignItems:'center',justifyContent:'center',marginBottom:spacing.xl},eyebrow:{fontFamily:typography.semibold,fontSize:9,letterSpacing:1.3,color:colors.primary,marginBottom:spacing.md},title:{fontFamily:typography.bold,fontSize:30,lineHeight:37,letterSpacing:-0.8,color:colors.text},subtitle:{fontFamily:typography.family,fontSize:typography.size.md,lineHeight:23,color:colors.textSecondary,marginTop:spacing.sm,maxWidth:400},
 suggestions:{width:'100%',gap:spacing.sm,marginTop:spacing.xl},suggestion:{minHeight:50,paddingHorizontal:spacing.md,borderRadius:radius.md,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},suggestionPressed:{backgroundColor:colors.surfaceAccent},suggestionText:{fontFamily:typography.medium,color:colors.textSecondary,fontSize:typography.size.sm},suggestionArrow:{color:colors.primary,fontSize:16},
 messages:{paddingBottom:spacing.xl},errorBanner:{marginHorizontal:spacing.lg,marginBottom:spacing.sm,padding:spacing.md,borderRadius:radius.md,backgroundColor:'#FFF1F2'},errorText:{fontFamily:typography.family,fontSize:typography.size.xs,color:colors.danger},limitBanner:{paddingHorizontal:spacing.lg,paddingVertical:spacing.md,backgroundColor:colors.surfaceAccent,gap:spacing.xs},limitText:{fontFamily:typography.medium,fontSize:typography.size.sm,color:colors.text},limitLink:{fontFamily:typography.semibold,fontSize:typography.size.sm,color:colors.primary},
 composerArea:{paddingHorizontal:spacing.md,paddingTop:spacing.sm,paddingBottom:Platform.OS==='ios'?spacing.xl:spacing.md},footer:{fontFamily:typography.family,fontSize:9,color:colors.textMuted,textAlign:'center',marginTop:spacing.sm}
});
