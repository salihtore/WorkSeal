/**
 * Profile screen — mirrors frontend profile/page.tsx
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {
  User,
  Wallet,
  ExternalLink,
  Eye,
  EyeOff,
  Trophy,
  Shield,
  CheckCircle2,
  LogOut,
} from 'lucide-react-native';
import { useWalletStore } from '@/lib/wallet-store';
import { openConnectInSlush } from '@/lib/slush-links';
import { useContracts } from '@/hooks/use-contracts';
import AppBackground from '@/components/AppBackground';
import Input, { Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { mistToSui, ContractStatus } from '@/types';
import { COLORS, FONTS, SPACING } from '@/constants/theme';

export default function ProfileScreen() {
  const { address, disconnect, setAddress } = useWalletStore();
  const { contracts, loading, isArbitrator } = useContracts(address);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', title: '' });
  const [walletInput, setWalletInput] = useState(address ?? '');

  const completedAsFreelancer = contracts.filter(
    (c) => c.status === ContractStatus.Completed && c.freelancer === address
  );
  const successfulJobs = completedAsFreelancer.length;
  const totalEarned = completedAsFreelancer.reduce(
    (acc, c) => acc + BigInt(c.total_budget),
    0n
  );

  const handleDisconnect = async () => {
    await disconnect();
  };

  const handleSaveWalletAddress = async () => {
    const normalized = walletInput.trim();
    if (!/^0x[a-fA-F0-9]{64}$/.test(normalized)) return;
    await setAddress(normalized);
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
            <Text style={styles.headerLabel}>KİMLİK & PORTFÖY</Text>
            <Text style={styles.title}>Profil</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.editBtn, editing && styles.editBtnActive]}
              onPress={() => setEditing(!editing)}
            >
              <Text style={[styles.editBtnText, editing && styles.editBtnTextActive]}>
                {editing ? 'Kaydet' : 'Düzenle'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Identity Card */}
        <View style={styles.identityCard}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {isAnonymous ? (
                <Text style={styles.avatarText}>?</Text>
              ) : form.name ? (
                <Text style={styles.avatarText}>{form.name[0].toUpperCase()}</Text>
              ) : (
                <User size={32} color={COLORS.mutedForeground} />
              )}
            </View>
            {!isAnonymous && form.name && (
              <View style={styles.verifiedBadge}>
                <CheckCircle2 size={14} color={COLORS.primary} />
              </View>
            )}
          </View>

          {/* Name / Title */}
          {editing && !isAnonymous ? (
            <View style={styles.editFields}>
              <Input
                value={form.name}
                onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
                placeholder="Adın Soyadın"
                style={styles.centeredInput as any}
              />
              <Input
                value={form.title}
                onChangeText={(v) => setForm((p) => ({ ...p, title: v }))}
                placeholder="Unvan (örn. Developer)"
                style={styles.centeredInput as any}
              />
            </View>
          ) : (
            <View style={styles.nameContainer}>
              <Text style={styles.nameText}>
                {isAnonymous ? 'Anonim Kullanıcı' : form.name || 'İsim Eklenmedi'}
              </Text>
              {!isAnonymous && form.title && (
                <View style={styles.titleBadge}>
                  <Text style={styles.titleBadgeText}>{form.title.toUpperCase()}</Text>
                </View>
              )}
            </View>
          )}

          {/* Wallet Row */}
          <View style={styles.walletRow}>
            <View style={styles.walletInfo}>
              <Wallet size={12} color={COLORS.mutedForeground} />
              <View>
                <Text style={styles.walletLabel}>CÜZDAN</Text>
                <Text style={styles.walletAddress}>
                  {address
                    ? `${address.slice(0, 8)}...${address.slice(-6)}`
                    : 'Bağlı Değil'}
                </Text>
              </View>
            </View>
            {address && (
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(`https://suivision.xyz/account/${address}`)
                }
              >
                <ExternalLink size={16} color={COLORS.mutedForeground} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.slushActions}>
            <Button onPress={openConnectInSlush} size="sm" fullWidth>
              <ExternalLink size={14} color={COLORS.primaryForeground} />
              {'  '}Slush'ta WorkSeal'i Ac
            </Button>
            <Input
              value={walletInput}
              onChangeText={setWalletInput}
              placeholder="Slush public adresi (0x...)"
            />
            <Button onPress={handleSaveWalletAddress} variant="outline" size="sm" fullWidth>
              Slush Adresini Kaydet
            </Button>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Başarılı İş</Text>
              <Text style={styles.statValue}>
                {loading ? '—' : successfulJobs}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Kazanılan (SUI)</Text>
              <Text style={[styles.statValue, styles.statValueAccent]}>
                {loading ? '—' : mistToSui(totalEarned)}
              </Text>
            </View>
          </View>

          {/* Anonymous Toggle */}
          <View style={styles.anonymousRow}>
            <View style={styles.anonymousLeft}>
              {isAnonymous ? (
                <EyeOff size={16} color={COLORS.mutedForeground} />
              ) : (
                <Eye size={16} color={COLORS.primary} />
              )}
              <Text style={styles.anonymousLabel}>
                {isAnonymous ? 'Anonim Mod' : 'Görünür Profil'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.toggle, isAnonymous ? styles.toggleOff : styles.toggleOn]}
              onPress={() => setIsAnonymous(!isAnonymous)}
            >
              <View
                style={[
                  styles.toggleThumb,
                  isAnonymous ? styles.toggleThumbOff : styles.toggleThumbOn,
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <User size={13} color={COLORS.primary} /> Hakkımda
          </Text>
          {editing && !isAnonymous ? (
            <Textarea
              value={form.bio}
              onChangeText={(v) => setForm((p) => ({ ...p, bio: v }))}
              placeholder="Kendinden kısaca bahset..."
              rows={4}
            />
          ) : (
            <Text style={styles.bioText}>
              {isAnonymous
                ? 'Kullanıcı anonim kalmayı tercih etmiştir.'
                : form.bio || 'Biyografi eklenmedi.'}
            </Text>
          )}
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Trophy size={13} color={COLORS.primary} /> On-Chain Başarımlar
          </Text>
          <View style={styles.achievementBox}>
            {successfulJobs > 0 ? (
              <>
                <View style={styles.trophyIcon}>
                  <Trophy size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.achievementTitle}>Güvenilir Freelancer</Text>
                <Text style={styles.achievementDesc}>
                  {successfulJobs} sözleşmeyi başarıyla tamamladın.
                </Text>
              </>
            ) : (
              <>
                <View style={[styles.trophyIcon, styles.trophyIconEmpty]}>
                  <Trophy size={24} color={COLORS.mutedForeground} />
                </View>
                <Text style={styles.achievementDescEmpty}>
                  Henüz on-chain başarım bulunmuyor.
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Arbitrator Admin Panel */}
        {isArbitrator && (
          <View style={[styles.section, styles.adminSection]}>
            <Text style={[styles.sectionTitle, styles.adminTitle]}>
              <Shield size={13} color={COLORS.primary} /> Admin: Hakem Kaydı
            </Text>
            <Text style={styles.adminDesc}>
              Sözleşmeyi yayınlayan cüzdan ile yeni hakemler tanımlayabilirsiniz.
            </Text>
          </View>
        )}

        {/* Disconnect */}
        <View style={styles.section}>
          <Button
            onPress={handleDisconnect}
            variant="destructive"
            size="md"
            fullWidth
          >
            <LogOut size={14} color={COLORS.destructive} />
            {'  '}Cüzdanı Ayır
          </Button>
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
  headerLabel: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    color: COLORS.mutedForeground,
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
  headerActions: { flexDirection: 'row', gap: 8 },
  editBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.card,
  },
  editBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  editBtnText: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    color: COLORS.foreground,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  editBtnTextActive: { color: COLORS.primaryForeground },
  identityCard: {
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    padding: SPACING['2xl'],
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: { position: 'relative' },
  avatar: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FONTS.mono,
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.foreground,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 24,
    height: 24,
    backgroundColor: COLORS.blueBg,
    borderWidth: 1,
    borderColor: COLORS.blueBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editFields: { width: '100%', gap: 8 },
  centeredInput: { textAlign: 'center' },
  nameContainer: { alignItems: 'center', gap: 8 },
  nameText: {
    fontFamily: FONTS.sans,
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.foreground,
  },
  titleBadge: {
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  titleBadgeText: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    color: COLORS.mutedForeground,
    letterSpacing: 1.5,
  },
  walletRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.base,
  },
  walletInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  walletLabel: {
    fontFamily: FONTS.mono,
    fontSize: 8,
    color: COLORS.mutedForeground,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  walletAddress: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.foreground,
  },
  slushActions: { width: '100%', gap: 10 },
  statsRow: {
    width: '100%',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.base,
    alignItems: 'center',
  },
  statDivider: { width: 1, backgroundColor: COLORS.border },
  statLabel: {
    fontFamily: FONTS.mono,
    fontSize: 8,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  statValue: {
    fontFamily: FONTS.mono,
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.foreground,
  },
  statValueAccent: { color: COLORS.primary },
  anonymousRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  anonymousLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  anonymousLabel: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.foreground,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  toggle: {
    width: 40,
    height: 20,
    borderWidth: 1,
    position: 'relative',
  },
  toggleOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  toggleOff: { backgroundColor: 'transparent', borderColor: COLORS.border },
  toggleThumb: {
    width: 12,
    height: 12,
    position: 'absolute',
    top: 3,
  },
  toggleThumbOn: { right: 4, backgroundColor: COLORS.primaryForeground },
  toggleThumbOff: { left: 4, backgroundColor: COLORS.mutedForeground },
  section: {
    padding: SPACING['2xl'],
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  sectionTitle: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.foreground,
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: '700',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bioText: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    color: COLORS.mutedForeground,
    lineHeight: 18,
  },
  achievementBox: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING['2xl'],
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  trophyIcon: {
    width: 56,
    height: 56,
    backgroundColor: COLORS.blueBg,
    borderWidth: 1,
    borderColor: COLORS.blueBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  trophyIconEmpty: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor: COLORS.border,
  },
  achievementTitle: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.foreground,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 6,
  },
  achievementDesc: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.mutedForeground,
    textAlign: 'center',
  },
  achievementDescEmpty: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.mutedForeground,
    textAlign: 'center',
  },
  adminSection: {
    borderLeftWidth: 2,
    borderLeftColor: COLORS.primary,
  },
  adminTitle: {
    color: COLORS.primary,
  },
  adminDesc: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.mutedForeground,
    lineHeight: 15,
  },
});
