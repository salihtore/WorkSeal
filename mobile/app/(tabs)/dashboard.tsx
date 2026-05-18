/**
 * Dashboard screen — mirrors frontend dashboard/page.tsx
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useWalletStore } from '@/lib/wallet-store';
import { useContracts } from '@/hooks/use-contracts';
import AppBackground from '@/components/AppBackground';
import Button from '@/components/ui/Button';
import {
  ArrowRight,
  Plus,
  Zap,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react-native';
import { mistToSui, getStatusLabel, getStatusColor } from '@/types';
import { COLORS, FONTS, SPACING } from '@/constants/theme';

const TABS = ['Genel Bakış', 'Pazar Yeri', 'Sözleşmelerim'];

export default function DashboardScreen() {
  const { address } = useWalletStore();
  const { contracts, loading } = useContracts(address);
  const [activeTab, setActiveTab] = useState('Genel Bakış');

  const myContracts = useMemo(() => {
    if (!address) return [];
    return contracts.filter(
      (c) => c.client === address || c.freelancer === address
    );
  }, [contracts, address]);

  const openJobs = useMemo(() => {
    return contracts
      .filter(
        (c) =>
          !c.freelancer ||
          c.freelancer ===
            '0x0000000000000000000000000000000000000000000000000000000000000000'
      )
      .slice(0, 6);
  }, [contracts]);

  const stats = useMemo(() => {
    const active = myContracts.filter((c) => c.status === 1).length;
    const disputed = myContracts.filter((c) => c.status === 3).length;
    const escrow = myContracts
      .filter((c) => c.status === 1)
      .reduce((acc, c) => acc + BigInt(c.total_budget), 0n);
    return { active, disputed, escrow: mistToSui(escrow) };
  }, [myContracts]);

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
          <TouchableOpacity onPress={() => router.push('/wallet' as any)}>
            <Text style={styles.headerSubtitle}>
              SUI TESTNET ·{' '}
              {address ? `${address.slice(0, 8)}...${address.slice(-4)}` : 'BAĞLI DEĞİL'}
            </Text>
            <Text style={styles.title}>Dashboard</Text>
          </TouchableOpacity>
          <Button
            onPress={() => router.push('/contracts/new')}
            size="sm"
            style={styles.newBtn as any}
          >
            <Plus size={16} color={COLORS.background} />
            <Text style={styles.newBtnText}>Yeni Sözleşme</Text>
          </Button>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
          </ScrollView>
        </View>

        {/* ── GENEL BAKIŞ ── */}
        {activeTab === 'Genel Bakış' && (
          <View style={styles.section}>
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              {[
                { label: 'AKTİF İŞ', value: stats.active.toString(), Icon: Zap, accent: true },
                { label: 'ESCROW (SUI)', value: stats.escrow, Icon: ShieldCheck, accent: false },
                { label: 'ANLAŞMAZLIK', value: stats.disputed.toString(), Icon: AlertTriangle, accent: false },
              ].map(({ label, value, accent }) => (
                <View key={label} style={styles.statCard}>
                  <Text style={styles.statLabel}>{label}</Text>
                  <Text
                    style={[styles.statValue, accent ? styles.statValueAccent : null]}
                  >
                    {loading ? '—' : value}
                  </Text>
                </View>
              ))}
            </View>

            {/* Recent Contracts */}
            <View style={styles.tableCard}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableTitle}>SON İŞLEMLERİM</Text>
                <TouchableOpacity
                  style={styles.seeAllBtn}
                  onPress={() => setActiveTab('Sözleşmelerim')}
                >
                  <Text style={styles.seeAllText}>Tümü</Text>
                  <ArrowRight size={12} color={COLORS.primary} />
                </TouchableOpacity>
              </View>

              {loading ? (
                <View style={styles.emptyContainer}>
                  <ActivityIndicator color={COLORS.primary} size="small" />
                </View>
              ) : myContracts.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Aktif veya tamamlanmış herhangi bir akıllı sözleşmeniz bulunmuyor.</Text>
                  <Button
                    onPress={() => router.push('/contracts/new')}
                    size="sm"
                    style={{ marginTop: 16 }}
                  >
                    İlk Akıllı Sözleşmenizi Başlatın
                  </Button>
                </View>
              ) : (
                myContracts.slice(0, 4).map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.tableRow}
                    onPress={() => router.push(`/contracts/${c.id}` as any)}
                  >
                    <View style={styles.rowLeft}>
                      <Text style={styles.rowTitle} numberOfLines={1}>
                        {c.title}
                      </Text>
                      <Text style={styles.rowId}>
                        {c.id.slice(0, 14)}...
                      </Text>
                    </View>
                    <View style={styles.rowRight}>
                      <Text style={styles.rowAmount}>
                        {mistToSui(c.total_budget)} SUI
                      </Text>
                      <View
                        style={[
                          styles.badge,
                          { borderColor: getStatusColor(c.status).border },
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            { color: getStatusColor(c.status).text },
                          ]}
                        >
                          {getStatusLabel(c.status)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
        )}

        {/* ── PAZAR YERİ ── */}
        {activeTab === 'Pazar Yeri' && (
          <View style={styles.section}>
            {loading ? (
              <View style={styles.emptyContainer}>
                <ActivityIndicator color={COLORS.primary} size="small" />
              </View>
            ) : openJobs.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Pazar yerinde henüz açık ilan bulunmuyor.</Text>
              </View>
            ) : (
              <View style={styles.marketplaceGrid}>
                {openJobs.map((job) => (
                  <TouchableOpacity
                    key={job.id}
                    style={styles.jobCard}
                    onPress={() => router.push(`/contracts/${job.id}` as any)}
                  >
                    <View style={styles.jobHeader}>
                      <Text style={styles.jobBudget}>
                        {mistToSui(job.total_budget)} SUI
                      </Text>
                      <ArrowRight size={16} color={COLORS.mutedForeground} />
                    </View>
                    <Text style={styles.jobTitle} numberOfLines={1}>
                      {job.title}
                    </Text>
                    <Text style={styles.jobDesc} numberOfLines={2}>
                      {job.description || 'İş tanımı ve teslimat detayları belirtilmemiş.'}
                    </Text>
                    <Text style={styles.jobClient}>
                      {job.client.slice(0, 10)}...
                    </Text>
                  </TouchableOpacity>
                ))}
                {/* Daha fazla tile */}
                <TouchableOpacity
                  style={styles.moreCard}
                  onPress={() => router.push('/(tabs)/explore')}
                >
                  <Text style={styles.moreText}>Tüm Açık İlanları Keşfet</Text>
                  <ArrowRight size={16} color={COLORS.mutedForeground} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* ── SÖZLEŞMELERİM ── */}
        {activeTab === 'Sözleşmelerim' && (
          <View style={styles.section}>
            <View style={styles.tableCard}>
              {loading ? (
                <View style={styles.emptyContainer}>
                  <ActivityIndicator color={COLORS.primary} size="small" />
                </View>
              ) : myContracts.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Henüz dahil olduğunuz bir sözleşme kaydı bulunmuyor.</Text>
                  <Button
                    onPress={() => router.push('/contracts/new')}
                    size="sm"
                    style={{ marginTop: 16 }}
                  >
                    İlk Akıllı Sözleşmenizi Başlatın
                  </Button>
                </View>
              ) : (
                myContracts.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.tableRow}
                    onPress={() => router.push(`/contracts/${c.id}` as any)}
                  >
                    <View style={styles.rowLeft}>
                      <Text style={styles.rowTitle} numberOfLines={1}>
                        {c.title}
                      </Text>
                      <Text style={styles.rowId}>
                        {c.id.slice(0, 18)}...
                      </Text>
                    </View>
                    <View style={styles.rowRight}>
                      <Text style={styles.rowAmount}>
                        {mistToSui(c.total_budget)} SUI
                      </Text>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                          {getStatusLabel(c.status)}
                        </Text>
                      </View>
                      <ArrowRight size={14} color={COLORS.mutedForeground} />
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
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
  headerSubtitle: {
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
  },
  newBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 0,
  },
  newBtnText: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.background,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: SPACING['2xl'],
  },
  tabBtn: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginRight: 8,
  },
  tabBtnActive: { borderBottomColor: COLORS.primary },
  tabText: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    color: COLORS.mutedForeground,
  },
  tabTextActive: { color: COLORS.primary, fontWeight: '700' },
  section: { padding: SPACING['2xl'], gap: 24 },
  statsGrid: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  statCard: {
    flex: 1,
    padding: SPACING.xl,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    alignItems: 'flex-start',
  },
  statLabel: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    color: COLORS.mutedForeground,
    marginBottom: 8,
  },
  statValue: {
    fontFamily: FONTS.mono,
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.foreground,
  },
  statValueAccent: { color: COLORS.primary },
  tableCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableTitle: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.mutedForeground,
    letterSpacing: 2,
  },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  seeAllText: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    color: COLORS.primary,
  },
  emptyContainer: { paddingVertical: 48, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontFamily: FONTS.mono, fontSize: 12, color: COLORS.mutedForeground },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowLeft: { flex: 1, marginRight: 16 },
  rowTitle: { fontFamily: FONTS.sans, fontSize: 15, fontWeight: '700', color: COLORS.foreground, marginBottom: 4 },
  rowId: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.mutedForeground },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowAmount: { fontFamily: FONTS.mono, fontSize: 13, fontWeight: '700', color: COLORS.primary },
  badge: { borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontFamily: FONTS.mono, fontSize: 9, color: COLORS.foreground },
  marketplaceGrid: { gap: 16 },
  jobCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    gap: 8,
  },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  jobBudget: { fontFamily: FONTS.mono, fontSize: 18, fontWeight: '900', color: COLORS.primary },
  jobTitle: { fontFamily: FONTS.sans, fontSize: 16, fontWeight: '700', color: COLORS.foreground },
  jobDesc: { fontFamily: FONTS.sans, fontSize: 12, color: COLORS.mutedForeground, lineHeight: 18 },
  jobClient: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.mutedForeground, marginTop: 8 },
  moreCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    padding: SPACING['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  moreText: { fontFamily: FONTS.mono, fontSize: 12, color: COLORS.mutedForeground },
});
