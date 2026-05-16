import React, { useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AlertTriangle, CheckCircle, Scale, ChevronRight, User } from 'lucide-react-native';
import { useWalletStore } from '@/lib/wallet-store';
import { useContracts } from '@/hooks/use-contracts';
import AppBackground from '@/components/AppBackground';
import { ContractStatus, mistToSui, formatAddress, formatDate } from '@/types';

export default function DisputesTabScreen() {
  const { address } = useWalletStore();
  const { loading, error, fetchAllContracts, getMyContracts } = useContracts(address);
  const [refreshing, setRefreshing] = useState(false);

  const myContracts = getMyContracts();
  const disputedContracts = useMemo(() => {
    return myContracts.filter((c) => c.status === ContractStatus.Disputed);
  }, [myContracts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllContracts();
    setRefreshing(false);
  }, [fetchAllContracts]);

  if (loading && disputedContracts.length === 0) {
    return (
      <View style={styles.center}>
        <AppBackground />
        <ActivityIndicator size="large" color="#ff4d6d" />
        <Text style={styles.loadingText}>Anlaşmazlık Kayıtları Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppBackground />

      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <AlertTriangle size={26} color="#ff4d6d" />
          <Text style={styles.headerTitle}>Anlaşmazlık ve Yargı</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ff4d6d" />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>AKTİF ANLAŞMAZLIKLAR ({disputedContracts.length})</Text>

          {disputedContracts.length === 0 ? (
            <View style={styles.emptyCard}>
              <CheckCircle size={56} color="#4ade80" />
              <Text style={styles.emptyTitle}>Aktif anlaşmazlık yok</Text>
              <Text style={styles.emptyDesc}>
                Tebrikler! Şu anda devam eden veya kilitlenmiş hiçbir sorunlu sözleşmeniz bulunmuyor. Tüm iş süreçleriniz sorunsuz ilerliyor.
              </Text>
            </View>
          ) : (
            disputedContracts.map((c) => {
              const latestDispute = c.dispute_history[0];
              const raisedBy = latestDispute ? latestDispute.raised_by : 'Bilinmiyor';
              const reason = latestDispute ? latestDispute.reason : 'Sebep belirtilmemiş';
              const timestamp = latestDispute ? latestDispute.timestamp : c.created_at;

              return (
                <View key={c.id} style={styles.disputeCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.contractTitle} numberOfLines={1}>{c.title}</Text>
                    <View style={styles.disputeBadge}>
                      <Text style={styles.disputeBadgeText}>KİLİTLİ</Text>
                    </View>
                  </View>

                  <View style={styles.reasonBox}>
                    <Text style={styles.reasonLabel}>ANLAŞMAZLIK GEREKÇESİ</Text>
                    <Text style={styles.reasonText}>"{reason}"</Text>
                    <View style={styles.raiserRow}>
                      <User size={14} color="#ff4d6d" />
                      <Text style={styles.raiserText}>Başlatan: {formatAddress(raisedBy)}</Text>
                      <Text style={styles.dateText}> · {formatDate(timestamp)}</Text>
                    </View>
                  </View>

                  <View style={styles.arbitratorRow}>
                    <Scale size={18} color="#fbbf24" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.arbLabel}>ATANAN HAKEM</Text>
                      <Text style={styles.arbValue}>
                        {c.arbitrator !== null ? formatAddress(c.arbitrator) : 'Hakem Atanıyor...'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.detailBtn}
                      onPress={() => router.push(`/contracts/${c.id}`)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.detailBtnText}>Detay</Text>
                      <ChevronRight size={16} color="#e8e8f0" />
                    </TouchableOpacity>
                  </View>
                </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a38',
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#e8e8f0' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 80 },
  listSection: { paddingHorizontal: 20, paddingTop: 24, gap: 16 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#6b6b85', letterSpacing: 1.5 },
  emptyCard: {
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.3)',
    borderRadius: 16,
    padding: 36,
    alignItems: 'center',
    gap: 16,
    marginTop: 20,
  },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#4ade80' },
  emptyDesc: { fontSize: 14, color: '#6b6b85', textAlign: 'center', lineHeight: 22 },
  disputeCard: {
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#ff4d6d',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  contractTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: '#e8e8f0' },
  disputeBadge: { backgroundColor: 'rgba(255,77,109,0.15)', borderWidth: 1, borderColor: '#ff4d6d', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  disputeBadgeText: { fontSize: 10, fontWeight: '800', color: '#ff4d6d' },
  reasonBox: { backgroundColor: '#0f0f13', borderRadius: 12, padding: 16, gap: 8, borderWidth: 1, borderColor: '#2a2a38' },
  reasonLabel: { fontSize: 10, fontWeight: '700', color: '#6b6b85', letterSpacing: 1 },
  reasonText: { fontSize: 14, fontStyle: 'italic', color: '#e8e8f0', lineHeight: 20 },
  raiserRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  raiserText: { fontSize: 12, fontWeight: '700', color: '#ff4d6d', marginLeft: 6 },
  dateText: { fontSize: 12, color: '#6b6b85' },
  arbitratorRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#2a2a38' },
  arbLabel: { fontSize: 10, fontWeight: '700', color: '#6b6b85', letterSpacing: 1 },
  arbValue: { fontSize: 14, fontWeight: '800', color: '#fbbf24', marginTop: 2 },
  detailBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#6c63ff', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  detailBtnText: { fontSize: 14, fontWeight: '700', color: '#e8e8f0' },
});
