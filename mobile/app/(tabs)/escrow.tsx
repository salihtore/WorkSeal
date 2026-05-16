import React, { useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Shield, Plus, FileText, ChevronRight, CheckCircle, Clock } from 'lucide-react-native';
import { useWalletStore } from '@/lib/wallet-store';
import { useContracts } from '@/hooks/use-contracts';
import AppBackground from '@/components/AppBackground';
import { ContractStatus, WorkContract, mistToSui, formatAddress, formatDate } from '@/types';

export default function EscrowTabScreen() {
  const { address } = useWalletStore();
  const { loading, error, fetchAllContracts, getMyContracts } = useContracts(address);
  const [refreshing, setRefreshing] = useState(false);

  const myContracts = getMyContracts();
  const activeContracts = useMemo(() => {
    return myContracts.filter((c) => c.status === ContractStatus.Active || c.status === ContractStatus.Created);
  }, [myContracts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllContracts();
    setRefreshing(false);
  }, [fetchAllContracts]);

  const userAddr = address?.toLowerCase() || '';

  const { totalLocked, totalToReceive, totalToPay } = useMemo(() => {
    let locked = BigInt(0);
    let receive = BigInt(0);
    let pay = BigInt(0);

    activeContracts.forEach((c) => {
      const isClient = c.client.toLowerCase() === userAddr;
      const isFreelancer = c.freelancer !== null && c.freelancer.toLowerCase() === userAddr;

      if (c.status === ContractStatus.Active) {
        locked += c.total_budget;
      }

      c.milestones.forEach((m) => {
        if (m.is_completed && !m.is_paid) {
          if (isFreelancer) receive += m.amount;
          if (isClient) pay += m.amount;
        }
      });
    });

    return {
      totalLocked: mistToSui(locked),
      totalToReceive: mistToSui(receive),
      totalToPay: mistToSui(pay),
    };
  }, [activeContracts, userAddr]);

  if (loading && activeContracts.length === 0) {
    return (
      <View style={styles.center}>
        <AppBackground />
        <ActivityIndicator size="large" color="#6c63ff" />
        <Text style={styles.loadingText}>Escrow Sözleşmeleriniz Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppBackground />

      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Shield size={26} color="#6c63ff" />
          <Text style={styles.headerTitle}>Escrow İşlemlerim</Text>
        </View>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => router.push('/contracts/new')}
          activeOpacity={0.8}
        >
          <Plus size={16} color="#e8e8f0" />
          <Text style={styles.newBtnText}>Yeni İlan</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6c63ff" />}
        showsVerticalScrollIndicator={false}
      >
        {/* Özet Kartlar */}
        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, styles.cardPrimary]}>
            <Text style={styles.summaryLabel}>TOPLAM KİLİTLİ</Text>
            <Text style={styles.summaryValue}>{totalLocked} SUI</Text>
            <Text style={styles.summaryHint}>Aktif Escrow Bütçesi</Text>
          </View>

          <View style={[styles.summaryCard, styles.cardSuccess]}>
            <Text style={styles.summaryLabel}>TAHSİL EDİLECEK</Text>
            <Text style={[styles.summaryValue, { color: '#4ade80' }]}>{totalToReceive} SUI</Text>
            <Text style={styles.summaryHint}>Onay Bekleyen Alacak</Text>
          </View>

          <View style={[styles.summaryCard, styles.cardWarning, { width: '100%' }]}>
            <Text style={styles.summaryLabel}>ÖDENECEK TUTAR (MÜŞTERİ)</Text>
            <Text style={[styles.summaryValue, { color: '#fbbf24' }]}>{totalToPay} SUI</Text>
            <Text style={styles.summaryHint}>Teslim Edilmiş Aşama Borcunuz</Text>
          </View>
        </View>

        {/* Aktif Sözleşmeler Listesi */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>AKTİF VE BEKLEYEN SÖZLEŞMELER ({activeContracts.length})</Text>

          {activeContracts.length === 0 ? (
            <View style={styles.emptyCard}>
              <Shield size={48} color="#2a2a38" />
              <Text style={styles.emptyTitle}>Aktif escrow işlemi yok</Text>
              <Text style={styles.emptyDesc}>
                Şu anda devam eden veya kilitli bir sözleşmeniz bulunmuyor. Sağ üstteki butondan yeni bir ilan yayınlayabilirsiniz.
              </Text>
            </View>
          ) : (
            activeContracts.map((c) => {
              const completedCount = c.milestones.filter((m) => m.is_completed).length;
              const isClient = c.client.toLowerCase() === userAddr;

              return (
                <TouchableOpacity
                  key={c.id}
                  style={styles.contractCard}
                  onPress={() => router.push(`/contracts/${c.id}`)}
                  activeOpacity={0.75}
                >
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.contractTitle} numberOfLines={1}>{c.title}</Text>
                    <View style={styles.roleBadge}>
                      <Text style={styles.roleBadgeText}>{isClient ? 'MÜŞTERİ' : 'FREELANCER'}</Text>
                    </View>
                  </View>

                  <Text style={styles.contractDesc} numberOfLines={2}>{c.description}</Text>

                  <View style={styles.metaFooter}>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>BÜTÇE</Text>
                      <Text style={styles.metaAmount}>{mistToSui(c.total_budget)} SUI</Text>
                    </View>

                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>AŞAMALAR</Text>
                      <View style={styles.msBadgeRow}>
                        <CheckCircle size={14} color="#6c63ff" />
                        <Text style={styles.msCountText}>{completedCount} / {c.milestones.length}</Text>
                      </View>
                    </View>

                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>SON TESLİM</Text>
                      <Text style={styles.metaDate}>{formatDate(c.deadline)}</Text>
                    </View>

                    <ChevronRight size={20} color="#6b6b85" />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f13' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingText: { fontSize: 16, fontWeight: '600', color: '#e8e8f0' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a38',
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#e8e8f0' },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#6c63ff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  newBtnText: { fontSize: 14, fontWeight: '700', color: '#e8e8f0' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 80 },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  cardPrimary: { borderColor: '#6c63ff', backgroundColor: 'rgba(108,99,255,0.1)' },
  cardSuccess: { borderColor: '#4ade80', backgroundColor: 'rgba(74,222,128,0.1)' },
  cardWarning: { borderColor: '#fbbf24', backgroundColor: 'rgba(251,191,36,0.1)' },
  summaryLabel: { fontSize: 10, fontWeight: '700', color: '#6b6b85', letterSpacing: 1 },
  summaryValue: { fontSize: 22, fontWeight: '900', color: '#6c63ff' },
  summaryHint: { fontSize: 11, color: '#e8e8f0', opacity: 0.8 },
  listSection: { paddingHorizontal: 20, gap: 14 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#6b6b85', letterSpacing: 1.5 },
  emptyCard: {
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#2a2a38',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#e8e8f0' },
  emptyDesc: { fontSize: 14, color: '#6b6b85', textAlign: 'center', lineHeight: 22 },
  contractCard: {
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#2a2a38',
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  contractTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: '#e8e8f0' },
  roleBadge: { backgroundColor: '#2a2a38', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  roleBadgeText: { fontSize: 10, fontWeight: '700', color: '#6c63ff' },
  contractDesc: { fontSize: 13, color: '#6b6b85', lineHeight: 20 },
  metaFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTopWidth: 1, borderTopColor: '#2a2a38' },
  metaItem: { gap: 4 },
  metaLabel: { fontSize: 10, fontWeight: '700', color: '#6b6b85', letterSpacing: 1 },
  metaAmount: { fontSize: 15, fontWeight: '800', color: '#6c63ff' },
  msBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  msCountText: { fontSize: 14, fontWeight: '700', color: '#e8e8f0' },
  metaDate: { fontSize: 13, fontWeight: '600', color: '#e8e8f0' },
});
