/**
 * Arbitrator Portal screen — mirrors frontend arbitrator/page.tsx
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Scale, ChevronRight } from 'lucide-react-native';
import { useWalletStore } from '@/lib/wallet-store';
import { useContracts } from '@/hooks/useContracts';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import AppBackground from '@/components/AppBackground';
import { ContractStatus } from '@/types';
import { COLORS, FONTS, SPACING } from '@/constants/theme';

const TABS = ['Bekleyen Dosyalar', 'Geçmiş Kararlarım'] as const;

export default function ArbitratorScreen() {
  const { address } = useWalletStore();
  const { contracts, loading, isArbitrator, fetchAllContracts } = useContracts(address);
  const [activeTab, setActiveTab] = useState<'Bekleyen Dosyalar' | 'Geçmiş Kararlarım'>('Bekleyen Dosyalar');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllContracts();
    setRefreshing(false);
  };

  const activeDisputes = contracts.filter((c) => c.status === ContractStatus.Disputed);
  const historyDisputes = contracts.filter(
    (c) =>
      c.status !== ContractStatus.Disputed &&
      c.arbitrator &&
      c.arbitrator.toLowerCase() === address?.toLowerCase()
  );

  const stats = {
    totalActive: activeDisputes.length,
    totalResolved: contracts.filter(
      (c) =>
        c.arbitrator?.toLowerCase() === address?.toLowerCase() &&
        c.status === ContractStatus.Completed
    ).length,
    totalResumed: contracts.filter(
      (c) =>
        c.arbitrator?.toLowerCase() === address?.toLowerCase() &&
        c.status === ContractStatus.Active
    ).length,
  };

  const currentList = activeTab === 'Bekleyen Dosyalar' ? activeDisputes : historyDisputes;

  if (!isArbitrator && !loading) {
    return (
      <View style={styles.unauthorized}>
        <AppBackground />
        <Text style={styles.unauthorizedIcon}>!</Text>
        <Text style={styles.unauthorizedTitle}>Yetkisiz Erişim</Text>
        <Text style={styles.unauthorizedDesc}>
          Bu sayfaya sadece kayıtlı sistem hakemleri erişebilir.
        </Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace('/(app)/dashboard')}
        >
          <Text style={styles.backBtnText}>Dashboard'a Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppBackground />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>
            <Scale size={10} color="rgba(79,195,247,0.6)" /> SİSTEM HAKEMİ YETKİSİ AKTİF
          </Text>
          <Text style={styles.title}>Yargı Yönetimi</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Karar Bekleyen', value: stats.totalActive.toString(), color: COLORS.destructive },
            { label: 'Çözümlenen', value: stats.totalResolved.toString(), color: COLORS.emerald },
            { label: 'Devam Ettirilen', value: stats.totalResumed.toString(), color: COLORS.primary },
          ].map(({ label, value, color }) => (
            <View key={label} style={styles.statCard}>
              <Text style={styles.statLabel}>{label}</Text>
              <Text style={[styles.statValue, { color }]}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
              <View
                style={[
                  styles.tabBadge,
                  activeTab === tab && styles.tabBadgeActive,
                ]}
              >
                <Text style={[styles.tabBadgeText, activeTab === tab && styles.tabBadgeTextActive]}>
                  {tab === 'Bekleyen Dosyalar' ? activeDisputes.length : historyDisputes.length}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        {loading ? (
          <LoadingSpinner label="YARGI VERİLERİ YÜKLENİYOR" />
        ) : currentList.length === 0 ? (
          <EmptyState
            description={
              activeTab === 'Bekleyen Dosyalar'
                ? 'Şu an için karar bekleyen bir dosya bulunmuyor.'
                : 'Henüz bir karar geçmişiniz yok.'
            }
          />
        ) : (
          <View style={styles.list}>
            {currentList.map((contract) => {
              const latestDispute =
                contract.dispute_history?.[contract.dispute_history.length - 1];
              return (
                <TouchableOpacity
                  key={contract.id}
                  style={styles.listItem}
                  onPress={() => router.push(`/contract/${contract.id}` as any)}
                  activeOpacity={0.7}
                >
                  <View style={styles.listItemLeft}>
                    <View style={styles.listItemTitleRow}>
                      <Text style={styles.listItemTitle} numberOfLines={1}>
                        {contract.title}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          activeTab === 'Bekleyen Dosyalar'
                            ? styles.statusBadgeRed
                            : styles.statusBadgeGreen,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            activeTab === 'Bekleyen Dosyalar'
                              ? styles.statusBadgeTextRed
                              : styles.statusBadgeTextGreen,
                          ]}
                        >
                          {activeTab === 'Bekleyen Dosyalar' ? 'KARAR BEKLİYOR' : 'KARARA BAĞLANDI'}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.listItemId}>
                      ID: {contract.id.slice(0, 14)}...
                    </Text>
                    {latestDispute && (
                      <Text style={styles.listItemReason} numberOfLines={1}>
                        "{latestDispute.reason}"
                      </Text>
                    )}
                  </View>

                  <View style={styles.listItemRight}>
                    <Text style={styles.listItemBudget}>
                      {Number(contract.total_budget) / 1_000_000_000} SUI
                    </Text>
                    <ChevronRight size={14} color={COLORS.mutedForeground} />
                  </View>
                </TouchableOpacity>
              );
            })}
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
  unauthorized: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    padding: 40,
  },
  unauthorizedIcon: {
    fontFamily: FONTS.mono,
    fontSize: 64,
    fontWeight: '900',
    color: COLORS.border,
    marginBottom: 16,
  },
  unauthorizedTitle: {
    fontFamily: FONTS.sans,
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.foreground,
    marginBottom: 8,
  },
  unauthorizedDesc: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    color: COLORS.mutedForeground,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 32,
  },
  backBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  backBtnText: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryForeground,
  },
  header: {
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
    lineHeight: 40,
  },
  statsRow: {
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
    fontSize: 8,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  statValue: {
    fontFamily: FONTS.mono,
    fontSize: 28,
    fontWeight: '900',
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.mutedForeground,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  tabBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tabBadgeActive: {
    backgroundColor: COLORS.blueBg,
  },
  tabBadgeText: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    color: COLORS.mutedForeground,
  },
  tabBadgeTextActive: {
    color: COLORS.primary,
  },
  list: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING['2xl'],
    paddingVertical: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  listItemLeft: { flex: 1, gap: 4 },
  listItemTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  listItemTitle: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.foreground,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
  },
  statusBadgeRed: { backgroundColor: COLORS.redBg, borderColor: COLORS.redBorder },
  statusBadgeGreen: { backgroundColor: COLORS.emeraldBg, borderColor: COLORS.emeraldBorder },
  statusBadgeText: {
    fontFamily: FONTS.mono,
    fontSize: 7,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statusBadgeTextRed: { color: COLORS.destructive },
  statusBadgeTextGreen: { color: COLORS.emerald },
  listItemId: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    color: COLORS.mutedForeground,
  },
  listItemReason: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    color: 'rgba(240,246,255,0.4)',
    fontStyle: 'italic',
    maxWidth: 240,
  },
  listItemRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  listItemBudget: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
