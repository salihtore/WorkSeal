/**
 * Explore screen — mirrors frontend explore/page.tsx
 * Open jobs: tabs (En Yeniler / Yüksek Bütçeli / Düşük Bütçeli) + search
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Search, ChevronRight } from 'lucide-react-native';
import { useWalletStore } from '@/lib/wallet-store';
import { useContracts } from '@/hooks/useContracts';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AppBackground from '@/components/AppBackground';
import { mistToSui } from '@/types';
import { COLORS, FONTS, SPACING } from '@/constants/theme';
import { NULL_ADDRESS } from '@/constants/config';

const TABS = ['En Yeniler', 'Yüksek Bütçeli', 'Düşük Bütçeli'];

export default function ExploreScreen() {
  const { address } = useWalletStore();
  const { contracts, loading, fetchAllContracts } = useContracts(address);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('En Yeniler');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllContracts();
    setRefreshing(false);
  };

  const openJobs = useMemo(() => {
    const filtered = contracts
      .filter(
        (c) =>
          !c.freelancer ||
          c.freelancer === NULL_ADDRESS
      )
      .filter(
        (c) =>
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.id.toLowerCase().includes(search.toLowerCase())
      );

    if (activeTab === 'En Yeniler') {
      return filtered.sort((a, b) => b.created_at - a.created_at);
    } else if (activeTab === 'Yüksek Bütçeli') {
      return filtered.sort((a, b) => {
        const diff = BigInt(b.total_budget) - BigInt(a.total_budget);
        return diff > 0n ? 1 : diff < 0n ? -1 : 0;
      });
    } else if (activeTab === 'Düşük Bütçeli') {
      return filtered.sort((a, b) => {
        const diff = BigInt(a.total_budget) - BigInt(b.total_budget);
        return diff > 0n ? 1 : diff < 0n ? -1 : 0;
      });
    }
    return filtered;
  }, [contracts, search, activeTab]);

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
          <View style={styles.liveRow}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>
              {loading ? 'Bağlanıyor...' : `${openJobs.length} açık iş · Canlı`}
            </Text>
          </View>
          <Text style={styles.title}>
            Açık <Text style={styles.titleFaded}>İşler</Text>
          </Text>
          <Text style={styles.subtitle}>
            Sui ağında escrow güvencesiyle yayınlanan, freelancer bekleyen iş ilanları.
          </Text>
        </View>

        {/* Filter Bar */}
        <View style={styles.filterBar}>
          {/* Tabs */}
          <View style={styles.tabsRow}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Search */}
          <View style={styles.searchBar}>
            <Search size={13} color={COLORS.mutedForeground} />
            <TextInput
              style={styles.searchInput}
              placeholder="Başlık veya ID ara..."
              placeholderTextColor={COLORS.mutedForeground}
              value={search}
              onChangeText={setSearch}
              selectionColor={COLORS.primary}
            />
          </View>
        </View>

        {/* Content */}
        {loading ? (
          <LoadingSpinner label="BLOCKCHAIN SENKRONIZE EDİLİYOR" />
        ) : openJobs.length === 0 ? (
          <EmptyState
            description="Henüz açık iş ilanı yok."
            actionLabel="İlk İlanı Sen Ver"
            onAction={() => router.push('/contract/new')}
          />
        ) : (
          openJobs.map((job) => (
            <TouchableOpacity
              key={job.id}
              style={styles.jobCard}
              onPress={() => router.push(`/contract/${job.id}` as any)}
              activeOpacity={0.7}
            >
              {/* Budget */}
              <View style={styles.budgetRow}>
                <Text style={styles.budget}>
                  {mistToSui(job.total_budget)}
                  <Text style={styles.budgetSub}> SUI</Text>
                </Text>
                <ChevronRight size={16} color={COLORS.mutedForeground} />
              </View>

              {/* Title & Desc */}
              <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
              <Text style={styles.jobDesc} numberOfLines={2}>
                {job.description || 'Bu iş için henüz açıklama girilmemiş.'}
              </Text>

              {/* Client */}
              <View style={styles.jobFooter}>
                <Text style={styles.jobClient}>
                  {job.client.slice(0, 10)}...{job.client.slice(-6)}
                </Text>
              </View>
            </TouchableOpacity>
          ))
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
    paddingHorizontal: SPACING['2xl'],
    paddingTop: 56,
    paddingBottom: SPACING['2xl'],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.emerald,
  },
  liveText: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: 'rgba(52,211,153,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  title: {
    fontFamily: FONTS.sans,
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.foreground,
    letterSpacing: -1.2,
    lineHeight: 40,
    marginBottom: 8,
  },
  titleFaded: {
    color: 'rgba(240,246,255,0.3)',
    fontWeight: '300',
  },
  subtitle: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    color: COLORS.mutedForeground,
    lineHeight: 20,
  },
  filterBar: {
    paddingHorizontal: SPACING['2xl'],
    paddingVertical: SPACING.base,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabsRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
  },
  tabBtnText: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.mutedForeground,
  },
  tabBtnTextActive: {
    color: COLORS.primaryForeground,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.mono,
    fontSize: 12,
    color: COLORS.foreground,
  },
  jobCard: {
    backgroundColor: COLORS.background,
    padding: SPACING['2xl'],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    minHeight: 180,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.base,
  },
  budget: {
    fontFamily: FONTS.mono,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  budgetSub: {
    fontSize: 12,
    color: 'rgba(79,195,247,0.5)',
  },
  jobTitle: {
    fontFamily: FONTS.sans,
    fontSize: 16,
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
  jobFooter: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  jobClient: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    color: COLORS.mutedForeground,
  },
});
