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
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Shield,
  FileText,
  AlertCircle,
  Calendar,
} from 'lucide-react-native';
import { useWalletStore } from '@/lib/wallet-store';
import { useTransaction } from '@/hooks/use-transaction';
import AppBackground from '@/components/AppBackground';
import { suiToMist } from '@/types';
import { COLORS, FONTS } from '@/constants/theme';

interface MilestoneItem {
  title: string;
  amount: string;
  deadlineDate: Date;
}

const STEPS = ["Temel Bilgiler", "Maddeler", "Ödeme Özeti", "Önizleme"];

export default function NewContractScreen() {
  const { address } = useWalletStore();
  const { createContract, isPending } = useTransaction();

  const [step, setStep] = useState(0);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [identityPreference, setIdentityPreference] = useState<'any' | 'verified' | 'anonymous'>('any');

  // Ana Sözleşme Teslim Tarihi State
  const [deadlineDate, setDeadlineDate] = useState<Date>(new Date(Date.now() + 30 * 86400000));
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);

  // Milestone Aşamaları
  const [milestones, setMilestones] = useState<MilestoneItem[]>([
    { title: '', amount: '', deadlineDate: new Date(Date.now() + 30 * 86400000) },
  ]);
  const [activeMilestonePicker, setActiveMilestonePicker] = useState<number | null>(null);

  const totalSuiStr = useMemo(() => {
    const sum = milestones.reduce((acc, curr) => {
      const val = parseFloat(curr.amount) || 0;
      return acc + val;
    }, 0);
    return sum.toFixed(4);
  }, [milestones]);

  const addMilestone = () => {
    setMilestones((prev) => [
      ...prev,
      { title: '', amount: '', deadlineDate: new Date(Date.now() + 30 * 86400000) },
    ]);
  };

  const removeMilestone = (index: number) => {
    if (milestones.length <= 1) {
      Alert.alert('Hata', 'En az 1 adet aşama (milestone) bulunmalıdır.');
      return;
    }
    setMilestones((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: keyof MilestoneItem, val: any) => {
    setMilestones((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: val } : m))
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysDifference = (targetDate: Date) => {
    const diffTime = targetDate.getTime() - Date.now();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
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
      if (getDaysDifference(deadlineDate) <= 0) {
        Alert.alert('Hatalı Tarih', 'Lütfen gelecekteki bir teslimat tarihi seçin.');
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
        if (getDaysDifference(ms.deadlineDate) <= 0) {
          Alert.alert('Hatalı Tarih', `${i + 1}. aşama için gelecekteki bir teslim tarihi seçin.`);
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

    const deadline_ms = deadlineDate.getTime();
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
                  {isPast ? <CheckCircle2 size={14} color={COLORS.emerald} /> : <Text style={[styles.stepNum, isActive && styles.stepNumActive]}>{i + 1}</Text>}
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
                <Text style={styles.sectionSub}>Projenizin genel tanımını ve mutabakat koşullarını eksiksiz tanımlayın.</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Sözleşme Başlığı *</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Örn: E-ticaret Web Sitesi Geliştirme"
                  placeholderTextColor={COLORS.mutedForeground}
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
                  placeholderTextColor={COLORS.mutedForeground}
                  multiline
                  numberOfLines={4}
                  editable={!isPending}
                />
              </View>

              {/* Takvimden Tarih Seçimi */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Son Teslim Tarihi *</Text>
                <TouchableOpacity
                  style={styles.datePickerBtn}
                  onPress={() => setShowDeadlinePicker(true)}
                  disabled={isPending}
                >
                  <Calendar size={18} color={COLORS.primary} />
                  <Text style={styles.datePickerText}>
                    {formatDate(deadlineDate)} <Text style={styles.daysDiffText}>({getDaysDifference(deadlineDate)} Gün)</Text>
                  </Text>
                </TouchableOpacity>
                {showDeadlinePicker && (
                  <DateTimePicker
                    value={deadlineDate}
                    mode="date"
                    display="default"
                    minimumDate={new Date()}
                    onChange={(event, selectedDate) => {
                      setShowDeadlinePicker(false);
                      if (selectedDate) setDeadlineDate(selectedDate);
                    }}
                  />
                )}
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
                  <Text style={styles.sectionSub}>Proje aşamalarını belirleyerek on-chain ödeme kilometre taşları oluşturun.</Text>
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={addMilestone} disabled={isPending}>
                  <Plus size={16} color={COLORS.primary} />
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
                        <Trash2 size={18} color={COLORS.red} />
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
                      placeholderTextColor={COLORS.mutedForeground}
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
                        placeholderTextColor={COLORS.mutedForeground}
                        keyboardType="decimal-pad"
                        editable={!isPending}
                      />
                    </View>

                    {/* Milestone Takvim Seçimi */}
                    <View style={[styles.inputGroup, { flex: 1.2 }]}>
                      <Text style={styles.label}>Hedef Tarih</Text>
                      <TouchableOpacity
                        style={styles.msDatePickerBtn}
                        onPress={() => setActiveMilestonePicker(index)}
                        disabled={isPending}
                      >
                        <Calendar size={15} color={COLORS.primary} />
                        <Text style={styles.msDatePickerText} numberOfLines={1}>
                          {formatDate(ms.deadlineDate)}
                        </Text>
                      </TouchableOpacity>
                      {activeMilestonePicker === index && (
                        <DateTimePicker
                          value={ms.deadlineDate}
                          mode="date"
                          display="default"
                          minimumDate={new Date()}
                          onChange={(event, selectedDate) => {
                            setActiveMilestonePicker(null);
                            if (selectedDate) updateMilestone(index, 'deadlineDate', selectedDate);
                          }}
                        />
                      )}
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
                    <Shield size={20} color={COLORS.emerald} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.escrowTitle}>Sui Escrow Koruması Aktif</Text>
                    <Text style={styles.escrowDesc}>Akıllı sözleşme şartları yerine getirilip onaylanmadan kilitli varlıklar transfer edilemez.</Text>
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
                  <FileText size={24} color={COLORS.primary} />
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
                  <Text style={styles.previewBoxVal}>{formatDate(deadlineDate)} ({getDaysDifference(deadlineDate)} Gün)</Text>
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
                <AlertCircle size={20} color={COLORS.primary} />
                <Text style={styles.alertBoxText}>
                  Bu işlem, akıllı sözleşmeyi ZkLogin kimliğinizle imzalayarak Sui Blockchain üzerine işleyecektir. Yayınlandıktan sonra Escrow havuzunun fonlanması beklenecektir.
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
              <ChevronLeft size={16} color={COLORS.mutedForeground} />
              <Text style={styles.navBtnBackText}>Geri</Text>
            </TouchableOpacity>

            {step < STEPS.length - 1 ? (
              <TouchableOpacity style={[styles.navBtn, styles.navBtnNext]} onPress={handleNextStep}>
                <Text style={styles.navBtnNextText}>İleri</Text>
                <ChevronRight size={16} color={COLORS.primaryForeground} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.navBtn, styles.submitBtnFinal, isPending && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={isPending}
              >
                {isPending ? (
                  <ActivityIndicator color={COLORS.background} size="small" />
                ) : (
                  <>
                    <Text style={styles.submitBtnFinalText}>Sözleşmeyi İmzala & Gönder</Text>
                    <CheckCircle2 size={18} color={COLORS.background} />
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
  container: { flex: 1, backgroundColor: COLORS.background },
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
  headerTitle: { fontFamily: FONTS.sans, fontSize: 18, fontWeight: '900', color: COLORS.foreground },
  stepsBar: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  stepsScroll: { paddingHorizontal: 20, gap: 10 },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 0,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepBadgeActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  stepBadgePast: {
    backgroundColor: COLORS.emeraldBg,
    borderColor: COLORS.emerald,
  },
  stepNum: { fontFamily: FONTS.mono, fontSize: 12, fontWeight: '900', color: COLORS.mutedForeground },
  stepNumActive: { color: COLORS.primaryForeground },
  stepText: { fontFamily: FONTS.sans, fontSize: 13, fontWeight: '600', color: COLORS.mutedForeground },
  stepTextActive: { color: COLORS.primaryForeground, fontWeight: '900' },
  stepTextPast: { color: COLORS.emerald, fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  stepContainer: { gap: 20 },
  sectionHeader: { gap: 4 },
  sectionTitle: { fontFamily: FONTS.mono, fontSize: 14, fontWeight: '900', color: COLORS.foreground, letterSpacing: 0.5 },
  sectionSub: { fontFamily: FONTS.sans, fontSize: 13, color: COLORS.mutedForeground },
  inputGroup: { gap: 8 },
  label: { fontFamily: FONTS.sans, fontSize: 13, fontWeight: '700', color: COLORS.foreground },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: COLORS.foreground,
    fontSize: 14,
    fontFamily: FONTS.sans,
  },
  textarea: { height: 110, textAlignVertical: 'top' },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  datePickerText: { fontFamily: FONTS.sans, fontSize: 14, fontWeight: '700', color: COLORS.foreground },
  daysDiffText: { fontFamily: FONTS.mono, fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  msDatePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  msDatePickerText: { fontFamily: FONTS.sans, fontSize: 13, fontWeight: '600', color: COLORS.foreground, flex: 1 },
  gridRow: { flexDirection: 'row', gap: 16 },
  identityRow: { flexDirection: 'row', gap: 10 },
  identityBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    alignItems: 'center',
  },
  identityBtnSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.blueBg,
  },
  identityBtnText: { fontFamily: FONTS.sans, fontSize: 13, fontWeight: '600', color: COLORS.mutedForeground },
  identityBtnTextSelected: { color: COLORS.primary, fontWeight: '900' },
  milestoneHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.blueBg,
  },
  addBtnText: { fontFamily: FONTS.mono, fontSize: 13, fontWeight: '800', color: COLORS.primary },
  milestoneCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 0,
    padding: 20,
    gap: 16,
  },
  milestoneTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  milestoneBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 0,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  milestoneBadgeText: { fontFamily: FONTS.mono, fontSize: 12, fontWeight: '800', color: COLORS.primary },
  summaryTopCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 0,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  summarySub: { fontFamily: FONTS.sans, fontSize: 13, color: COLORS.mutedForeground, marginBottom: 8 },
  summaryTotal: { fontSize: 36, fontWeight: '900', color: COLORS.primary, fontFamily: FONTS.mono },
  summaryUnit: { fontSize: 20, color: COLORS.foreground, fontWeight: '700' },
  escrowBox: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 0,
    padding: 20,
    gap: 16,
  },
  escrowBoxHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 16 },
  escrowShield: { padding: 10, borderRadius: 0, backgroundColor: COLORS.emeraldBg, borderWidth: 1, borderColor: COLORS.emerald },
  escrowTitle: { fontFamily: FONTS.sans, fontSize: 15, fontWeight: '800', color: COLORS.foreground },
  escrowDesc: { fontFamily: FONTS.sans, fontSize: 12, color: COLORS.mutedForeground, marginTop: 2 },
  milestoneList: { gap: 10 },
  milestoneListItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: COLORS.background, borderRadius: 0, borderWidth: 1, borderColor: COLORS.border },
  msListItemText: { fontFamily: FONTS.sans, fontSize: 14, color: COLORS.foreground, flex: 1, marginRight: 12 },
  msListItemVal: { fontFamily: FONTS.mono, fontSize: 14, fontWeight: '900', color: COLORS.primary },
  previewTop: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: COLORS.card, padding: 20, borderRadius: 0, borderWidth: 1, borderColor: COLORS.border },
  previewIcon: { width: 52, height: 52, borderRadius: 0, backgroundColor: COLORS.blueBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.primary },
  previewTitle: { fontFamily: FONTS.sans, fontSize: 18, fontWeight: '900', color: COLORS.foreground },
  liveBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.emerald },
  liveText: { fontFamily: FONTS.mono, fontSize: 12, fontWeight: '800', color: COLORS.emerald },
  previewGrid: { flexDirection: 'row', gap: 16 },
  previewBox: { flex: 1, padding: 16, backgroundColor: COLORS.card, borderRadius: 0, borderWidth: 1, borderColor: COLORS.border },
  previewBoxLabel: { fontFamily: FONTS.mono, fontSize: 11, fontWeight: '700', color: COLORS.mutedForeground, marginBottom: 4 },
  previewBoxVal: { fontFamily: FONTS.mono, fontSize: 13, fontWeight: '800', color: COLORS.primary },
  msSummarySection: { gap: 12, backgroundColor: COLORS.card, padding: 20, borderRadius: 0, borderWidth: 1, borderColor: COLORS.border },
  msSummaryTitle: { fontFamily: FONTS.mono, fontSize: 14, fontWeight: '800', color: COLORS.foreground, marginBottom: 4 },
  msSummaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  msSummaryName: { fontFamily: FONTS.sans, fontSize: 14, color: COLORS.mutedForeground, flex: 1, marginRight: 12 },
  msSummaryBadge: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: COLORS.background, borderRadius: 0, borderWidth: 1, borderColor: COLORS.border },
  msSummaryBadgeVal: { fontFamily: FONTS.mono, fontSize: 13, fontWeight: '900', color: COLORS.primary },
  alertBox: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: COLORS.blueBg, padding: 16, borderRadius: 0, borderWidth: 1, borderColor: COLORS.primary },
  alertBoxText: { fontFamily: FONTS.sans, fontSize: 12, color: COLORS.foreground, flex: 1, lineHeight: 18 },
  navButtonsRow: { flexDirection: 'row', gap: 16, marginTop: 32, paddingTop: 20, borderTopWidth: 1, borderTopColor: COLORS.border },
  navBtn: { height: 54, borderRadius: 0, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  navBtnBack: { flex: 1, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  navBtnBackText: { fontFamily: FONTS.mono, fontSize: 14, fontWeight: '800', color: COLORS.mutedForeground },
  navBtnDisabled: { opacity: 0.5 },
  navBtnNext: { flex: 2, backgroundColor: COLORS.primary },
  navBtnNextText: { fontFamily: FONTS.mono, fontSize: 14, fontWeight: '900', color: COLORS.primaryForeground },
  submitBtnFinal: { flex: 2, backgroundColor: COLORS.emerald, borderWidth: 1, borderColor: COLORS.emerald },
  submitBtnFinalText: { fontFamily: FONTS.mono, fontSize: 14, fontWeight: '900', color: COLORS.background },
  submitBtnDisabled: { opacity: 0.5 },
});
