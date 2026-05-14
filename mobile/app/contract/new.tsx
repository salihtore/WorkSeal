/**
 * New Contract screen — mirrors frontend contracts/new/page.tsx
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Plus, Trash2, ChevronLeft } from 'lucide-react-native';
import { useWalletStore } from '@/lib/wallet-store';
import { useWorkSealTx } from '@/hooks/useWorkSealTx';
import AppBackground from '@/components/AppBackground';
import Input, { Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { suiToMist, mistToSui } from '@/types';
import { COLORS, FONTS, SPACING } from '@/constants/theme';

interface MilestoneInput {
  title: string;
  amount: string; // SUI as string
}

export default function NewContractScreen() {
  const { address } = useWalletStore();
  const { createContract } = useWorkSealTx();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    client: address || '',
    deadlineDays: '30',
  });

  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    { title: '', amount: '' },
  ]);

  const totalBudget = useMemo(() => {
    return milestones.reduce((acc, m) => {
      const num = parseFloat(m.amount) || 0;
      return acc + num;
    }, 0);
  }, [milestones]);

  const addMilestone = () => {
    setMilestones((prev) => [...prev, { title: '', amount: '' }]);
  };

  const removeMilestone = (index: number) => {
    setMilestones((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: keyof MilestoneInput, value: string) => {
    setMilestones((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      Alert.alert('Hata', 'İş başlığı gereklidir.');
      return;
    }
    if (!form.client.trim() || !form.client.startsWith('0x')) {
      Alert.alert('Hata', 'Geçerli bir müşteri adresi giriniz.');
      return;
    }
    if (milestones.some((m) => !m.title.trim() || !m.amount)) {
      Alert.alert('Hata', 'Tüm milestone başlıkları ve tutarları doldurulmalıdır.');
      return;
    }

    try {
      setIsSubmitting(true);
      const deadlineMs = Date.now() + parseInt(form.deadlineDays) * 24 * 60 * 60 * 1000;
      await createContract({
        title: form.title,
        description: form.description,
        client: form.client,
        deadline_ms: deadlineMs,
        milestone_titles: milestones.map((m) => m.title),
        milestone_amounts: milestones.map((m) => suiToMist(parseFloat(m.amount) || 0)),
      });
      Alert.alert(
        'Başarılı!',
        'İşlem Slush Wallet\'ta imzalandı. Sözleşme blockchain\'e gönderiliyor.',
        [{ text: 'Tamam', onPress: () => router.push('/(app)/contracts') }]
      );
    } catch (err: any) {
      if (err.message !== 'Wallet not connected') {
        Alert.alert('Hata', err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppBackground />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <ChevronLeft size={16} color={COLORS.foreground} />
            <Text style={styles.backBtnText}>Geri</Text>
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.headerLabel}>YENİ SÖZLEŞME</Text>
            <Text style={styles.title}>İş İlanı Oluştur</Text>
            <Text style={styles.subtitle}>
              Sözleşme detaylarını doldurun ve Sui blockchain'e yayınlayın.
            </Text>
          </View>
        </View>

        {/* Contract Info */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>SÖZLEŞME BİLGİLERİ</Text>

          <Input
            label="İş Başlığı"
            value={form.title}
            onChangeText={(v) => setForm((p) => ({ ...p, title: v }))}
            placeholder="Örn: Web3 Dashboard Geliştirme"
          />

          <Textarea
            label="Açıklama"
            value={form.description}
            onChangeText={(v) => setForm((p) => ({ ...p, description: v }))}
            placeholder="İş kapsamını, gereksinimlerini ve beklentilerini detaylıca açıklayın..."
            rows={5}
          />

          <Input
            label="Müşteri Cüzdan Adresi"
            value={form.client}
            onChangeText={(v) => setForm((p) => ({ ...p, client: v }))}
            placeholder="0x..."
            mono
          />

          <Input
            label="Teslim Süresi (Gün)"
            value={form.deadlineDays}
            onChangeText={(v) => setForm((p) => ({ ...p, deadlineDays: v }))}
            keyboardType="numeric"
            placeholder="30"
          />
        </View>

        {/* Milestones */}
        <View style={styles.formSection}>
          <View style={styles.milestoneHeader}>
            <Text style={styles.sectionTitle}>MİLESTONE'LAR</Text>
            <TouchableOpacity style={styles.addBtn} onPress={addMilestone}>
              <Plus size={14} color={COLORS.primaryForeground} />
              <Text style={styles.addBtnText}>Ekle</Text>
            </TouchableOpacity>
          </View>

          {milestones.map((ms, i) => (
            <View key={i} style={styles.milestoneCard}>
              <View style={styles.milestoneTopRow}>
                <Text style={styles.milestoneNum}>{String(i + 1).padStart(2, '0')}</Text>
                {milestones.length > 1 && (
                  <TouchableOpacity onPress={() => removeMilestone(i)}>
                    <Trash2 size={14} color={COLORS.destructive} />
                  </TouchableOpacity>
                )}
              </View>

              <Input
                value={ms.title}
                onChangeText={(v) => updateMilestone(i, 'title', v)}
                placeholder="Milestone adı"
                containerStyle={{ marginBottom: 8 }}
              />

              <Input
                value={ms.amount}
                onChangeText={(v) => updateMilestone(i, 'amount', v)}
                placeholder="0.00 SUI"
                keyboardType="decimal-pad"
              />
            </View>
          ))}

          {/* Total */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Toplam Bütçe</Text>
            <Text style={styles.totalValue}>
              {totalBudget.toFixed(2)} SUI
            </Text>
          </View>
        </View>

        {/* Submit */}
        <View style={styles.submitSection}>
          <Button
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            fullWidth
            size="lg"
          >
            {isSubmitting ? 'Slush Wallet Açılıyor...' : 'Sözleşmeyi Oluştur'}
          </Button>
          <Text style={styles.submitNote}>
            Oluştur butonuna bastığınızda Slush Wallet açılacak ve işlemi onaylamanız gerekecek.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 60 },
  header: {
    paddingHorizontal: SPACING['2xl'],
    paddingTop: 56,
    paddingBottom: SPACING['2xl'],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 20,
  },
  backBtnText: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    color: COLORS.foreground,
  },
  headerInfo: { gap: 8 },
  headerLabel: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    color: 'rgba(79,195,247,0.6)',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: FONTS.sans,
    fontSize: 30,
    fontWeight: '900',
    color: COLORS.foreground,
    letterSpacing: -1,
    lineHeight: 34,
  },
  subtitle: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    color: COLORS.mutedForeground,
    lineHeight: 18,
  },
  formSection: {
    padding: SPACING['2xl'],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 16,
  },
  sectionTitle: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addBtnText: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryForeground,
  },
  milestoneCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.base,
    gap: 8,
  },
  milestoneTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  milestoneNum: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    color: COLORS.mutedForeground,
    fontWeight: '700',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalLabel: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  totalValue: {
    fontFamily: FONTS.mono,
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
  },
  submitSection: {
    padding: SPACING['2xl'],
    gap: 12,
  },
  submitNote: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    color: COLORS.mutedForeground,
    textAlign: 'center',
    lineHeight: 14,
  },
});
