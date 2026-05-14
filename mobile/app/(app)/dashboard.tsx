/**
 * Dashboard screen — mirrors frontend dashboard/page.tsx
 * 3 tabs: Genel Bakış | Pazar Yeri | Sözleşmelerim
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Plus, Zap, Shield, AlertTriangle, ChevronRight } from 'lucide-react-native';
import { useWalletStore } from '@/lib/wallet-store';
import { useContracts } from '@/hooks/useContracts';
import ContractCard from '@/components/ContractCard';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AppBackground from '@/components/AppBackground';
import { mistToSui, formatAddress, ContractStatus } from '@/types';
import { COLORS, FONTS, SPACING } from '@/constants/theme';
import { NULL_ADDRESS } from '@/constants/config';

const TABS = ['Genel Bakış', 'Pazar Yeri', 'Sözleşmelerim'];

export default function DashboardScreen() {
  const { address } = useWalletStore();
  const { contracts, loading, isArbitrator, fetchAllContracts } = useContracts(address);
  const [activeTab, setActiveTab] = useState('Genel Bakış');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllContracts();
    setRefreshing(false);
  };

  const myContracts = useMemo(() => {
    if (!address) return [];
    return contracts.filter(
      (c) => c.client === address || c.freelancer === address
    );
  }, [contracts, address]);

  const openJobs = useMemo(() => {
    return contracts
      .filter((c) => !c.freelancer || c.freelancer === NULL_ADDRESS)
      .slice(0, 6);
  }, [contracts]);

  const stats = useMemo(() => {
    const active = myContracts.filter((c) => c.status === ContractStatus.Active).length;
    const disputed = myContracts.filter((c) => c.status === ContractStatus.Disputed).length;
    const escrow = myContracts
      .filter((c) => c.status === ContractStatus.Active)
      .reduce((acc, c) => acc + BigInt(c.total_budget), 0n);
    return { active, disputed, escrow: mistToSui(escrow) };
  }, [myContracts]);

  return (
    <View style={styles.container}>
      <AppBackground />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Page Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerLabel}>
              SUI TESTNET · {address ? formatAddress(address) : ''}
            </Text>
            <Text style={styles.title}>Dashboard</Text>
          </View>
          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => router.push('/contract/new')}
          >
            <Plus size={14} color={COLORS.primaryForeground} />
            <Text style={styles.newBtnText}>Yeni</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[styles.tabText, activeTab === tab && styles.tabTextActive]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* GENEL BAKIŞ */}
        {activeTab === 'Genel Bakış' && (
          <View>
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              {[
                { label: 'Aktif İş', value: stats.active.toString(), accent: true, Icon: Zap },
                { label: 'Escrow (SUI)', value: stats.escrow, accent: false, Icon: Shield },
                { label: 'Anlaşmazlık', value: stats.disputed.toString(), accent: false, Icon: AlertTriangle },
              ].map(({ label, value, accent, Icon }) => (
                <View key={label} style={styles.statCard}>
                  <Text style={styles.statLabel}>{label}</Text>
                  <Text style={[styles.statValue, accent && styles.statValueAccent]}>
                    {loading ? '—' : value}
                  </Text>
                </View>
              ))}
            </View>

            {/* Recent Contracts */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Son İşlemlerim</Text>
                <TouchableOpacity onPress={() => setActiveTab('Sözleşmelerim')}>
                  <Text style={styles.seeAll}>Tümü <ChevronRight size={10} color={COLORS.primary} /></Text>
                </TouchableOpacity>
              </View>

              {loading ? (
                <LoadingSpinner />
              ) : myContracts.length === 0 ? (
                <EmptyState
                  description="Henüz işlem yok."
                  actionLabel="İlk Sözleşmeni Oluştur"
                  onAction={() => router.push('/contract/new')}
                />
              ) : (
                myContracts.slice(0, 4).map((c) => (
                  <ContractCard key={c.id} contract={c} currentAddress={address ?? undefined} />
                ))
              )}
            </View>
          </View>
        )}

        {/* PAZAR YERİ */}
        {activeTab === 'Pazar Yeri' && (
          <View style={styles.section}>
            {loading ? (
              <LoadingSpinner label="BLOCKCHAIN SENKRONIZE EDİLİYOR" />
            ) : openJobs.length === 0 ? (
              <EmptyState
                description="Açık iş bulunamadı."
                actionLabel="İlk İlanı Sen Ver"
                onAction={() => router.push('/contract/new')}
              />
            ) : (
              <>
                {openJobs.map((job) => (
                  <TouchableOpacity
                    key={job.id}
                    style={styles.jobCard}
                    onPress={() => router.push(`/contract/${job.id}` as any)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.jobBudgetRow}>
                      <Text style={styles.jobBudget}>
                        {mistToSui(job.total_budget)}
                        <Text style={styles.jobBudgetSub}> SUI</Text>
                      </Text>
                      <ChevronRight size={14} color={COLORS.mutedForeground} />
                    </View>
                    <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
                    <Text style={styles.jobDesc} numberOfLines={2}>
                      {job.description || 'Açıklama belirtilmemiş.'}
                    </Text>
                    <Text style={styles.jobClient}>
                      {job.client.slice(0, 10)}...
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.moreBtn}
                  onPress={() => router.push('/(app)/explore')}
                >
                  <Text style={styles.moreBtnText}>Tüm ilanları gör</Text>
                  <ChevronRight size={12} color={COLORS.mutedForeground} />
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {/* SÖZLEŞMELERİM */}
        {activeTab === 'Sözleşmelerim' && (
          <View>
            {loading ? (
              <LoadingSpinner label="VERİLER YÜKLENİYOR" />
            ) : myContracts.length === 0 ? (
              <EmptyState
                description="Henüz sözleşme yok."
                actionLabel="İlk Sözleşmeni Oluştur"
                onAction={() => router.push('/contract/new')}
              />
            ) : (
              myContracts.map((c) => (
                <ContractCard key={c.id} contract={c} currentAddress={address ?? undefined} />
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING['2xl'],
    paddingTop: 56,
    paddingBottom: SPACING['2xl'],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLabel: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    color: 'rgba(79,195,247,0.6)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontFamily: FONTS.sans,
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.foreground,
    letterSpacing: -1,
    lineHeight: 38,
  },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    height: 36,
  },
  newBtnText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryForeground,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.mutedForeground,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    padding: SPACING.xl,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  statLabel: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  statValue: {
    fontFamily: FONTS.mono,
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.foreground,
  },
  statValueAccent: {
    color: COLORS.primary,
  },
  section: {
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING['2xl'],
    paddingVertical: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  seeAll: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  jobCard: {
    backgroundColor: COLORS.card,
    padding: SPACING['2xl'],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    minHeight: 160,
  },
  jobBudgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  jobBudget: {
    fontFamily: FONTS.mono,
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
  },
  jobBudgetSub: {
    fontSize: 12,
    color: 'rgba(79,195,247,0.5)',
  },
  jobTitle: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.foreground,
    marginBottom: 6,
  },
  jobDesc: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    color: COLORS.mutedForeground,
    lineHeight: 18,
    flex: 1,
  },
  jobClient: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    color: COLORS.mutedForeground,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  moreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: SPACING.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    margin: 0,
  },
  moreBtnText: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
