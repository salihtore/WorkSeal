/**
 * Disputes screen — mirrors frontend disputes/page.tsx
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { AlertTriangle, Clock, ChevronRight, CheckCircle2 } from 'lucide-react-native';
import { useWalletStore } from '@/lib/wallet-store';
import { useContracts } from '@/hooks/useContracts';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AppBackground from '@/components/AppBackground';
import { ContractStatus, formatTimestamp } from '@/types';
import { COLORS, FONTS, SPACING } from '@/constants/theme';

export default function DisputesScreen() {
  const { address } = useWalletStore();
  const { contracts, loading, fetchAllContracts } = useContracts(address);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllContracts();
    setRefreshing(false);
  };

  const myDisputes = contracts.filter((c) => c.status === ContractStatus.Disputed);
  const hasDisputes = myDisputes.length > 0;

  return (
    <View style={styles.container}>
      <AppBackground />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.destructive} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerLabel}>HUKUK & ÇÖZÜM</Text>
            <Text style={styles.title}>Anlaşmazlık{'\n'}Merkezi</Text>
          </View>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.push('/(app)/contracts')}
          >
            <Text style={styles.backBtnText}>Sözleşmelerim</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {loading ? (
          <LoadingSpinner label="KAYITLAR İNCELENİYOR" color={COLORS.destructive} />
        ) : !hasDisputes ? (
          /* Empty — all good */
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <CheckCircle2 size={30} color={COLORS.emerald} />
            </View>
            <Text style={styles.emptyTitle}>Her Şey Yolunda!</Text>
            <Text style={styles.emptyDesc}>
              Şu an için aktif bir anlaşmazlığınız bulunmuyor.
            </Text>
          </View>
        ) : (
          /* Disputes list */
          <View style={styles.disputeList}>
            {myDisputes.map((contract) => {
              const latestDispute =
                contract.dispute_history?.[contract.dispute_history.length - 1];
              return (
                <TouchableOpacity
                  key={contract.id}
                  style={styles.disputeCard}
                  onPress={() => router.push(`/contract/${contract.id}` as any)}
                  activeOpacity={0.7}
                >
                  <View style={styles.disputeTop}>
                    <View style={styles.disputeIconBox}>
                      <AlertTriangle size={20} color={COLORS.destructive} />
                    </View>

                    <View style={styles.disputeInfo}>
                      <View style={styles.disputeTitleRow}>
                        <Text style={styles.disputeTitle} numberOfLines={1}>
                          {contract.title}
                        </Text>
                        <View style={styles.disputeBadge}>
                          <Text style={styles.disputeBadgeText}>İNCELEMEDE</Text>
                        </View>
                      </View>

                      <View style={styles.disputeMeta}>
                        <Text style={styles.metaText}>
                          ID: {contract.id.slice(0, 10)}...
                        </Text>
                        <Text style={styles.metaDot}>·</Text>
                        <Clock size={10} color={COLORS.mutedForeground} />
                        <Text style={styles.metaText}>
                          {formatTimestamp(latestDispute?.timestamp || contract.created_at)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {latestDispute && (
                    <View style={styles.reasonBox}>
                      <Text style={styles.reason} numberOfLines={3}>
                        {latestDispute.reason}
                      </Text>
                    </View>
                  )}

                  <View style={styles.disputeFooter}>
                    <Text style={styles.detailText}>DETAYLAR</Text>
                    <ChevronRight size={14} color={COLORS.destructive} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.foreground,
    letterSpacing: -1,
    lineHeight: 36,
  },
  backBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 24,
  },
  backBtnText: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.foreground,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    backgroundColor: COLORS.emeraldBg,
    borderWidth: 1,
    borderColor: COLORS.emeraldBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: FONTS.sans,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.foreground,
    marginBottom: 8,
  },
  emptyDesc: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    color: COLORS.mutedForeground,
    textAlign: 'center',
    lineHeight: 16,
  },
  disputeList: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(248,113,113,0.3)',
  },
  disputeCard: {
    backgroundColor: COLORS.card,
    padding: SPACING['2xl'],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(248,113,113,0.3)',
  },
  disputeTop: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  disputeIconBox: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.redBg,
    borderWidth: 1,
    borderColor: COLORS.redBorder,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  disputeInfo: {
    flex: 1,
    gap: 6,
  },
  disputeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  disputeTitle: {
    fontFamily: FONTS.sans,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.foreground,
    flex: 1,
  },
  disputeBadge: {
    backgroundColor: COLORS.redBg,
    borderWidth: 1,
    borderColor: COLORS.redBorder,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  disputeBadgeText: {
    fontFamily: FONTS.mono,
    fontSize: 8,
    color: COLORS.destructive,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  disputeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    color: COLORS.mutedForeground,
  },
  metaDot: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    color: 'rgba(240,246,255,0.2)',
  },
  reasonBox: {
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderLeftWidth: 2,
    borderColor: 'rgba(248,113,113,0.2)',
    borderLeftColor: COLORS.destructive,
    backgroundColor: COLORS.redBg,
  },
  reason: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    color: 'rgba(240,246,255,0.8)',
    lineHeight: 16,
  },
  disputeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  detailText: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    color: COLORS.destructive,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
});
