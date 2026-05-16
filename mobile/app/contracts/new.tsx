import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus, Trash2, ChevronLeft, ChevronRight, CheckCircle2, Shield, FileText, AlertCircle } from 'lucide-react-native';
import { useWalletStore } from '@/lib/wallet-store';
import { useTransaction } from '@/hooks/use-transaction';
import AppBackground from '@/components/AppBackground';
import { suiToMist } from '@/types';

interface MilestoneItem {
  title: string;
  amount: string;
  deadline: string;
}

const STEPS = ["Temel Bilgiler", "Maddeler", "Ödeme Özeti", "Önizleme"];

export default function NewContractScreen() {
  const { address } = useWalletStore();
  const { createContract, isPending } = useTransaction();

  const [step, setStep] = useState(0);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadlineDays, setDeadlineDays] = useState('30');
  const [identityPreference, setIdentityPreference] = useState<'any' | 'verified' | 'anonymous'>('any');

  const [milestones, setMilestones] = useState<MilestoneItem[]>([
    { title: '', amount: '', deadline: '30' },
  ]);

  const totalSuiStr = useMemo(() => {
    const sum = milestones.reduce((acc, curr) => {
      const val = parseFloat(curr.amount) || 0;
      return acc + val;
    }, 0);
    return sum.toFixed(4);
  }, [milestones]);

  const addMilestone = () => {
    setMilestones((prev) => [...prev, { title: '', amount: '', deadline: '30' }]);
  };

  const removeMilestone = (index: number) => {
    if (milestones.length <= 1) {
      Alert.alert('Hata', 'En az 1 adet aşama (milestone) bulunmalıdır.');
      return;
    }
    setMilestones((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: keyof MilestoneItem, val: string) => {
    setMilestones((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: val } : m))
    );
  };

  const handleNextStep = () => {
    if (step === 0) {
      if (!title.trim() || title.length < 5) {
        Alert.alert('Eksik Bilgi', 'Lütfen en az 5 karakterlik bir başlık girin.');
        return;
      }
      if (!description.trim() || description.length < 10) {
        Alert.alert('Eksik Bilgi', 'Lütfen en az 10 karakterlik bir iş tanımı girin.');
        return;
      }
      const days = parseInt(deadlineDays, 10);
      if (isNaN(days) || days <= 0) {
        Alert.alert('Hatalı Süre', 'Lütfen geçerli bir teslim süresi (gün) girin.');
        return;
      }
    } else if (step === 1) {
      for (let i = 0; i < milestones.length; i++) {
        const ms = milestones[i];
        if (!ms.title.trim()) {
          Alert.alert('Eksik Bilgi', `${i + 1}. aşama başlığını doldurun.`);
          return;
        }
        const num = parseFloat(ms.amount);
        if (isNaN(num) || num <= 0) {
          Alert.alert('Hatalı Tutar', `${i + 1}. aşama için geçerli bir SUI tutarı girin (Sıfırdan büyük olmalı).`);
          return;
        }
      }
    }
    setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleSubmit = async () => {
    if (!address) {
      Alert.alert('Bağlantı Hatası', 'Lütfen önce Google ZkLogin ile oturum açın.');
      return;
    }

    const days = parseInt(deadlineDays, 10);
    const deadline_ms = Date.now() + days * 86400000;
    const milestone_titles = milestones.map((m) => m.title);
    const milestone_amounts = milestones.map((m) => suiToMist(parseFloat(m.amount)));

    try {
      await createContract({
        title,
        description,
        client: address,
        deadline_ms,
        milestone_titles,
        milestone_amounts,
      });

      Alert.alert('Tebrikler!', 'Sözleşmeniz ZkLogin ile imzalanarak Sui Blockchain ağına başarıyla kaydedildi.', [
        { text: 'Tamam', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      console.error('[NewContract] İşlem Hatası:', err);
      Alert.alert('İşlem Başarısız', err.message || 'Sözleşme oluşturulurken hata oluştu.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AppBackground />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} disabled={isPending}>
            <ChevronLeft size={20} color="#e8e8f0" />
            <Text style={styles.backText}>Geri</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Yeni Sözleşme</Text>
          <View style={{ width: 48 }} />
        </View>

        {/* Adım Göstergesi Barı */}
        <View style={styles.stepsBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stepsScroll}>
            {STEPS.map((s, i) => {
              const isActive = i === step;
              const isPast = i < step;
              return (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.stepBadge,
                    isActive && styles.stepBadgeActive,
                    isPast && styles.stepBadgePast,
                  ]}
                  onPress={() => i <= step && setStep(i)}
                  disabled={i > step || isPending}
                >
                  {isPast ? <CheckCircle2 size={14} color="#10b981" /> : <Text style={[styles.stepNum, isActive && styles.stepNumActive]}>{i + 1}</Text>}
                  <Text style={[styles.stepText, isActive && styles.stepTextActive, isPast && styles.stepTextPast]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Adım 0: Temel Bilgiler */}
          {step === 0 && (
            <View style={styles.stepContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>SÖZLEŞME DETAYLARI</Text>
                <Text style={styles.sectionSub}>İşin kapsamını ve genel teslimat kurallarını belirleyin.</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Sözleşme Başlığı *</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Örn: E-ticaret Web Sitesi Geliştirme"
                  placeholderTextColor="#6b6b85"
                  editable={!isPending}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>İş Tanımı *</Text>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="İşin kapsamını, teslim edilecekleri ve beklentileri açıklayın..."
                  placeholderTextColor="#6b6b85"
                  multiline
                  numberOfLines={4}
                  editable={!isPending}
                />
              </View>

              <View style={styles.gridRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Teslim Süresi (Gün) *</Text>
                  <TextInput
                    style={styles.input}
                    value={deadlineDays}
                    onChangeText={setDeadlineDays}
                    placeholder="30"
                    placeholderTextColor="#6b6b85"
                    keyboardType="number-pad"
                    editable={!isPending}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Müşteri Kimlik Tercihi</Text>
                <View style={styles.identityRow}>
                  {[
                    { val: 'any', label: 'Farketmez' },
                    { val: 'verified', label: 'Doğrulanmış' },
                    { val: 'anonymous', label: 'Anonim' },
                  ].map((item) => {
                    const isSelected = identityPreference === item.val;
                    return (
                      <TouchableOpacity
                        key={item.val}
                        style={[styles.identityBtn, isSelected && styles.identityBtnSelected]}
                        onPress={() => setIdentityPreference(item.val as any)}
                        disabled={isPending}
                      >
                        <Text style={[styles.identityBtnText, isSelected && styles.identityBtnTextSelected]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          )}

          {/* Adım 1: Maddeler (Milestones) */}
          {step === 1 && (
            <View style={styles.stepContainer}>
              <View style={styles.milestoneHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>MİLESTONE'LAR (AŞAMALAR)</Text>
                  <Text style={styles.sectionSub}>İşi parçalara bölerek güvenli ödeme akışı oluşturun.</Text>
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={addMilestone} disabled={isPending}>
                  <Plus size={16} color="#6c63ff" />
                  <Text style={styles.addBtnText}>Aşama Ekle</Text>
                </TouchableOpacity>
              </View>

              {milestones.map((ms, index) => (
                <View key={index} style={styles.milestoneCard}>
                  <View style={styles.milestoneTop}>
                    <View style={styles.milestoneBadge}>
                      <Text style={styles.milestoneBadgeText}>Aşama #{index + 1}</Text>
                    </View>
                    {milestones.length > 1 && (
                      <TouchableOpacity onPress={() => removeMilestone(index)} disabled={isPending}>
                        <Trash2 size={18} color="#ff4d6d" />
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Teslimat Başlığı</Text>
                    <TextInput
                      style={styles.input}
                      value={ms.title}
                      onChangeText={(val) => updateMilestone(index, 'title', val)}
                      placeholder="Örn: Arayüz ve Tasarım Onayı"
                      placeholderTextColor="#6b6b85"
                      editable={!isPending}
                    />
                  </View>

                  <View style={styles.gridRow}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.label}>Tutar (SUI)</Text>
                      <TextInput
                        style={styles.input}
                        value={ms.amount}
                        onChangeText={(val) => updateMilestone(index, 'amount', val)}
                        placeholder="10.5"
                        placeholderTextColor="#6b6b85"
                        keyboardType="decimal-pad"
                        editable={!isPending}
                      />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.label}>Süre (Gün)</Text>
                      <TextInput
                        style={styles.input}
                        value={ms.deadline}
                        onChangeText={(val) => updateMilestone(index, 'deadline', val)}
                        placeholder="30"
                        placeholderTextColor="#6b6b85"
                        keyboardType="number-pad"
                        editable={!isPending}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Adım 2: Ödeme Özeti */}
          {step === 2 && (
            <View style={styles.stepContainer}>
              <View style={styles.summaryTopCard}>
                <Text style={styles.summarySub}>Akıllı Sözleşmeye Kilitlenecek Toplam Tutar</Text>
                <Text style={styles.summaryTotal}>{parseFloat(totalSuiStr) > 0 ? totalSuiStr : "0.0000"} <Text style={styles.summaryUnit}>SUI</Text></Text>
              </View>

              <View style={styles.escrowBox}>
                <View style={styles.escrowBoxHeader}>
                  <View style={styles.escrowShield}>
                    <Shield size={20} color="#10b981" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.escrowTitle}>Sui Escrow Koruması Aktif</Text>
                    <Text style={styles.escrowDesc}>İş kanıtı sunulmadan bu bütçeye dokunulamaz.</Text>
                  </View>
                </View>

                <View style={styles.milestoneList}>
                  {milestones.map((m, i) => m.title ? (
                    <View key={i} style={styles.milestoneListItem}>
                      <Text style={styles.msListItemText} numberOfLines={1}>#{i + 1} {m.title}</Text>
                      <Text style={styles.msListItemVal}>{m.amount || "0"} SUI</Text>
                    </View>
                  ) : null)}
                </View>
              </View>
            </View>
          )}

          {/* Adım 3: Önizleme */}
          {step === 3 && (
            <View style={styles.stepContainer}>
              <View style={styles.previewTop}>
                <View style={styles.previewIcon}>
                  <FileText size={24} color="#6c63ff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.previewTitle}>{title || "İsimsiz Sözleşme"}</Text>
                  <View style={styles.liveBadgeRow}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>Taslak Oluşturuldu</Text>
                  </View>
                </View>
              </View>

              <View style={styles.previewGrid}>
                <View style={styles.previewBox}>
                  <Text style={styles.previewBoxLabel}>Müşteri Cüzdanı</Text>
                  <Text style={styles.previewBoxVal} numberOfLines={1} ellipsizeMode="middle">{address || "Bağlı Cüzdan Yok"}</Text>
                </View>
                <View style={styles.previewBox}>
                  <Text style={styles.previewBoxLabel}>Teslim Süresi</Text>
                  <Text style={styles.previewBoxVal}>{deadlineDays} Gün</Text>
                </View>
              </View>

              <View style={styles.msSummarySection}>
                <Text style={styles.msSummaryTitle}>Aşama Özeti</Text>
                {milestones.map((m, i) => (
                  <View key={i} style={styles.msSummaryRow}>
                    <Text style={styles.msSummaryName} numberOfLines={1}>{m.title || `Aşama #${i + 1}`}</Text>
                    <View style={styles.msSummaryBadge}>
                      <Text style={styles.msSummaryBadgeVal}>{m.amount || "0"} SUI</Text>
                    </View>
                  </View>
                ))}
              </View>

              <View style={styles.alertBox}>
                <AlertCircle size={20} color="#6c63ff" />
                <Text style={styles.alertBoxText}>
                  Sözleşmeyi gönderdiğinde ZkLogin oturumun ile imza atman gerekecektir. Sözleşme blockchain'e kaydedildikten sonra müşteri tarafından fonlanması beklenecektir.
                </Text>
              </View>
            </View>
          )}

          {/* Navigasyon Butonları */}
          <View style={styles.navButtonsRow}>
            <TouchableOpacity
              style={[styles.navBtn, styles.navBtnBack, (step === 0 || isPending) && styles.navBtnDisabled]}
              onPress={() => step > 0 && setStep(step - 1)}
              disabled={step === 0 || isPending}
            >
              <ChevronLeft size={16} color="#a0a0b8" />
              <Text style={styles.navBtnBackText}>Geri</Text>
            </TouchableOpacity>

            {step < STEPS.length - 1 ? (
              <TouchableOpacity style={[styles.navBtn, styles.navBtnNext]} onPress={handleNextStep}>
                <Text style={styles.navBtnNextText}>İleri</Text>
                <ChevronRight size={16} color="#ffffff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.navBtn, styles.submitBtnFinal, isPending && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={isPending}
              >
                {isPending ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <Text style={styles.submitBtnFinalText}>Sözleşmeyi İmzala & Gönder</Text>
                    <CheckCircle2 size={18} color="#ffffff" />
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f13' },
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#e8e8f0' },
  stepsBar: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a24',
    backgroundColor: '#14141d',
  },
  stepsScroll: { paddingHorizontal: 20, gap: 10 },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#2a2a38',
  },
  stepBadgeActive: {
    backgroundColor: '#6c63ff',
    borderColor: '#8b85ff',
  },
  stepBadgePast: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderColor: 'rgba(16,185,129,0.3)',
  },
  stepNum: { fontSize: 12, fontWeight: '700', color: '#a0a0b8' },
  stepNumActive: { color: '#ffffff' },
  stepText: { fontSize: 13, fontWeight: '600', color: '#a0a0b8' },
  stepTextActive: { color: '#ffffff', fontWeight: '700' },
  stepTextPast: { color: '#10b981' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  stepContainer: { gap: 20 },
  sectionHeader: { gap: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#e8e8f0', letterSpacing: 0.5 },
  sectionSub: { fontSize: 13, color: '#a0a0b8' },
  inputGroup: { gap: 8 },
  label: { fontSize: 13, fontWeight: '600', color: '#e8e8f0' },
  input: {
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#2a2a38',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#e8e8f0',
    fontSize: 14,
  },
  textarea: { height: 110, textAlignVertical: 'top' },
  gridRow: { flexDirection: 'row', gap: 16 },
  identityRow: { flexDirection: 'row', gap: 10 },
  identityBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a38',
    backgroundColor: '#1a1a24',
    alignItems: 'center',
  },
  identityBtnSelected: {
    borderColor: '#6c63ff',
    backgroundColor: 'rgba(108,99,255,0.15)',
  },
  identityBtnText: { fontSize: 13, fontWeight: '600', color: '#a0a0b8' },
  identityBtnTextSelected: { color: '#6c63ff', fontWeight: '700' },
  milestoneHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6c63ff',
    backgroundColor: 'rgba(108,99,255,0.1)',
  },
  addBtnText: { fontSize: 13, fontWeight: '700', color: '#6c63ff' },
  milestoneCard: {
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#2a2a38',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  milestoneTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  milestoneBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#2a2a38',
  },
  milestoneBadgeText: { fontSize: 12, fontWeight: '700', color: '#a0a0b8' },
  summaryTopCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#6c63ff',
  },
  summarySub: { fontSize: 13, color: '#a0a0b8', marginBottom: 8 },
  summaryTotal: { fontSize: 36, fontWeight: '900', color: '#e8e8f0', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  summaryUnit: { fontSize: 20, color: '#6c63ff', fontWeight: '700' },
  escrowBox: {
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#2a2a38',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  escrowBoxHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: '#2a2a38', paddingBottom: 16 },
  escrowShield: { padding: 10, borderRadius: 12, backgroundColor: 'rgba(16,185,129,0.1)' },
  escrowTitle: { fontSize: 15, fontWeight: '700', color: '#e8e8f0' },
  escrowDesc: { fontSize: 12, color: '#a0a0b8', marginTop: 2 },
  milestoneList: { gap: 10 },
  milestoneListItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: '#14141d', borderRadius: 10 },
  msListItemText: { fontSize: 14, color: '#a0a0b8', flex: 1, marginRight: 12 },
  msListItemVal: { fontSize: 14, fontWeight: '700', color: '#e8e8f0', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  previewTop: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#1a1a24', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#2a2a38' },
  previewIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(108,99,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#6c63ff' },
  previewTitle: { fontSize: 18, fontWeight: '800', color: '#e8e8f0' },
  liveBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' },
  liveText: { fontSize: 12, fontWeight: '600', color: '#10b981' },
  previewGrid: { flexDirection: 'row', gap: 16 },
  previewBox: { flex: 1, padding: 16, backgroundColor: '#1a1a24', borderRadius: 16, borderWidth: 1, borderColor: '#2a2a38' },
  previewBoxLabel: { fontSize: 12, fontWeight: '600', color: '#a0a0b8', marginBottom: 4 },
  previewBoxVal: { fontSize: 14, fontWeight: '700', color: '#e8e8f0', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  msSummarySection: { gap: 12, backgroundColor: '#1a1a24', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#2a2a38' },
  msSummaryTitle: { fontSize: 15, fontWeight: '700', color: '#e8e8f0', marginBottom: 4 },
  msSummaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#2a2a38' },
  msSummaryName: { fontSize: 14, color: '#a0a0b8', flex: 1, marginRight: 12 },
  msSummaryBadge: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#2a2a38', borderRadius: 8 },
  msSummaryBadgeVal: { fontSize: 13, fontWeight: '700', color: '#e8e8f0', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  alertBox: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'rgba(108,99,255,0.1)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(108,99,255,0.3)' },
  alertBoxText: { fontSize: 12, color: '#d0d0e8', flex: 1, lineHeight: 18 },
  navButtonsRow: { flexDirection: 'row', gap: 16, marginTop: 32, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#2a2a38' },
  navBtn: { height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  navBtnBack: { flex: 1, backgroundColor: '#1a1a24', borderWidth: 1, borderColor: '#2a2a38' },
  navBtnBackText: { fontSize: 15, fontWeight: '600', color: '#a0a0b8' },
  navBtnDisabled: { opacity: 0.5 },
  navBtnNext: { flex: 2, backgroundColor: '#6c63ff' },
  navBtnNextText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  submitBtnFinal: { flex: 2, backgroundColor: '#10b981', shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  submitBtnFinalText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  submitBtnDisabled: { opacity: 0.5 },
});
