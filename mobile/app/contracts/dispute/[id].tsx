/**
 * On-Chain Hakem Heyeti ve Anlaşmazlık Çözüm Odası
 * app/contracts/dispute/[id].tsx
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useWalletStore } from '@/lib/wallet-store';
import { useContracts } from '@/hooks/use-contracts';
import { useTransaction } from '@/hooks/use-transaction';
import AppBackground from '@/components/AppBackground';
import {
  ChevronLeft,
  Gavel,
  CheckCircle2,
  Send,
  Scale,
  Award,
  AlertOctagon,
  MessageSquare,
  Lock,
} from 'lucide-react-native';
import { COLORS, FONTS, SPACING } from '@/constants/theme';
import { mistToSui, formatAddress, Message } from '@/types';

export default function DisputeRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { address } = useWalletStore();
  const { contracts, loading, fetchAllContracts } = useContracts(address);
  const { resolveDispute, sendMessage, sendPrivateMessage, isPending } = useTransaction();

  const contract = contracts.find((c) => c.id === id) || null;
  const [msgContent, setMsgContent] = useState('');
  const [activeTab, setActiveTab] = useState<'general' | 'client_arb' | 'freelancer_arb'>('general');

  if (loading && !contract) {
    return (
      <View style={styles.center}>
        <AppBackground />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Hakem Odası Hazırlanıyor...</Text>
      </View>
    );
  }

  if (!contract) {
    return (
      <View style={styles.center}>
        <AppBackground />
        <AlertOctagon size={48} color={COLORS.destructive} />
        <Text style={styles.errorTitle}>Anlaşmazlık Bulunamadı</Text>
        <TouchableOpacity style={styles.backBtnBox} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const userAddr = address?.toLowerCase() || '';
  const isClient = userAddr === contract.client.toLowerCase();
  const isFreelancer = !!contract.freelancer && userAddr === contract.freelancer.toLowerCase();
  const isArbitrator = !!contract.arbitrator && userAddr === contract.arbitrator.toLowerCase();

  let currentMessages: Message[] = [];
  if (activeTab === 'general') currentMessages = contract.messages || [];
  if (activeTab === 'client_arb') currentMessages = contract.client_arbitrator_messages || [];
  if (activeTab === 'freelancer_arb') currentMessages = contract.freelancer_arbitrator_messages || [];

  // Tab'a göre yetki kontrolü
  let canPost = false;
  let disabledReason = '';
  if (activeTab === 'general') {
    canPost = isClient || isFreelancer || isArbitrator;
    if (!canPost) disabledReason = 'Genel odaya sadece sözleşme tarafları yazabilir.';
  } else if (activeTab === 'client_arb') {
    canPost = isClient || isArbitrator;
    if (!canPost) disabledReason = 'Bu özel odaya sadece Müşteri ve Hakem yazabilir.';
  } else if (activeTab === 'freelancer_arb') {
    canPost = isFreelancer || isArbitrator;
    if (!canPost) disabledReason = 'Bu özel odaya sadece Uzman ve Hakem yazabilir.';
  }

  const handleResolve = (winner: 'client' | 'freelancer') => {
    const winnerAddr = winner === 'client' ? contract.client : contract.freelancer;
    if (!winnerAddr) return;

    const confirmMsg = winner === 'client'
      ? 'Müşteri haklı bulundu. Escrow bedeli müşteriye iade edilecek.'
      : 'Uzman haklı bulundu. Escrow bedeli uzman cüzdanına ödenecek.';

    Alert.alert('Hakem Kararını Onayla', `${confirmMsg}\n\nBu işlem on-chain olarak kaydedilecek ve kesindir. Onaylıyor musunuz?`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Kararı İlet',
        style: 'destructive',
        onPress: async () => {
          try {
            await resolveDispute(contract.id, winnerAddr);
            Alert.alert('Karar On-Chain İşlendi!', 'Hakem kararı akıllı sözleşmeye başarıyla işlendi ve varlıklar serbest bırakıldı.');
            router.back();
          } catch (e: any) {
            Alert.alert('İşlem Hatası', e.message);
          }
        },
      },
    ]);
  };

  const handleSendMsg = async () => {
    if (!msgContent.trim()) return;
    try {
      if (activeTab === 'general') {
        const tag = isArbitrator ? '[HAKEM HEYETİ] ' : isClient ? '[MÜŞTERİ] ' : isFreelancer ? '[UZMAN] ' : '';
        await sendMessage(contract.id, tag + msgContent);
      } else if (activeTab === 'client_arb') {
        await sendPrivateMessage(contract.id, msgContent, 0); // 0: Client
      } else if (activeTab === 'freelancer_arb') {
        await sendPrivateMessage(contract.id, msgContent, 1); // 1: Freelancer
      }
      setMsgContent('');
      fetchAllContracts();
    } catch (e: any) {
      Alert.alert('Gönderim Hatası', e.message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AppBackground />
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} disabled={isPending}>
            <ChevronLeft size={20} color={COLORS.foreground} />
            <Text style={styles.backText}>Sözleşme Detayı</Text>
          </TouchableOpacity>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>HAKEM ODASI</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Anlaşmazlık Özeti */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <View style={styles.summaryLeft}>
                <Text style={styles.summaryLabel}>KİLİTLİ ESCROW VARLIĞI</Text>
                <Text style={styles.summaryAmount}>{mistToSui(contract.total_budget)} SUI</Text>
              </View>
              <Gavel size={32} color={COLORS.primary} />
            </View>

            <View style={styles.reasonBox}>
              <Text style={styles.reasonLabel}>UYUŞMAZLIK GEREKÇESİ / ARGÜMAN:</Text>
              <Text style={styles.reasonText}>
                {contract.dispute_history?.[contract.dispute_history.length - 1]?.reason || 'Taraflar arasında sözleşme teslimat kriterleri ve Escrow iade şartları uyuşmazlığı nedeniyle on-chain hakem heyeti incelemesi başlatılmıştır.'}
              </Text>
            </View>
          </View>

          {/* Taraflar Grid */}
          <View style={styles.partiesGrid}>
            <View style={styles.partyPill}>
              <Text style={styles.partyRole}>MÜŞTERİ</Text>
              <Text style={styles.partyAddr}>{formatAddress(contract.client)}</Text>
              {isClient && <Text style={styles.meTag}>Sen</Text>}
            </View>

            <View style={styles.partyPill}>
              <Text style={styles.partyRole}>UZMAN</Text>
              <Text style={styles.partyAddr}>{contract.freelancer ? formatAddress(contract.freelancer) : 'Atanmadı'}</Text>
              {isFreelancer && <Text style={styles.meTag}>Sen</Text>}
            </View>

            <View style={[styles.partyPill, styles.partyPillArb]}>
              <View style={styles.arbHeader}>
                <Text style={styles.partyRoleArb}>BAĞIMSIZ HAKEM</Text>
                <Award size={16} color={COLORS.primary} />
              </View>
              <Text style={styles.partyAddrArb}>
                {contract.arbitrator ? 'Sistem Hakemi (Anonim)' : 'Atanmadı'}
              </Text>
              {isArbitrator && <Text style={styles.meTagArb}>Sen (Hakem)</Text>}
            </View>
          </View>

          {/* Hakem Aksiyon Paneli (Sadece Kullanıcı Hakem İse) */}
          {isArbitrator ? (
            <View style={styles.arbitrationPanel}>
              <Text style={styles.panelTitle}>Hakem Karar Paneli</Text>
              <Text style={styles.panelDesc}>Bağımsız hakem yetkinizle Escrow varlıklarının kime aktarılacağına karar verin:</Text>

              <View style={styles.actionGrid}>
                <TouchableOpacity
                  style={[styles.btnAction, isPending && styles.btnDisabled]}
                  onPress={() => handleResolve('client')}
                  disabled={isPending}
                >
                  <CheckCircle2 size={18} color={COLORS.foreground} />
                  <Text style={styles.btnActionText}>MÜŞTERİYİ HAKLI BUL (İADE)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btnAction, isPending && styles.btnDisabled]}
                  onPress={() => handleResolve('freelancer')}
                  disabled={isPending}
                >
                  <CheckCircle2 size={18} color={COLORS.foreground} />
                  <Text style={styles.btnActionText}>UZMANI HAKLI BUL (ÖDE)</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.waitingNotice}>
              <AlertOctagon size={18} color={COLORS.primary} />
              <Text style={styles.waitingNoticeText}>
                Hakem incelemesi devam ediyor. Lütfen argümanlarınızı ve kanıtlarınızı iletişim merkezinde paylaşın.
              </Text>
            </View>
          )}

          {/* 3-SEKMELİ (TABBED) İLETİŞİM MERKEZİ */}
          <View style={styles.chatSection}>
            <View style={styles.chatHeader}>
              <MessageSquare size={16} color={COLORS.mutedForeground} />
              <Text style={styles.chatHeaderTitle}>İLETİŞİM MERKEZİ</Text>
            </View>

            {/* Sekme Butonları */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'general' && styles.tabBtnActive]}
                onPress={() => setActiveTab('general')}
              >
                <Text style={[styles.tabBtnText, activeTab === 'general' && styles.tabBtnTextActive]}>GENEL SOHBET</Text>
              </TouchableOpacity>
              {(isClient || isArbitrator) && (
                <TouchableOpacity
                  style={[styles.tabBtn, activeTab === 'client_arb' && styles.tabBtnActive]}
                  onPress={() => setActiveTab('client_arb')}
                >
                  <Text style={[styles.tabBtnText, activeTab === 'client_arb' && styles.tabBtnTextActive]}>HAKEM & MÜŞTERİ</Text>
                </TouchableOpacity>
              )}
              {(isFreelancer || isArbitrator) && (
                <TouchableOpacity
                  style={[styles.tabBtn, activeTab === 'freelancer_arb' && styles.tabBtnActive]}
                  onPress={() => setActiveTab('freelancer_arb')}
                >
                  <Text style={[styles.tabBtnText, activeTab === 'freelancer_arb' && styles.tabBtnTextActive]}>HAKEM & UZMAN</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.chatBox}>
              {currentMessages.length === 0 ? (
                <Text style={styles.emptyChatText}>
                  {activeTab === 'general' ? 'Genel sohbette henüz mesaj paylaşılmadı.' : 'Bu özel odada henüz mesaj yok.'}
                </Text>
              ) : (
                currentMessages.map((msg, idx) => {
                  const isMe = msg.sender.toLowerCase() === userAddr;
                  const isArbMsg = msg.content.startsWith('[HAKEM HEYETİ]') || msg.sender.toLowerCase() === contract.arbitrator?.toLowerCase();
                  const isClientMsg = msg.content.startsWith('[MÜŞTERİ]') || msg.sender.toLowerCase() === contract.client.toLowerCase();
                  const isFreelancerMsg = msg.content.startsWith('[UZMAN]') || msg.sender.toLowerCase() === contract.freelancer?.toLowerCase();

                  let bubbleStyle = styles.bubbleDefault;
                  let senderName = formatAddress(msg.sender);
                  let senderColor = COLORS.primary;

                  if (isArbMsg) {
                    bubbleStyle = styles.bubbleArb;
                    senderName = 'Hakem Heyeti';
                    senderColor = COLORS.primary;
                  } else if (isClientMsg) {
                    bubbleStyle = styles.bubbleClient;
                    senderName = isMe ? 'Sen (Müşteri)' : 'Müşteri';
                    senderColor = COLORS.foreground;
                  } else if (isFreelancerMsg) {
                    bubbleStyle = styles.bubbleFreelancer;
                    senderName = isMe ? 'Sen (Uzman)' : 'Uzman';
                    senderColor = COLORS.foreground;
                  } else if (isMe) {
                    senderName = 'Sen';
                  }

                  const cleanContent = msg.content.replace(/^\[.*?\]\s*/, '');

                  return (
                    <View key={idx} style={[styles.msgContainer, isArbMsg ? styles.msgAlignCenter : isMe ? styles.msgAlignRight : styles.msgAlignLeft]}>
                      <View style={[styles.bubbleBase, bubbleStyle]}>
                        <Text style={[styles.bubbleSender, { color: senderColor }]}>{senderName}</Text>
                        <Text style={styles.bubbleText}>{cleanContent}</Text>
                        <Text style={styles.bubbleTime}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            {/* Mesaj Gönderme Çubuğu */}
            {canPost ? (
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={msgContent}
                  onChangeText={setMsgContent}
                  placeholder={
                    activeTab === 'general' ? 'Genel odaya mesaj yazın...' : 'Özel odaya gizli mesaj yazın...'
                  }
                  placeholderTextColor={COLORS.mutedForeground}
                  editable={!isPending}
                />
                <TouchableOpacity
                  style={[styles.sendBtn, (!msgContent.trim() || isPending) && styles.btnDisabled]}
                  onPress={handleSendMsg}
                  disabled={!msgContent.trim() || isPending}
                >
                  {isPending ? <ActivityIndicator color={COLORS.background} size="small" /> : <Send size={18} color={COLORS.background} />}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.lockBox}>
                <Lock size={16} color={COLORS.mutedForeground} />
                <Text style={styles.lockText}>{disabledReason}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 },
  loadingText: { fontFamily: FONTS.sans, fontSize: 16, fontWeight: '600', color: COLORS.foreground },
  errorTitle: { fontFamily: FONTS.sans, fontSize: 24, fontWeight: '900', color: COLORS.destructive },
  backBtnBox: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  backBtnText: { fontFamily: FONTS.mono, fontSize: 14, fontWeight: '700', color: COLORS.foreground },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { fontFamily: FONTS.sans, fontSize: 15, fontWeight: '700', color: COLORS.foreground },
  badge: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 6 },
  badgeText: { fontFamily: FONTS.mono, fontSize: 11, fontWeight: '900', color: COLORS.primary },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 24, paddingBottom: 60 },
  summaryCard: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, padding: 20, gap: 16 },
  summaryTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryLeft: { gap: 4 },
  summaryLabel: { fontFamily: FONTS.mono, fontSize: 11, fontWeight: '700', color: COLORS.mutedForeground, letterSpacing: 1 },
  summaryAmount: { fontFamily: FONTS.mono, fontSize: 28, fontWeight: '900', color: COLORS.primary },
  reasonBox: { backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: COLORS.border, padding: 14, gap: 6 },
  reasonLabel: { fontFamily: FONTS.mono, fontSize: 10, fontWeight: '900', color: COLORS.mutedForeground },
  reasonText: { fontFamily: FONTS.sans, fontSize: 14, color: COLORS.foreground, lineHeight: 20 },
  partiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  partyPill: { flex: 1, minWidth: '45%', backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, padding: 16, gap: 6 },
  partyPillArb: { width: '100%', borderColor: COLORS.primary, backgroundColor: 'rgba(79,195,247,0.03)' },
  partyRole: { fontFamily: FONTS.mono, fontSize: 11, fontWeight: '800', color: COLORS.mutedForeground },
  partyRoleArb: { fontFamily: FONTS.mono, fontSize: 11, fontWeight: '900', color: COLORS.primary },
  partyAddr: { fontFamily: FONTS.mono, fontSize: 13, fontWeight: '700', color: COLORS.foreground },
  partyAddrArb: { fontFamily: FONTS.mono, fontSize: 14, fontWeight: '700', color: COLORS.primary },
  arbHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  meTag: { alignSelf: 'flex-start', fontFamily: FONTS.mono, fontSize: 10, fontWeight: '900', backgroundColor: COLORS.primary, color: COLORS.background, paddingHorizontal: 6, paddingVertical: 2, marginTop: 4 },
  meTagArb: { alignSelf: 'flex-start', fontFamily: FONTS.mono, fontSize: 10, fontWeight: '900', backgroundColor: COLORS.primary, color: COLORS.background, paddingHorizontal: 6, paddingVertical: 2, marginTop: 4 },
  arbitrationPanel: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, padding: 20, gap: 16 },
  panelTitle: { fontFamily: FONTS.sans, fontSize: 18, fontWeight: '900', color: COLORS.foreground },
  panelDesc: { fontFamily: FONTS.sans, fontSize: 13, color: COLORS.mutedForeground, lineHeight: 20 },
  actionGrid: { gap: 12 },
  btnAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 48, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  btnActionText: { fontFamily: FONTS.mono, fontSize: 13, fontWeight: '900', color: COLORS.foreground },
  btnDisabled: { opacity: 0.5 },
  waitingNotice: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, padding: 16 },
  waitingNoticeText: { flex: 1, fontFamily: FONTS.sans, fontSize: 13, color: COLORS.mutedForeground, lineHeight: 18 },
  chatSection: { gap: 12, marginTop: 10 },
  chatHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chatHeaderTitle: { fontFamily: FONTS.mono, fontSize: 12, fontWeight: '700', color: COLORS.mutedForeground, letterSpacing: 1 },
  tabContainer: { flexDirection: 'row', backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  tabBtn: { flex: 1, height: 44, alignItems: 'center', justifyContent: 'center' },
  tabBtnActive: { backgroundColor: COLORS.primary },
  tabBtnText: { fontFamily: FONTS.mono, fontSize: 11, fontWeight: '700', color: COLORS.mutedForeground },
  tabBtnTextActive: { color: COLORS.background, fontWeight: '900' },
  chatBox: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, padding: 16, minHeight: 250, gap: 14 },
  emptyChatText: { fontFamily: FONTS.sans, fontSize: 13, color: COLORS.mutedForeground, textAlign: 'center', marginTop: 50 },
  msgContainer: { width: '100%', marginVertical: 2 },
  msgAlignLeft: { alignItems: 'flex-start' },
  msgAlignRight: { alignItems: 'flex-end' },
  msgAlignCenter: { alignItems: 'center' },
  bubbleBase: { borderWidth: 1, padding: 14, maxWidth: '85%', minWidth: '60%', gap: 6 },
  bubbleDefault: { backgroundColor: COLORS.background, borderColor: COLORS.border },
  bubbleClient: { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: COLORS.border },
  bubbleFreelancer: { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: COLORS.border },
  bubbleArb: { backgroundColor: 'rgba(79,195,247,0.05)', borderColor: COLORS.primary, borderWidth: 1, width: '95%' },
  bubbleSender: { fontFamily: FONTS.mono, fontSize: 11, fontWeight: '900' },
  bubbleText: { fontFamily: FONTS.sans, fontSize: 14, color: COLORS.foreground, lineHeight: 20 },
  bubbleTime: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.mutedForeground, alignSelf: 'flex-end' },
  inputRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  input: { flex: 1, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, height: 50, paddingHorizontal: 16, fontFamily: FONTS.sans, fontSize: 14, color: COLORS.foreground },
  sendBtn: { width: 50, height: 50, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  lockBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  lockText: { fontFamily: FONTS.sans, fontSize: 13, color: COLORS.mutedForeground, fontStyle: 'italic' },
});
