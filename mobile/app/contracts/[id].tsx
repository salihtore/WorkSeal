import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ChevronLeft,
  CheckCircle,
  Clock,
  Send,
  Shield,
  User,
  AlertTriangle,
  Upload,
  XCircle,
  DollarSign,
  FileText,
} from 'lucide-react-native';
import { useWalletStore } from '@/lib/wallet-store';
import { useContracts } from '@/hooks/use-contracts';
import { useTransaction } from '@/hooks/use-transaction';
import AppBackground from '@/components/AppBackground';
import {
  ContractStatus,
  Milestone,
  mistToSui,
  getStatusLabel,
  getStatusColors,
  formatAddress,
  formatDate,
} from '@/types';

export default function ContractDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { address } = useWalletStore();
  const { contracts, loading, error, fetchAllContracts } = useContracts(address);
  const {
    fundContract,
    cancelContract,
    takeJob,
    submitMilestone,
    approveAndRelease,
    rejectMilestone,
    raiseDispute,
    sendMessage,
    isPending,
  } = useTransaction();

  const contract = contracts.find((c) => c.id === id) || null;
  const [refreshing, setRefreshing] = useState(false);

  // Milestone Teslim Formu
  const [activeSubmitIndex, setActiveSubmitIndex] = useState<number | null>(null);
  const [proofLink, setProofLink] = useState('');
  const [proofNotes, setProofNotes] = useState('');

  // Milestone Red (Revizyon) Formu
  const [activeRejectIndex, setActiveRejectIndex] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Anlaşmazlık Formu
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReasonText, setDisputeReasonText] = useState('');

  // Sohbet Formu
  const [msgContent, setMsgContent] = useState('');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllContracts();
    setRefreshing(false);
  }, [fetchAllContracts]);

  if (loading && !contract) {
    return (
      <View style={styles.center}>
        <AppBackground />
        <ActivityIndicator size="large" color="#6c63ff" />
        <Text style={styles.loadingText}>Sözleşme Bilgileri Yükleniyor...</Text>
      </View>
    );
  }

  if (error || !contract) {
    return (
      <View style={styles.center}>
        <AppBackground />
        <AlertTriangle size={48} color="#ff4d6d" />
        <Text style={styles.errorTitle}>Sözleşme Bulunamadı</Text>
        <Text style={styles.errorSub}>{error || 'Bu sözleşmeye erişim izniniz yok veya sözleşme silinmiş.'}</Text>
        <TouchableOpacity style={styles.backBtnBox} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const userAddr = address?.toLowerCase() || '';
  const isClient = userAddr === contract.client.toLowerCase();
  const isFreelancer = contract.freelancer !== null && userAddr === contract.freelancer.toLowerCase();
  const isArbitrator = contract.arbitrator !== null && userAddr === contract.arbitrator.toLowerCase();

  const statusColors = getStatusColors(contract.status);
  const statusLabel = getStatusLabel(contract.status);

  const handleFund = async () => {
    try {
      await fundContract(contract.id, contract.total_budget);
      Alert.alert('Başarılı', 'Sözleşme fonlandı ve aktif duruma geçti!');
      fetchAllContracts();
    } catch (e: any) {
      Alert.alert('Fonlama Başarısız', e.message);
    }
  };

  const handleCancel = async () => {
    Alert.alert('Sözleşmeyi İptal Et', 'Bu işlemi onaylıyor musunuz?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'İptal Et',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelContract(contract.id);
            Alert.alert('İptal Edildi', 'Sözleşme başarıyla iptal edildi.');
            fetchAllContracts();
          } catch (e: any) {
            Alert.alert('Hata', e.message);
          }
        },
      },
    ]);
  };

  const handleTakeJob = async () => {
    try {
      await takeJob(contract.id);
      Alert.alert('Tebrikler!', 'İşi başarıyla üstlendiniz. Sözleşme aktif duruma geçti.');
      fetchAllContracts();
    } catch (e: any) {
      Alert.alert('Hata', e.message);
    }
  };

  const handleSubmitMilestone = async (index: number) => {
    if (!proofLink.trim() && !proofNotes.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen iş kanıtı linki veya açıklaması girin.');
      return;
    }
    try {
      await submitMilestone(contract.id, index, proofLink, proofNotes);
      Alert.alert('Teslim Edildi', `${index + 1}. aşama işveren onayına sunuldu.`);
      setActiveSubmitIndex(null);
      setProofLink('');
      setProofNotes('');
      fetchAllContracts();
    } catch (e: any) {
      Alert.alert('Hata', e.message);
    }
  };

  const handleApproveMilestone = async (index: number) => {
    Alert.alert('Onayla ve Öde', `${index + 1}. aşama için SUI ödemesini serbest bırakmak istediğinize emin misiniz?`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Öde',
        onPress: async () => {
          try {
            await approveAndRelease(contract.id, index);
            Alert.alert('Ödeme Başarılı', 'Freelancer ödemesi başarıyla cüzdanına gönderildi.');
            fetchAllContracts();
          } catch (e: any) {
            Alert.alert('Hata', e.message);
          }
        },
      },
    ]);
  };

  const handleRejectMilestone = async (index: number) => {
    if (!rejectReason.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen ret (revizyon) nedenini belirtin.');
      return;
    }
    try {
      await rejectMilestone(contract.id, index, rejectReason);
      Alert.alert('Reddedildi', 'Revizyon talebi freelancer cüzdanına iletildi.');
      setActiveRejectIndex(null);
      setRejectReason('');
      fetchAllContracts();
    } catch (e: any) {
      Alert.alert('Hata', e.message);
    }
  };

  const handleRaiseDispute = async () => {
    if (!disputeReasonText.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen anlaşmazlık gerekçesini detaylı yazın.');
      return;
    }
    try {
      await raiseDispute(contract.id, disputeReasonText);
      Alert.alert('Anlaşmazlık Başlatıldı', 'Sözleşme kilitlendi ve hakem incelemesine alındı.');
      setShowDisputeForm(false);
      setDisputeReasonText('');
      fetchAllContracts();
    } catch (e: any) {
      Alert.alert('Hata', e.message);
    }
  };

  const handleSendMessage = async () => {
    if (!msgContent.trim()) return;
    try {
      await sendMessage(contract.id, msgContent);
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
            <ChevronLeft size={20} color="#e8e8f0" />
            <Text style={styles.backText}>Geri</Text>
          </TouchableOpacity>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg, borderColor: statusColors.border }]}>
            <Text style={[styles.statusBadgeText, { color: statusColors.text }]}>{statusLabel}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6c63ff" />}
          showsVerticalScrollIndicator={false}
        >
          {/* Bölüm 2: Sözleşme Bilgileri */}
          <View style={styles.section}>
            <Text style={styles.title}>{contract.title}</Text>
            <Text style={styles.description}>{contract.description}</Text>
          </View>

          {/* Bölüm 3: Escrow Kartı */}
          <View style={styles.escrowCard}>
            <View style={styles.escrowTop}>
              <View style={styles.escrowLeft}>
                <Text style={styles.escrowLabel}>ESCROW HESAP TUTARI</Text>
                <Text style={styles.escrowAmount}>{mistToSui(contract.total_budget)} SUI</Text>
              </View>
              <Shield size={28} color="#6c63ff" />
            </View>

            {isClient && contract.status === ContractStatus.Created && (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.btnPrimary, isPending && styles.btnDisabled]}
                  onPress={handleFund}
                  disabled={isPending}
                >
                  {isPending ? <ActivityIndicator color="#e8e8f0" size="small" /> : <Text style={styles.btnPrimaryText}>ESCROW YÜKLE</Text>}
                </TouchableOpacity>

                {contract.freelancer === null && (
                  <TouchableOpacity
                    style={[styles.btnDestructiveOutline, isPending && styles.btnDisabled]}
                    onPress={handleCancel}
                    disabled={isPending}
                  >
                    <Text style={styles.btnDestructiveOutlineText}>İPTAL ET</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* Bölüm 4: İş Al Butonu */}
          {contract.freelancer === null && contract.status === ContractStatus.Active && !isClient && (
            <View style={styles.takeJobCard}>
              <Text style={styles.takeJobTitle}>Bu İlan Açık (Freelancer Aranıyor)</Text>
              <Text style={styles.takeJobDesc}>Bütçe kilitlenmiş durumda. İşi üstlenerek çalışmaya hemen başlayabilirsiniz.</Text>
              <TouchableOpacity
                style={[styles.btnPrimary, { marginTop: 12 }, isPending && styles.btnDisabled]}
                onPress={handleTakeJob}
                disabled={isPending}
              >
                {isPending ? <ActivityIndicator color="#e8e8f0" size="small" /> : <Text style={styles.btnPrimaryText}>İŞİ AL</Text>}
              </TouchableOpacity>
            </View>
          )}

          {/* Bölüm 5: Taraflar */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TARAFLAR VE TESLİM</Text>
            <View style={styles.partiesGrid}>
              <View style={styles.partyItem}>
                <Text style={styles.partyLabel}>MÜŞTERİ</Text>
                <View style={styles.partyRow}>
                  <Text style={styles.partyValue}>{formatAddress(contract.client)}</Text>
                  {isClient && <View style={styles.meBadge}><Text style={styles.meBadgeText}>Sen</Text></View>}
                </View>
              </View>

              <View style={styles.partyItem}>
                <Text style={styles.partyLabel}>FREELANCER</Text>
                <View style={styles.partyRow}>
                  <Text style={styles.partyValue}>
                    {contract.freelancer === null ? 'Atanmadı (Açık İlan)' : formatAddress(contract.freelancer)}
                  </Text>
                  {isFreelancer && <View style={styles.meBadge}><Text style={styles.meBadgeText}>Sen</Text></View>}
                </View>
              </View>

              {contract.arbitrator !== null && (
                <View style={[styles.partyItem, { width: '100%' }]}>
                  <Text style={styles.partyLabel}>ATANAN HAKEM</Text>
                  <Text style={styles.partyValue}>{formatAddress(contract.arbitrator)}</Text>
                </View>
              )}

              <View style={[styles.partyItem, { width: '100%' }]}>
                <Text style={styles.partyLabel}>SON TESLİM TARİHİ</Text>
                <Text style={styles.partyValue}>{formatDate(contract.deadline)}</Text>
              </View>
            </View>
          </View>

          {/* Bölüm 6: Milestone Listesi */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AŞAMALAR ({contract.milestones.length})</Text>

            {contract.milestones.map((ms: Milestone, index: number) => {
              const msStatusText = ms.is_paid ? 'ÖDENDİ' : ms.is_completed ? 'TESLİM EDİLDİ' : 'BEKLIYOR';
              const msStatusColor = ms.is_paid ? '#4ade80' : ms.is_completed ? '#6c63ff' : '#6b6b85';

              return (
                <View key={index} style={[styles.milestoneCard, ms.is_paid && styles.milestonePaid]}>
                  <View style={styles.msTop}>
                    <View style={styles.msLeft}>
                      {ms.is_paid ? (
                        <CheckCircle size={20} color="#4ade80" />
                      ) : ms.is_completed ? (
                        <Clock size={20} color="#6c63ff" />
                      ) : (
                        <Clock size={20} color="#6b6b85" />
                      )}
                      <Text style={styles.msTitle}>{ms.title}</Text>
                    </View>
                    <Text style={styles.msAmount}>{mistToSui(ms.amount)} SUI</Text>
                  </View>

                  <View style={styles.msMetaRow}>
                    <View style={[styles.msBadge, { borderColor: msStatusColor, backgroundColor: `${msStatusColor}15` }]}>
                      <Text style={[styles.msBadgeText, { color: msStatusColor }]}>{msStatusText}</Text>
                    </View>
                  </View>

                  {ms.proof_link ? <Text style={styles.proofLink}>🔗 Kanıt URL: {ms.proof_link}</Text> : null}
                  {ms.proof_notes ? <Text style={styles.proofNotes}>" {ms.proof_notes} "</Text> : null}

                  {/* Freelancer İş Kanıtı Yükleme */}
                  {isFreelancer && !ms.is_completed && contract.status === ContractStatus.Active && (
                    <View style={styles.msActions}>
                      <TouchableOpacity
                        style={styles.btnOutline}
                        onPress={() => setActiveSubmitIndex(activeSubmitIndex === index ? null : index)}
                        disabled={isPending}
                      >
                        <Upload size={16} color="#e8e8f0" />
                        <Text style={styles.btnOutlineText}>TESLİM ET</Text>
                      </TouchableOpacity>

                      {activeSubmitIndex === index && (
                        <View style={styles.inlineForm}>
                          <TextInput
                            style={styles.inlineInput}
                            value={proofLink}
                            onChangeText={setProofLink}
                            placeholder="Kanıt Linki (URL veya boş)"
                            placeholderTextColor="#6b6b85"
                          />
                          <TextInput
                            style={[styles.inlineInput, { height: 70 }]}
                            value={proofNotes}
                            onChangeText={setProofNotes}
                            placeholder="Teslimat açıklaması veya notlarınız..."
                            placeholderTextColor="#6b6b85"
                            multiline
                          />
                          <TouchableOpacity
                            style={[styles.btnPrimary, isPending && styles.btnDisabled]}
                            onPress={() => handleSubmitMilestone(index)}
                            disabled={isPending}
                          >
                            {isPending ? <ActivityIndicator color="#e8e8f0" size="small" /> : <Text style={styles.btnPrimaryText}>GÖNDER</Text>}
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Müşteri Onay ve Red Butonları */}
                  {isClient && ms.is_completed && !ms.is_paid && contract.status === ContractStatus.Active && (
                    <View style={styles.msActions}>
                      <View style={styles.btnRow}>
                        <TouchableOpacity
                          style={[styles.btnSuccess, { flex: 1 }, isPending && styles.btnDisabled]}
                          onPress={() => handleApproveMilestone(index)}
                          disabled={isPending}
                        >
                          <CheckCircle size={16} color="#e8e8f0" />
                          <Text style={styles.btnSuccessText}>ONAYLA VE ÖDE</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.btnDestructiveOutline, { flex: 1 }, isPending && styles.btnDisabled]}
                          onPress={() => setActiveRejectIndex(activeRejectIndex === index ? null : index)}
                          disabled={isPending}
                        >
                          <Text style={styles.btnDestructiveOutlineText}>REDDET</Text>
                        </TouchableOpacity>
                      </View>

                      {activeRejectIndex === index && (
                        <View style={styles.inlineForm}>
                          <TextInput
                            style={styles.inlineInput}
                            value={rejectReason}
                            onChangeText={setRejectReason}
                            placeholder="Revizyon / Ret gerekçesi yazın..."
                            placeholderTextColor="#6b6b85"
                          />
                          <TouchableOpacity
                            style={[styles.btnDestructive, isPending && styles.btnDisabled]}
                            onPress={() => handleRejectMilestone(index)}
                            disabled={isPending}
                          >
                            {isPending ? <ActivityIndicator color="#e8e8f0" size="small" /> : <Text style={styles.btnDestructiveText}>REDDET VE REVİZE İSTE</Text>}
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Bölüm 7: Mesajlaşma Bölümü */}
          {(contract.status === ContractStatus.Active || contract.status === ContractStatus.Disputed) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SÖZLEŞME SOHBETİ ({contract.messages.length})</Text>

              <View style={styles.chatContainer}>
                {contract.messages.length === 0 ? (
                  <Text style={styles.emptyChat}>Henüz sohbet mesajı yok.</Text>
                ) : (
                  contract.messages.map((msg, idx) => {
                    const isMe = msg.sender.toLowerCase() === userAddr;
                    return (
                      <View key={idx} style={[styles.msgRow, isMe && styles.msgRowMe]}>
                        <View style={[styles.msgBubble, isMe && styles.msgBubbleMe]}>
                          <Text style={styles.msgSender}>{isMe ? 'Sen' : formatAddress(msg.sender)}</Text>
                          <Text style={styles.msgContent}>{msg.content}</Text>
                          <Text style={styles.msgTime}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>

              <View style={styles.chatInputRow}>
                <TextInput
                  style={styles.chatInput}
                  value={msgContent}
                  onChangeText={setMsgContent}
                  placeholder="Mesajınızı buraya yazın..."
                  placeholderTextColor="#6b6b85"
                  editable={!isPending}
                />
                <TouchableOpacity
                  style={[styles.sendBtn, (!msgContent.trim() || isPending) && styles.btnDisabled]}
                  onPress={handleSendMessage}
                  disabled={!msgContent.trim() || isPending}
                >
                  {isPending ? <ActivityIndicator color="#e8e8f0" size="small" /> : <Send size={18} color="#e8e8f0" />}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Bölüm 8: Anlaşmazlık Bölümü */}
          {contract.status === ContractStatus.Active && (isClient || isFreelancer) && (
            <View style={styles.disputeSection}>
              {!showDisputeForm ? (
                <TouchableOpacity
                  style={styles.btnDestructiveOutline}
                  onPress={() => setShowDisputeForm(true)}
                  disabled={isPending}
                >
                  <AlertTriangle size={18} color="#ff4d6d" />
                  <Text style={styles.btnDestructiveOutlineText}>ANLAŞMAZLIK BAŞLAT</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.disputeBox}>
                  <Text style={styles.disputeTitle}>Anlaşmazlık Gerekçesi</Text>
                  <TextInput
                    style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                    value={disputeReasonText}
                    onChangeText={setDisputeReasonText}
                    placeholder="Lütfen sorunu ve hakemden beklentinizi detaylıca açıklayın..."
                    placeholderTextColor="#6b6b85"
                    multiline
                  />
                  <View style={styles.btnRow}>
                    <TouchableOpacity
                      style={[styles.btnDestructive, { flex: 1 }, isPending && styles.btnDisabled]}
                      onPress={handleRaiseDispute}
                      disabled={isPending}
                    >
                      {isPending ? <ActivityIndicator color="#e8e8f0" size="small" /> : <Text style={styles.btnDestructiveText}>BİLDİR VE KİLİTLE</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.btnOutline, { flex: 0.5 }]}
                      onPress={() => setShowDisputeForm(false)}
                      disabled={isPending}
                    >
                      <Text style={styles.btnOutlineText}>Vazgeç</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}

          {contract.status === ContractStatus.Disputed && (
            <View style={styles.disputeActiveCard}>
              <AlertTriangle size={28} color="#ffbf24" />
              <Text style={styles.disputeActiveTitle}>Hakem İnceleme Sürecinde</Text>
              <Text style={styles.disputeActiveDesc}>
                Bu sözleşme anlaşmazlık nedeniyle kilitlenmiştir. Atanan hakem her iki tarafın kanıtlarını inceleyerek nihai kararı verecektir.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f13' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 },
  loadingText: { fontSize: 16, fontWeight: '600', color: '#e8e8f0' },
  errorTitle: { fontSize: 24, fontWeight: '800', color: '#ff4d6d' },
  errorSub: { fontSize: 14, color: '#6b6b85', textAlign: 'center', lineHeight: 20 },
  backBtnBox: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#2a2a38', borderRadius: 8 },
  backBtnText: { fontSize: 14, fontWeight: '700', color: '#e8e8f0' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a38',
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { fontSize: 15, fontWeight: '600', color: '#e8e8f0' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  statusBadgeText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 60 },
  section: { paddingHorizontal: 20, paddingTop: 24, gap: 12 },
  title: { fontSize: 24, fontWeight: '800', color: '#e8e8f0', lineHeight: 30 },
  description: { fontSize: 14, color: '#6b6b85', lineHeight: 22 },
  escrowCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#2a2a38',
    borderRadius: 16,
    padding: 20,
    gap: 20,
  },
  escrowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  escrowLeft: { gap: 4 },
  escrowLabel: { fontSize: 11, fontWeight: '700', color: '#6b6b85', letterSpacing: 1 },
  escrowAmount: { fontSize: 28, fontWeight: '900', color: '#6c63ff' },
  actionRow: { flexDirection: 'row', gap: 12 },
  btnPrimary: {
    flex: 1,
    height: 50,
    backgroundColor: '#6c63ff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: { fontSize: 15, fontWeight: '700', color: '#e8e8f0' },
  btnDestructiveOutline: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ff4d6d',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  btnDestructiveOutlineText: { fontSize: 15, fontWeight: '700', color: '#ff4d6d' },
  btnDisabled: { opacity: 0.5 },
  takeJobCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: 'rgba(108,99,255,0.15)',
    borderWidth: 1,
    borderColor: '#6c63ff',
    borderRadius: 16,
    padding: 20,
  },
  takeJobTitle: { fontSize: 18, fontWeight: '800', color: '#6c63ff', marginBottom: 6 },
  takeJobDesc: { fontSize: 13, color: '#e8e8f0', lineHeight: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#6b6b85', letterSpacing: 1.5 },
  partiesGrid: { flexDirection: 'row', flexWrap: 'wrap', borderWidth: 1, borderColor: '#2a2a38', borderRadius: 12, overflow: 'hidden' },
  partyItem: { width: '50%', padding: 16, backgroundColor: '#1a1a24', borderWidth: 0.5, borderColor: '#2a2a38', gap: 6 },
  partyLabel: { fontSize: 10, fontWeight: '700', color: '#6b6b85', letterSpacing: 1 },
  partyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  partyValue: { fontSize: 13, fontWeight: '700', color: '#e8e8f0' },
  meBadge: { backgroundColor: 'rgba(74,222,128,0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  meBadgeText: { fontSize: 10, fontWeight: '700', color: '#4ade80' },
  milestoneCard: { backgroundColor: '#1a1a24', borderWidth: 1, borderColor: '#2a2a38', borderRadius: 14, padding: 18, gap: 12 },
  milestonePaid: { borderColor: 'rgba(74,222,128,0.4)', backgroundColor: 'rgba(74,222,128,0.05)' },
  msTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  msLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  msTitle: { fontSize: 15, fontWeight: '700', color: '#e8e8f0', flex: 1 },
  msAmount: { fontSize: 16, fontWeight: '800', color: '#6c63ff' },
  msMetaRow: { flexDirection: 'row' },
  msBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  msBadgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  proofLink: { fontSize: 13, color: '#4FC3F7', marginTop: 4 },
  proofNotes: { fontSize: 13, fontStyle: 'italic', color: '#6b6b85', marginTop: 2 },
  msActions: { paddingTop: 12, borderTopWidth: 1, borderTopColor: '#2a2a38', gap: 12 },
  btnOutline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 44, borderWidth: 1, borderColor: '#2a2a38', borderRadius: 10 },
  btnOutlineText: { fontSize: 14, fontWeight: '700', color: '#e8e8f0' },
  inlineForm: { gap: 10, padding: 14, backgroundColor: '#0f0f13', borderRadius: 12, borderWidth: 1, borderColor: '#2a2a38' },
  inlineInput: { backgroundColor: '#1a1a24', borderWidth: 1, borderColor: '#2a2a38', borderRadius: 8, padding: 12, color: '#e8e8f0', fontSize: 13 },
  btnRow: { flexDirection: 'row', gap: 12 },
  btnSuccess: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, backgroundColor: '#4ade80', borderRadius: 12 },
  btnSuccessText: { fontSize: 14, fontWeight: '800', color: '#0f0f13' },
  btnDestructive: { height: 48, backgroundColor: '#ff4d6d', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnDestructiveText: { fontSize: 14, fontWeight: '700', color: '#e8e8f0' },
  input: { backgroundColor: '#1a1a24', borderWidth: 1, borderColor: '#2a2a38', borderRadius: 8, padding: 14, color: '#e8e8f0', fontSize: 14 },
  chatContainer: { backgroundColor: '#1a1a24', borderWidth: 1, borderColor: '#2a2a38', borderRadius: 14, padding: 16, minHeight: 200, gap: 12 },
  emptyChat: { fontSize: 13, color: '#6b6b85', textAlign: 'center', marginTop: 40 },
  msgRow: { flexDirection: 'row', justifyContent: 'flex-start' },
  msgRowMe: { justifyContent: 'flex-end' },
  msgBubble: { backgroundColor: '#2a2a38', borderRadius: 12, padding: 12, maxWidth: '80%', gap: 4 },
  msgBubbleMe: { backgroundColor: 'rgba(108,99,255,0.2)', borderWidth: 1, borderColor: '#6c63ff' },
  msgSender: { fontSize: 11, fontWeight: '700', color: '#6c63ff' },
  msgContent: { fontSize: 14, color: '#e8e8f0', lineHeight: 20 },
  msgTime: { fontSize: 10, color: '#6b6b85', alignSelf: 'flex-end' },
  chatInputRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  chatInput: { flex: 1, backgroundColor: '#1a1a24', borderWidth: 1, borderColor: '#2a2a38', borderRadius: 12, paddingHorizontal: 16, height: 50, color: '#e8e8f0', fontSize: 14 },
  sendBtn: { width: 50, height: 50, backgroundColor: '#6c63ff', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  disputeSection: { marginHorizontal: 20, marginTop: 20, marginBottom: 40 },
  disputeBox: { backgroundColor: '#1a1a24', borderWidth: 1, borderColor: '#ff4d6d', borderRadius: 16, padding: 20, gap: 16 },
  disputeTitle: { fontSize: 16, fontWeight: '800', color: '#ff4d6d' },
  disputeActiveCard: { marginHorizontal: 20, marginTop: 20, marginBottom: 40, backgroundColor: 'rgba(251,191,36,0.15)', borderWidth: 1, borderColor: '#fbbf24', borderRadius: 16, padding: 20, alignItems: 'center', gap: 10 },
  disputeActiveTitle: { fontSize: 18, fontWeight: '800', color: '#fbbf24' },
  disputeActiveDesc: { fontSize: 13, color: '#e8e8f0', textAlign: 'center', lineHeight: 20 },
});
