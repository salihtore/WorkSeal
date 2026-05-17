import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Briefcase, Search, CheckCircle, Clock, DollarSign, User, ChevronRight } from 'lucide-react-native';
import { useWalletStore } from '@/lib/wallet-store';
import { useContracts } from '@/hooks/use-contracts';
import { useTransaction } from '@/hooks/use-transaction';
import AppBackground from '@/components/AppBackground';
import { mistToSui, formatAddress, formatDate } from '@/types';

export default function ExploreTabScreen() {
  const { address } = useWalletStore();
  const { loading, error, fetchAllContracts, getOpenJobs } = useContracts(address);
  const { takeJob, isPending } = useTransaction();

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [takingJobId, setTakingJobId] = useState<string | null>(null);

  const openJobs = getOpenJobs();

  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return openJobs;
    const query = searchQuery.toLowerCase();
    return openJobs.filter((job) => job.title.toLowerCase().includes(query));
  }, [openJobs, searchQuery]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllContracts();
    setRefreshing(false);
  }, [fetchAllContracts]);

  const handleTakeJob = async (contractId: string, title: string) => {
    setTakingJobId(contractId);
    try {
      await takeJob(contractId);
      Alert.alert('Slush acildi', `"${title}" isini Slush icindeki WorkSeal web dApp uzerinden onaylayabilirsin.`);
      fetchAllContracts();
    } catch (e: any) {
      Alert.alert('Slush acilamadi', e.message);
    } finally {
      setTakingJobId(null);
    }
  };

  if (loading && openJobs.length === 0) {
    return (
      <View style={styles.center}>
        <AppBackground />
        <ActivityIndicator size="large" color="#6c63ff" />
        <Text style={styles.loadingText}>Açık İş İlanları Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppBackground />

      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Briefcase size={26} color="#6c63ff" />
          <Text style={styles.headerTitle}>Keşfet & İlanlar</Text>
        </View>
        <Text style={styles.headerSubtitle}>Sui Testnet üzerindeki açık ilanları üstlenin</Text>

        <View style={styles.searchBox}>
          <Search size={18} color="#6b6b85" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="İlan başlığına göre ara..."
            placeholderTextColor="#6b6b85"
            editable={!isPending}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6c63ff" />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>AÇIK İLANLAR ({filteredJobs.length})</Text>

          {filteredJobs.length === 0 ? (
            <View style={styles.emptyCard}>
              <Briefcase size={56} color="#2a2a38" />
              <Text style={styles.emptyTitle}>Açık iş ilanı bulunamadı</Text>
              <Text style={styles.emptyDesc}>
                {searchQuery.trim()
                  ? `"${searchQuery}" aramasıyla eşleşen bir ilan yok.`
                  : 'Şu anda Sui Testnet üzerinde freelancer arayan aktif bir ilan yok. Lütfen daha sonra tekrar kontrol edin.'}
              </Text>
            </View>
          ) : (
            filteredJobs.map((job) => {
              const isTakingThis = takingJobId === job.id;

              return (
                <View key={job.id} style={styles.jobCard}>
                  <View style={styles.jobTop}>
                    <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
                    <View style={styles.openBadge}>
                      <Text style={styles.openBadgeText}>AÇIK İLAN</Text>
                    </View>
                  </View>

                  <Text style={styles.jobDesc} numberOfLines={2}>{job.description}</Text>

                  <View style={styles.metaGrid}>
                    <View style={styles.metaBox}>
                      <Text style={styles.metaLabel}>TOPLAM BÜTÇE</Text>
                      <Text style={styles.metaValue}>{mistToSui(job.total_budget)} SUI</Text>
                    </View>

                    <View style={styles.metaBox}>
                      <Text style={styles.metaLabel}>AŞAMA (MİLESTONES)</Text>
                      <View style={styles.badgeRow}>
                        <CheckCircle size={14} color="#6c63ff" />
                        <Text style={styles.metaText}>{job.milestones.length} Aşama</Text>
                      </View>
                    </View>

                    <View style={styles.metaBox}>
                      <Text style={styles.metaLabel}>İŞVEREN (CLIENT)</Text>
                      <View style={styles.badgeRow}>
                        <User size={14} color="#6b6b85" />
                        <Text style={styles.metaText}>{formatAddress(job.client)}</Text>
                      </View>
                    </View>

                    <View style={styles.metaBox}>
                      <Text style={styles.metaLabel}>SON TESLİM</Text>
                      <View style={styles.badgeRow}>
                        <Clock size={14} color="#6b6b85" />
                        <Text style={styles.metaText}>{formatDate(job.deadline)}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.detailBtn}
                      onPress={() => router.push(`/contracts/${job.id}`)}
                      disabled={isPending}
                    >
                      <Text style={styles.detailBtnText}>İncele</Text>
                      <ChevronRight size={16} color="#e8e8f0" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.takeBtn, (isPending || isTakingThis) && styles.takeBtnDisabled]}
                      onPress={() => handleTakeJob(job.id, job.title)}
                      disabled={isPending || isTakingThis}
                    >
                      {isTakingThis ? (
                        <ActivityIndicator color="#e8e8f0" size="small" />
                      ) : (
                        <Text style={styles.takeBtnText}>SLUSH ILE AL</Text>
                      )}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a38',
    gap: 8,
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#e8e8f0' },
  headerSubtitle: { fontSize: 13, color: '#6b6b85', marginBottom: 8 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#2a2a38',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  searchInput: { flex: 1, color: '#e8e8f0', fontSize: 14 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 80 },
  listSection: { paddingHorizontal: 20, paddingTop: 24, gap: 16 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#6b6b85', letterSpacing: 1.5 },
  emptyCard: {
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#2a2a38',
    borderRadius: 16,
    padding: 36,
    alignItems: 'center',
    gap: 16,
    marginTop: 20,
  },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#e8e8f0' },
  emptyDesc: { fontSize: 14, color: '#6b6b85', textAlign: 'center', lineHeight: 22 },
  jobCard: {
    backgroundColor: '#1a1a24',
    borderWidth: 1,
    borderColor: '#2a2a38',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  jobTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  jobTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: '#e8e8f0' },
  openBadge: { backgroundColor: 'rgba(108,99,255,0.15)', borderWidth: 1, borderColor: '#6c63ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  openBadgeText: { fontSize: 10, fontWeight: '800', color: '#6c63ff' },
  jobDesc: { fontSize: 13, color: '#6b6b85', lineHeight: 20 },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', borderWidth: 1, borderColor: '#2a2a38', borderRadius: 12, overflow: 'hidden' },
  metaBox: { width: '50%', padding: 12, backgroundColor: '#0f0f13', borderWidth: 0.5, borderColor: '#2a2a38', gap: 6 },
  metaLabel: { fontSize: 10, fontWeight: '700', color: '#6b6b85', letterSpacing: 1 },
  metaValue: { fontSize: 15, fontWeight: '800', color: '#6c63ff' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, fontWeight: '600', color: '#e8e8f0' },
  actionRow: { flexDirection: 'row', gap: 12, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#2a2a38' },
  detailBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 48, borderWidth: 1, borderColor: '#2a2a38', borderRadius: 12 },
  detailBtnText: { fontSize: 14, fontWeight: '700', color: '#e8e8f0' },
  takeBtn: { flex: 1, backgroundColor: '#6c63ff', height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  takeBtnDisabled: { opacity: 0.5 },
  takeBtnText: { fontSize: 14, fontWeight: '800', color: '#e8e8f0' },
});
