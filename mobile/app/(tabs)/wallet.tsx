/**
 * Integrated Wallet & Financial Hub (Slush Wallet + Escrow + Invoices)
 */

import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useWalletStore } from '@/lib/wallet-store';
import { useContracts } from '@/hooks/use-contracts';
import AppBackground from '@/components/AppBackground';
import {
  Send,
  QrCode,
  Droplets,
  ExternalLink,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Copy,
  Shield,
  LogOut,
} from 'lucide-react-native';
import { mistToSui, formatTimestamp } from '@/types';
import { COLORS, FONTS, SPACING } from '@/constants/theme';

export default function WalletFinancialHubScreen() {
  const { address, balance, isSyncing, fetchBalance, requestFaucet, disconnect } = useWalletStore();
  const { contracts, loading } = useContracts(address);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const handleDisconnect = async () => {
    Alert.alert('Cüzdanı Ayır', 'Sui cüzdan bağlantınızı kesmek istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: async () => {
          await disconnect();
          Alert.alert('Çıkış Yapıldı', 'Cüzdan bağlantısı başarıyla kesildi.');
        },
      },
    ]);
  };

  // Escrow ve finansal hesaplamalar
  let totalLocked = 0n;
  let totalReceived = 0n;
  let totalSent = 0n;
  const recentEscrowTx: any[] = [];

  if (address && contracts) {
    contracts.forEach((contract) => {
      const isClient = contract.client === address;
      const isFreelancer = contract.freelancer === address;

      contract.milestones.forEach((m, i) => {
        if (m.is_paid) {
          if (isClient) totalSent += BigInt(m.amount);
          if (isFreelancer) totalReceived += BigInt(m.amount);

          recentEscrowTx.push({
            id: `${contract.id.slice(0, 6)}-${i}`,
            contractId: contract.id,
            title: `${contract.title} - ${m.title}`,
            amount: mistToSui(m.amount),
            date: formatTimestamp(contract.created_at),
            type: isClient ? 'sent' : 'received',
            status: 'released',
          });
        } else if (contract.status === 1) {
          totalLocked += BigInt(m.amount);

          recentEscrowTx.push({
            id: `${contract.id.slice(0, 6)}-${i}`,
            contractId: contract.id,
            title: `${contract.title} - ${m.title}`,
            amount: mistToSui(m.amount),
            date: formatTimestamp(contract.created_at),
            type: 'locked',
            status: 'locked',
          });
        }
      });
    });
  }

  const approxUsd = (Number(balance.replace(',', '.')) * 3.5).toLocaleString('tr-TR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

  const handleCopy = () => {
    if (!address) return;
    Alert.alert('Cüzdan Adresi', 'Adres panoya kopyalandı:\n' + address);
  };

  const openExplorer = () => {
    if (!address) return;
    Linking.openURL(`https://suivision.xyz/account/${address}`);
  };

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
          <View>
            <Text style={styles.headerSubtitle}>SLUSH WALLET & ESCROW MERKEZİ</Text>
            <Text style={styles.title}>Cüzdan <Text style={styles.titleAccent}>& Finans</Text></Text>
          </View>
          <TouchableOpacity
            style={[styles.refreshBtn, isSyncing && styles.refreshBtnSpin]}
            onPress={fetchBalance}
            disabled={isSyncing}
          >
            <RefreshCw size={16} color={COLORS.primary} />
            <Text style={styles.refreshText}>{isSyncing ? 'Yenileniyor' : 'Yenile'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          {/* Varlık & Cüzdan Kartı */}
          <View style={styles.heroCard}>
            <View style={styles.heroTop}>
              <View style={styles.addressPill}>
                <Wallet size={12} color={COLORS.mutedForeground} />
                <Text style={styles.addressText}>
                  {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : 'Bağlı Değil'}
                </Text>
                <TouchableOpacity onPress={handleCopy}>
                  <Copy size={12} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
              <View style={styles.netBadge}>
                <Text style={styles.netText}>SUI TESTNET</Text>
              </View>
            </View>

            <View style={styles.balanceBox}>
              <Text style={styles.balanceLabel}>TOPLAM KULLANILABİLİR VARLIK</Text>
              <Text style={styles.balanceValue}>
                {balance} <Text style={styles.balanceUnit}>SUI</Text>
              </Text>
              <Text style={styles.usdValue}>≈ ${approxUsd} USD</Text>
            </View>

            {/* Aksiyon Barı */}
            <View style={styles.actionsGrid}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => router.push('/wallet/send' as any)}
              >
                <View style={styles.actionIconBox}>
                  <Send size={18} color={COLORS.background} />
                </View>
                <Text style={styles.actionLabel}>Gönder</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => router.push('/wallet/receive' as any)}
              >
                <View style={[styles.actionIconBox, styles.iconReceive]}>
                  <QrCode size={18} color={COLORS.primary} />
                </View>
                <Text style={styles.actionLabel}>Al</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={requestFaucet}
                disabled={isSyncing}
              >
                <View style={[styles.actionIconBox, styles.iconFaucet]}>
                  <Droplets size={18} color={COLORS.emerald} />
                </View>
                <Text style={styles.actionLabel}>Musluk</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} onPress={openExplorer}>
                <View style={[styles.actionIconBox, styles.iconExplorer]}>
                  <ExternalLink size={18} color={COLORS.mutedForeground} />
                </View>
                <Text style={styles.actionLabel}>Explorer</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── ESCROW DURUM ÖZETİ ── */}
          <View style={styles.subGrid}>
            <View style={styles.escrowStatCard}>
              <View style={styles.statTop}>
                <Shield size={16} color={COLORS.primary} />
                <Text style={styles.statSub}>ESCROW'DA KİLİTLİ</Text>
              </View>
              <Text style={[styles.statVal, { color: COLORS.primary }]}>
                {mistToSui(totalLocked)} <Text style={styles.statUnit}>SUI</Text>
              </Text>
            </View>

            <View style={styles.escrowStatCard}>
              <View style={styles.statTop}>
                <ArrowDownLeft size={16} color={COLORS.emerald} />
                <Text style={styles.statSub}>SERBEST BIRAKILAN</Text>
              </View>
              <Text style={styles.statVal}>
                {mistToSui(totalReceived)} <Text style={styles.statUnit}>SUI</Text>
              </Text>
            </View>
          </View>

          {/* ── SON FİNANSAL İŞLEMLER ── */}
          <View style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>SON FİNANSAL İŞLEMLER</Text>
              <Text style={styles.historySub}>Akıllı Sözleşme Kilitleri & On-Chain Varlık Transferleri</Text>
            </View>

            {recentEscrowTx.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Cüzdanınızla ilişkilendirilmiş herhangi bir on-chain finansal hareket bulunmuyor.</Text>
              </View>
            ) : (
              <View style={styles.historyList}>
                {recentEscrowTx.slice(0, 5).map((tx, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.historyItem}
                    onPress={() => router.push(`/contracts/${tx.contractId}` as any)}
                  >
                    <View style={styles.itemLeft}>
                      <View
                        style={[
                          styles.txIconBox,
                          tx.type === 'received' || tx.status === 'released'
                            ? { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.2)' }
                            : tx.type === 'locked'
                            ? { backgroundColor: 'rgba(79,195,247,0.1)', borderColor: 'rgba(79,195,247,0.2)' }
                            : { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: COLORS.border },
                        ]}
                      >
                        {tx.type === 'received' || tx.status === 'released' ? (
                          <ArrowDownLeft size={16} color={COLORS.emerald} />
                        ) : tx.type === 'locked' ? (
                          <Shield size={16} color={COLORS.primary} />
                        ) : (
                          <ArrowUpRight size={16} color={COLORS.mutedForeground} />
                        )}
                      </View>
                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text style={styles.txTitle} numberOfLines={1}>
                          {tx.title}
                        </Text>
                        <Text style={styles.txDate}>
                          {tx.date} · {tx.status === 'locked' ? 'Kilitli Escrow' : 'Serbest Bırakıldı'}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.txAmount,
                        tx.type === 'received' || tx.status === 'released'
                          ? { color: COLORS.emerald }
                          : tx.type === 'locked'
                          ? { color: COLORS.primary }
                          : { color: COLORS.mutedForeground },
                      ]}
                    >
                      {tx.type === 'sent' ? '-' : '+'}{tx.amount} SUI
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* ── CÜZDANI AYIR BUTONU ── */}
          {address ? (
            <View style={styles.disconnectBox}>
              <TouchableOpacity
                style={styles.disconnectBtn}
                onPress={handleDisconnect}
              >
                <LogOut size={18} color="#ffffff" />
                <Text style={styles.disconnectText}>Cüzdanı Ayır</Text>
              </TouchableOpacity>
            </View>
          ) : null}
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
  titleAccent: { color: COLORS.primary },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(79,195,247,0.3)',
    backgroundColor: 'rgba(79,195,247,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  refreshBtnSpin: { opacity: 0.5 },
  refreshText: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.primary, textTransform: 'uppercase' },
  section: { padding: SPACING['2xl'], gap: 20 },
  heroCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING['2xl'],
    gap: 24,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addressText: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.foreground, fontWeight: '700' },
  netBadge: { backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.2)', paddingHorizontal: 8, paddingVertical: 4 },
  netText: { fontFamily: FONTS.mono, fontSize: 9, color: COLORS.emerald, fontWeight: '700' },
  balanceBox: { alignItems: 'center', marginVertical: 12 },
  balanceLabel: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.mutedForeground, letterSpacing: 2, marginBottom: 8 },
  balanceValue: { fontFamily: FONTS.sans, fontSize: 44, fontWeight: '900', color: COLORS.foreground, letterSpacing: -1 },
  balanceUnit: { fontSize: 22, color: COLORS.primary, fontWeight: '400' },
  usdValue: { fontFamily: FONTS.mono, fontSize: 13, color: COLORS.mutedForeground, marginTop: 4 },
  actionsGrid: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 20, borderTopWidth: 1, borderTopColor: COLORS.border },
  actionBtn: { alignItems: 'center', gap: 8 },
  actionIconBox: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconReceive: { backgroundColor: 'rgba(79,195,247,0.1)', borderColor: 'rgba(79,195,247,0.3)' },
  iconFaucet: { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)' },
  iconExplorer: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: COLORS.border },
  actionLabel: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.foreground, fontWeight: '700' },
  subGrid: { flexDirection: 'row', gap: 16 },
  escrowStatCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    gap: 10,
  },
  statTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statSub: { fontFamily: FONTS.mono, fontSize: 10, color: COLORS.mutedForeground, letterSpacing: 1.5 },
  statVal: { fontFamily: FONTS.mono, fontSize: 22, fontWeight: '900', color: COLORS.foreground },
  statUnit: { fontSize: 13, color: COLORS.mutedForeground, fontWeight: '400' },
  historyCard: { borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card },
  historyHeader: { padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  historyTitle: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.mutedForeground, letterSpacing: 2, marginBottom: 4 },
  historySub: { fontFamily: FONTS.sans, fontSize: 12, color: COLORS.mutedForeground },
  historyList: {},
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  txIconBox: { width: 40, height: 40, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  txTitle: { fontFamily: FONTS.sans, fontSize: 15, fontWeight: '700', color: COLORS.foreground, marginBottom: 4 },
  txDate: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.mutedForeground },
  txAmount: { fontFamily: FONTS.mono, fontSize: 14, fontWeight: '700', color: COLORS.foreground },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { fontFamily: FONTS.mono, fontSize: 12, color: COLORS.mutedForeground },
  disconnectBox: { marginTop: 12, width: '100%', marginBottom: 20 },
  disconnectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    borderWidth: 1,
    borderColor: '#dc2626',
    paddingVertical: 16,
    gap: 10,
  },
  disconnectText: { fontFamily: FONTS.mono, fontSize: 14, fontWeight: '900', color: '#ffffff', letterSpacing: 1, textTransform: 'uppercase' },
});
