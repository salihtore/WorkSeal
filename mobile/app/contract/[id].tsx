import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, TextInput, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ChevronLeft, Send, CheckCircle2, AlertTriangle,
  Upload, Scale, Clock, Wallet, FileText,
} from 'lucide-react-native';
import { useWalletStore } from '@/lib/wallet-store';
import { useContractDetails } from '@/hooks/useContractDetails';
import { useWorkSealTx } from '@/hooks/useWorkSealTx';
import AppBackground from '@/components/AppBackground';
import StatusBadge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  ContractStatus, Milestone, formatAddress, formatTimestampFull, mistToSui,
} from '@/types';
import { COLORS, FONTS, SPACING } from '@/constants/theme';
import { NULL_ADDRESS } from '@/constants/config';

type TabId = 'details' | 'chat';
type ChatChannel = 'group' | 'client_arb' | 'freelancer_arb';

export default function ContractDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { address } = useWalletStore();
  const { contract, loading, error, refetch } = useContractDetails(id);
  const tx = useWorkSealTx();

  const [activeTab, setActiveTab] = useState<TabId>('details');
  const [chatChannel, setChatChannel] = useState<ChatChannel>('group');
  const [msgText, setMsgText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [proofLink, setProofLink] = useState('');
  const [proofNotes, setProofNotes] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [activeMilestone, setActiveMilestone] = useState<number | null>(null);
  const [showProofForm, setShowProofForm] = useState(false);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (loading) return <LoadingSpinner label="SÖZLEŞME YÜKLENİYOR" />;
  if (error || !contract) {
    return (
      <View style={s.center}>
        <Text style={s.errorText}>{error || 'Sözleşme bulunamadı.'}</Text>
        <Button onPress={() => router.back()} variant="outline" size="md">Geri Dön</Button>
      </View>
    );
  }

  const isClient = address?.toLowerCase() === contract.client.toLowerCase();
  const isFreelancer = contract.freelancer && address?.toLowerCase() === contract.freelancer.toLowerCase();
  const isArbitrator = contract.arbitrator && address?.toLowerCase() === contract.arbitrator.toLowerCase();
  const hasFreelancer = contract.freelancer && contract.freelancer !== NULL_ADDRESS;
  const isDisputed = contract.status === ContractStatus.Disputed;

  const doTx = async (fn: () => Promise<void>, msg: string) => {
    try {
      await fn();
      Alert.alert('İşlem Gönderildi', msg);
    } catch (e: any) {
      if (e.message !== 'Wallet not connected') Alert.alert('Hata', e.message);
    }
  };

  const sendMessage = async () => {
    if (!msgText.trim()) return;
    setSendingMsg(true);
    try {
      if (chatChannel === 'group') {
        await tx.sendMessage({ contract_id: contract.id, content: msgText });
      } else {
        await tx.sendPrivateMessage({
          contract_id: contract.id,
          content: msgText,
          target_role: chatChannel === 'client_arb' ? 0 : 1,
        });
      }
      setMsgText('');
    } catch (e: any) {
      if (e.message !== 'Wallet not connected') Alert.alert('Hata', e.message);
    } finally {
      setSendingMsg(false);
    }
  };

  const messages =
    chatChannel === 'group' ? contract.messages
    : chatChannel === 'client_arb' ? contract.client_arbitrator_messages
    : contract.freelancer_arbitrator_messages;

  return (
    <View style={s.container}>
      <AppBackground />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={18} color={COLORS.foreground} />
          <Text style={s.backText}>Geri</Text>
        </TouchableOpacity>
        <StatusBadge status={contract.status} />
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {(['details', 'chat'] as TabId[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[s.tab, activeTab === t && s.tabActive]}
            onPress={() => setActiveTab(t)}
          >
            <Text style={[s.tabText, activeTab === t && s.tabTextActive]}>
              {t === 'details' ? 'Detaylar' : 'Mesajlar'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'details' && (
          <>
            {/* Title & Description */}
            <View style={s.section}>
              <Text style={s.contractTitle}>{contract.title}</Text>
              <Text style={s.contractDesc}>{contract.description}</Text>

              <View style={s.metaGrid}>
                {[
                  { label: 'MÜŞTERİ', value: formatAddress(contract.client) },
                  { label: 'FREELANCER', value: hasFreelancer ? formatAddress(contract.freelancer!) : 'Boşta' },
                  { label: 'ESCROW', value: `${mistToSui(contract.total_budget)} SUI` },
                  { label: 'SON TARİH', value: formatTimestampFull(contract.deadline) },
                ].map(({ label, value }) => (
                  <View key={label} style={s.metaItem}>
                    <Text style={s.metaLabel}>{label}</Text>
                    <Text style={s.metaValue}>{value}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Actions */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>İŞLEMLER</Text>

              {/* Take job — open contract */}
              {!hasFreelancer && contract.status === ContractStatus.Created && !isClient && (
                <Button fullWidth variant="primary" size="md"
                  onPress={() => doTx(() => tx.takeJob(contract.id), 'İşi üstlendin! Slush Wallet\'ta onayla.')}>
                  İşi Üstlen
                </Button>
              )}

              {/* Fund — client only, status Created */}
              {isClient && contract.status === ContractStatus.Created && (
                <Button fullWidth variant="emerald" size="md"
                  onPress={() => doTx(() => tx.fundContract({ contract_id: contract.id, amount: contract.total_budget }), 'Fonlama gönderildi!')}>
                  Sözleşmeyi Fonla ({mistToSui(contract.total_budget)} SUI)
                </Button>
              )}

              {/* Cancel — client only, status Created */}
              {isClient && contract.status === ContractStatus.Created && (
                <Button fullWidth variant="destructive" size="md"
                  onPress={() => Alert.alert('Emin misin?', 'Sözleşme iptal edilecek.', [
                    { text: 'Vazgeç', style: 'cancel' },
                    { text: 'İptal Et', style: 'destructive', onPress: () => doTx(() => tx.cancelContract({ contract_id: contract.id }), 'Sözleşme iptal edildi.') },
                  ])}>
                  Sözleşmeyi İptal Et
                </Button>
              )}

              {/* Raise dispute — both parties, Active */}
              {(isClient || isFreelancer) && contract.status === ContractStatus.Active && (
                <>
                  <Button fullWidth variant="destructive" size="md"
                    onPress={() => setShowDisputeForm((p) => !p)}>
                    <AlertTriangle size={14} color={COLORS.destructive} />
                    {'  '}Sorun Bildir
                  </Button>
                  {showDisputeForm && (
                    <View style={s.inlineForm}>
                      <Textarea value={disputeReason} onChangeText={setDisputeReason}
                        placeholder="Sorunu açıklayın..." rows={3} />
                      <Button fullWidth variant="destructive" size="md"
                        onPress={() => {
                          if (!disputeReason.trim()) return;
                          doTx(() => tx.raiseDispute({ contract_id: contract.id, reason: disputeReason }), 'Anlaşmazlık başlatıldı.');
                          setShowDisputeForm(false);
                          setDisputeReason('');
                        }}>
                        Bildir
                      </Button>
                    </View>
                  )}
                </>
              )}

              {/* Arbitrator actions — Disputed */}
              {isArbitrator && isDisputed && (
                <View style={s.arbActions}>
                  <Text style={s.arbTitle}>HAKEM KARARI</Text>
                  <Button fullWidth variant="emerald" size="md"
                    onPress={() => doTx(() => tx.resolveDispute({ contract_id: contract.id, winner: contract.client }), 'Müşteri lehine karar verildi.')}>
                    Müşteri Haklı
                  </Button>
                  <Button fullWidth variant="primary" size="md"
                    onPress={() => doTx(() => tx.resolveDispute({ contract_id: contract.id, winner: contract.freelancer! }), 'Freelancer lehine karar verildi.')}>
                    Freelancer Haklı
                  </Button>
                  <Button fullWidth variant="outline" size="md"
                    onPress={() => doTx(() => tx.resumeContractArbitrator({ contract_id: contract.id }), 'Sözleşme devam ettiriliyor.')}>
                    Devam Ettir
                  </Button>
                </View>
              )}
            </View>

            {/* Milestones */}
            <View style={s.section}>
              <Text style={s.sectionTitle}>MİLESTONE'LAR ({contract.milestones.length})</Text>
              {contract.milestones.map((ms: Milestone, i: number) => (
                <View key={i} style={[s.milestone, ms.is_completed && s.milestoneCompleted]}>
                  <View style={s.milestoneTop}>
                    <Text style={s.milestoneNum}>{String(i + 1).padStart(2, '0')}</Text>
                    <Text style={s.milestoneTitle}>{ms.title}</Text>
                    <Text style={s.milestoneAmount}>{mistToSui(ms.amount)} SUI</Text>
                  </View>

                  <View style={s.msStatus}>
                    <View style={[s.msBadge, ms.is_completed ? s.msBadgeGreen : s.msBadgeGray]}>
                      <Text style={[s.msBadgeText, ms.is_completed ? s.msBadgeTextGreen : {}]}>
                        {ms.is_completed ? (ms.is_paid ? 'ÖDENDİ' : 'TAMAMLANDI') : 'BEKLEYEN'}
                      </Text>
                    </View>
                  </View>

                  {/* Client approves completed milestone */}
                  {isClient && ms.is_completed && !ms.is_paid && contract.status === ContractStatus.Active && (
                    <View style={s.msActions}>
                      <Button size="sm" variant="emerald"
                        onPress={() => doTx(() => tx.approveAndReleaseFunds({ contract_id: contract.id, milestone_index: i }), 'Milestone onaylandı ve ödeme gönderildi!')}>
                        <CheckCircle2 size={12} color={COLORS.primaryForeground} /> Onayla
                      </Button>
                      <Button size="sm" variant="destructive"
                        onPress={() => {
                          const reason = 'Revizyon gerekli';
                          doTx(() => tx.rejectMilestone({ contract_id: contract.id, milestone_index: i, reason }), 'Revizyon istendi.');
                        }}>
                        Revize İste
                      </Button>
                    </View>
                  )}

                  {/* Freelancer submits proof */}
                  {isFreelancer && !ms.is_completed && contract.status === ContractStatus.Active && (
                    <>
                      <Button size="sm" variant="outline"
                        onPress={() => { setActiveMilestone(i); setShowProofForm((p) => !p); }}>
                        <Upload size={12} color={COLORS.foreground} /> İş Kanıtı Yükle
                      </Button>
                      {showProofForm && activeMilestone === i && (
                        <View style={s.inlineForm}>
                          <TextInput style={s.inlineInput} value={proofLink} onChangeText={setProofLink}
                            placeholder="Kanıt linki (URL)" placeholderTextColor={COLORS.mutedForeground} />
                          <TextInput style={[s.inlineInput, { minHeight: 60 }]} value={proofNotes}
                            onChangeText={setProofNotes} placeholder="Notlar..."
                            placeholderTextColor={COLORS.mutedForeground} multiline />
                          <Button size="sm" variant="primary" fullWidth
                            onPress={() => {
                              doTx(() => tx.submitMilestone({ contract_id: contract.id, milestone_index: i, proof_link: proofLink, proof_notes: proofNotes }), 'Kanıt gönderildi!');
                              setShowProofForm(false);
                              setProofLink(''); setProofNotes('');
                            }}>
                            Gönder
                          </Button>
                        </View>
                      )}
                    </>
                  )}
                </View>
              ))}
            </View>

            {/* Dispute History */}
            {contract.dispute_history.length > 0 && (
              <View style={s.section}>
                <Text style={s.sectionTitle}>ANLAŞMAZLIK GEÇMİŞİ</Text>
                {contract.dispute_history.map((d, i) => (
                  <View key={i} style={s.disputeItem}>
                    <Text style={s.disputeRaiser}>{formatAddress(d.raised_by)}</Text>
                    <Text style={s.disputeReason}>"{d.reason}"</Text>
                    <Text style={s.disputeTime}>{formatTimestampFull(d.timestamp)}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {activeTab === 'chat' && (
          <>
            {/* Channel selector — only in dispute */}
            {isDisputed && (isArbitrator || isClient || isFreelancer) && (
              <View style={s.channelRow}>
                {([
                  { id: 'group', label: 'Grup' },
                  ...(isClient || isArbitrator ? [{ id: 'client_arb', label: 'Müşteri-Hakem' }] : []),
                  ...(isFreelancer || isArbitrator ? [{ id: 'freelancer_arb', label: 'Freelancer-Hakem' }] : []),
                ] as { id: ChatChannel; label: string }[]).map(({ id: cid, label }) => (
                  <TouchableOpacity key={cid}
                    style={[s.channelBtn, chatChannel === cid && s.channelBtnActive]}
                    onPress={() => setChatChannel(cid)}>
                    <Text style={[s.channelBtnText, chatChannel === cid && s.channelBtnTextActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Messages */}
            {messages.length === 0 ? (
              <View style={s.emptyChat}>
                <Text style={s.emptyChatText}>Henüz mesaj yok.</Text>
              </View>
            ) : (
              messages.map((msg, i) => {
                const isMe = msg.sender.toLowerCase() === address?.toLowerCase();
                const isArb = msg.sender.toLowerCase() === contract.arbitrator?.toLowerCase();
                return (
                  <View key={i} style={[s.msg, isMe && s.msgMe]}>
                    <Text style={[s.msgSender, isArb && s.msgSenderArb]}>
                      {formatAddress(msg.sender)}{isArb ? ' (Hakem)' : ''}
                    </Text>
                    <View style={[s.msgBubble, isMe && s.msgBubbleMe, isArb && s.msgBubbleArb]}>
                      <Text style={[s.msgText, isMe && s.msgTextMe]}>{msg.content}</Text>
                    </View>
                    <Text style={[s.msgTime, isMe && s.msgTimeMe]}>{formatTimestampFull(msg.timestamp)}</Text>
                  </View>
                );
              })
            )}

            {/* Input */}
            <View style={s.msgInput}>
              <TextInput
                style={s.msgInputField}
                value={msgText}
                onChangeText={setMsgText}
                placeholder="Mesajınızı yazın..."
                placeholderTextColor={COLORS.mutedForeground}
                multiline
              />
              <TouchableOpacity
                style={[s.sendBtn, (!msgText.trim() || sendingMsg) && s.sendBtnDisabled]}
                onPress={sendMessage}
                disabled={!msgText.trim() || sendingMsg}
              >
                {sendingMsg
                  ? <ActivityIndicator size="small" color={COLORS.primaryForeground} />
                  : <Send size={16} color={COLORS.primaryForeground} />
                }
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 },
  errorText: { fontFamily: FONTS.mono, fontSize: 12, color: COLORS.destructive, textAlign: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING['2xl'], paddingTop: 52, paddingBottom: SPACING.base,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { fontFamily: FONTS.sans, fontSize: 14, color: COLORS.foreground },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, paddingVertical: 13, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: COLORS.primary },
  tabText: { fontFamily: FONTS.sans, fontSize: 12, fontWeight: '500', color: COLORS.mutedForeground },
  tabTextActive: { color: COLORS.primary, fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  section: { padding: SPACING['2xl'], borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 14 },
  contractTitle: { fontFamily: FONTS.sans, fontSize: 22, fontWeight: '900', color: COLORS.foreground, letterSpacing: -0.5, lineHeight: 26 },
  contractDesc: { fontFamily: FONTS.sans, fontSize: 13, color: COLORS.mutedForeground, lineHeight: 20 },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', borderWidth: 1, borderColor: COLORS.border },
  metaItem: { width: '50%', padding: 12, borderWidth: 0.5, borderColor: COLORS.border, backgroundColor: COLORS.card },
  metaLabel: { fontFamily: FONTS.mono, fontSize: 8, color: COLORS.mutedForeground, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 },
  metaValue: { fontFamily: FONTS.mono, fontSize: 11, fontWeight: '700', color: COLORS.foreground },
  sectionTitle: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.mutedForeground, textTransform: 'uppercase', letterSpacing: 2, fontWeight: '700' },
  inlineForm: { gap: 8, padding: 12, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  inlineInput: {
    backgroundColor: COLORS.input, borderWidth: 1, borderColor: COLORS.border,
    padding: 10, color: COLORS.foreground, fontFamily: FONTS.mono, fontSize: 12,
  },
  arbActions: { gap: 8, padding: 16, borderWidth: 1, borderColor: COLORS.blueBorder, backgroundColor: COLORS.blueBg },
  arbTitle: { fontFamily: FONTS.mono, fontSize: 9, color: COLORS.primary, letterSpacing: 2, textTransform: 'uppercase', fontWeight: '700' },
  milestone: {
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, padding: 14, gap: 10,
  },
  milestoneCompleted: { borderColor: COLORS.emeraldBorder, backgroundColor: 'rgba(52,211,153,0.03)' },
  milestoneTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  milestoneNum: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.mutedForeground, fontWeight: '700' },
  milestoneTitle: { flex: 1, fontFamily: FONTS.sans, fontSize: 13, fontWeight: '600', color: COLORS.foreground },
  milestoneAmount: { fontFamily: FONTS.mono, fontSize: 12, fontWeight: '700', color: COLORS.primary },
  msStatus: { flexDirection: 'row' },
  msBadge: { paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderRadius: 0 },
  msBadgeGreen: { backgroundColor: COLORS.emeraldBg, borderColor: COLORS.emeraldBorder },
  msBadgeGray: { backgroundColor: COLORS.secondary, borderColor: COLORS.border },
  msBadgeText: { fontFamily: FONTS.mono, fontSize: 8, fontWeight: '700', letterSpacing: 1, color: COLORS.mutedForeground },
  msBadgeTextGreen: { color: COLORS.emerald },
  msActions: { flexDirection: 'row', gap: 8 },
  disputeItem: { backgroundColor: COLORS.card, borderWidth: 1, borderLeftWidth: 2, borderColor: COLORS.redBorder, borderLeftColor: COLORS.destructive, padding: 12, gap: 4 },
  disputeRaiser: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.destructive, fontWeight: '700' },
  disputeReason: { fontFamily: FONTS.sans, fontSize: 12, color: COLORS.foreground, lineHeight: 18 },
  disputeTime: { fontFamily: FONTS.mono, fontSize: 9, color: COLORS.mutedForeground },
  channelRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  channelBtn: { flex: 1, paddingVertical: 11, alignItems: 'center' },
  channelBtnActive: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  channelBtnText: { fontFamily: FONTS.mono, fontSize: 9, color: COLORS.mutedForeground, textTransform: 'uppercase', letterSpacing: 1 },
  channelBtnTextActive: { color: COLORS.primary, fontWeight: '700' },
  emptyChat: { alignItems: 'center', paddingVertical: 60 },
  emptyChatText: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.mutedForeground },
  msg: { paddingHorizontal: 20, paddingVertical: 10, alignItems: 'flex-start' },
  msgMe: { alignItems: 'flex-end' },
  msgSender: { fontFamily: FONTS.mono, fontSize: 9, color: COLORS.mutedForeground, marginBottom: 4 },
  msgSenderArb: { color: COLORS.destructive },
  msgBubble: {
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
    padding: 10, maxWidth: '80%',
  },
  msgBubbleMe: { backgroundColor: COLORS.blueBg, borderColor: COLORS.blueBorder },
  msgBubbleArb: { backgroundColor: COLORS.redBg, borderColor: COLORS.redBorder },
  msgText: { fontFamily: FONTS.sans, fontSize: 13, color: COLORS.foreground, lineHeight: 19 },
  msgTextMe: { color: COLORS.foreground },
  msgTime: { fontFamily: FONTS.mono, fontSize: 8, color: COLORS.mutedForeground, marginTop: 3 },
  msgTimeMe: {},
  msgInput: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  msgInputField: {
    flex: 1, backgroundColor: COLORS.input, borderWidth: 1, borderColor: COLORS.border,
    padding: 10, color: COLORS.foreground, fontFamily: FONTS.sans, fontSize: 13,
    maxHeight: 100, minHeight: 40,
  },
  sendBtn: {
    width: 44, height: 44, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
