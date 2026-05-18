/**
 * Explore screen — mirrors frontend explore/page.tsx
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useContracts } from '@/hooks/use-contracts';
import AppBackground from '@/components/AppBackground';
import Button from '@/components/ui/Button';
import { ArrowRight, Search } from 'lucide-react-native';
import { mistToSui } from '@/types';
import { COLORS, FONTS, SPACING } from '@/constants/theme';

const TABS = ['En Yeniler', 'Yüksek Bütçeli', 'Düşük Bütçeli'];

export default function ExploreScreen() {
  const { contracts, loading } = useContracts();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('En Yeniler');

  const openJobs = useMemo(() => {
    const filtered = contracts
      .filter(
        (c) =>
          !c.freelancer ||
          c.freelancer ===
            '0x0000000000000000000000000000000000000000000000000000000000000000'
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
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>
              {loading ? 'BAĞLANIYOR...' : `${openJobs.length} AÇIK İLAN · CANLI`}
            </Text>
          </View>
          <Text style={styles.title}>
            Açık <Text style={styles.titleGradient}>İşler</Text>
          </Text>
          <Text style={styles.subtitle}>
            Sui Blockchain üzerinde Escrow güvencesiyle kilitlenmiş ve yetenekli uzmanları bekleyen doğrulanmış iş fırsatları.
          </Text>
        </View>

        <View style={styles.section}>
          {/* Filter Bar */}
          <View style={styles.filterBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
              <View style={styles.tabsBox}>
                {TABS.map((tab) => {
                  const isActive = activeTab === tab;
                  return (
                    <TouchableOpacity
                      key={tab}
                      style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                      onPress={() => setActiveTab(tab)}
                    >
                      <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                        {tab}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.searchBox}>
              <Search size={14} color={COLORS.mutedForeground} style={styles.searchIcon} />
              <TextInput
                placeholder="Başlık veya ID ile ilan ara..."
                placeholderTextColor={COLORS.mutedForeground}
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
              />
            </View>
          </View>

          {/* Content */}
          {loading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator color={COLORS.primary} size="large" />
              <Text style={styles.loadingSub}>BLOCKCHAIN SENKRONİZE EDİLİYOR</Text>
            </View>
          ) : openJobs.length > 0 ? (
            <View style={styles.jobsGrid}>
              {openJobs.map((job) => (
                <TouchableOpacity
                  key={job.id}
                  style={styles.jobCard}
                  onPress={() => router.push(`/contracts/${job.id}` as any)}
                >
                  <View style={styles.jobTop}>
                    <Text style={styles.jobBudget}>
                      {mistToSui(job.total_budget)} <Text style={styles.jobUnit}>SUI</Text>
                    </Text>
                    <ArrowRight size={16} color={COLORS.mutedForeground} />
                  </View>
                  <Text style={styles.jobTitle} numberOfLines={1}>
                    {job.title}
                  </Text>
                  <Text style={styles.jobDesc} numberOfLines={2}>
                    {job.description || 'İş tanımı ve teslimat koşulları belirtilmemiş.'}
                  </Text>
                  <View style={styles.jobFooter}>
                    <Text style={styles.jobClient}>
                      {job.client.slice(0, 10)}...{job.client.slice(-6)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>·</Text>
              <Text style={styles.emptyText}>Pazar yerinde henüz aktif bir iş ilanı bulunmuyor.</Text>
              <Button onPress={() => router.push('/contracts/new')} size="sm">
                Yeni Bir İş İlanı Yayınlayın
              </Button>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  header: {
    paddingHorizontal: SPACING['2xl'],
    paddingTop: 56,
    paddingBottom: SPACING['2xl'],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.emerald },
  liveText: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.emerald, letterSpacing: 1.5 },
  title: {
    fontFamily: FONTS.sans,
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.foreground,
    letterSpacing: -1,
  },
  titleGradient: { color: 'rgba(240,246,255,0.7)' },
  subtitle: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    color: COLORS.mutedForeground,
    marginTop: 8,
    lineHeight: 20,
  },
  section: { padding: SPACING['2xl'], gap: 24 },
  filterBar: { gap: 16 },
  tabsScroll: { flexGrow: 0 },
  tabsBox: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  tabBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  tabBtnActive: { backgroundColor: COLORS.primary },
  tabText: { fontFamily: FONTS.sans, fontSize: 13, color: COLORS.mutedForeground },
  tabTextActive: { color: COLORS.background, fontWeight: '700' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    height: 40,
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.mono,
    fontSize: 12,
    color: COLORS.foreground,
  },
  emptyContainer: { paddingVertical: 80, alignItems: 'center', gap: 12 },
  loadingSub: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.mutedForeground, letterSpacing: 2 },
  jobsGrid: { gap: 16 },
  jobCard: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    gap: 12,
  },
  jobTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  jobBudget: { fontFamily: FONTS.mono, fontSize: 22, fontWeight: '900', color: COLORS.primary },
  jobUnit: { fontSize: 14, color: 'rgba(79,195,247,0.5)', fontWeight: '400' },
  jobTitle: { fontFamily: FONTS.sans, fontSize: 17, fontWeight: '700', color: COLORS.foreground },
  jobDesc: { fontFamily: FONTS.sans, fontSize: 12, color: COLORS.mutedForeground, lineHeight: 18 },
  jobFooter: { marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  jobClient: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.mutedForeground, marginTop: 8 },
  emptyBox: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    paddingVertical: 80,
    alignItems: 'center',
  },
  emptyIcon: { fontFamily: FONTS.sans, fontSize: 48, fontWeight: '900', color: COLORS.border, marginBottom: 12 },
  emptyText: { fontFamily: FONTS.mono, fontSize: 12, color: COLORS.mutedForeground, marginBottom: 20 },
});
