import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { WorkContract, mistToSui, formatAddress, formatTimestamp } from '@/types';
import { COLORS, FONTS, RADIUS, SPACING } from '@/constants/theme';
import StatusBadge from './ui/Badge';

interface ContractCardProps {
  contract: WorkContract;
  currentAddress?: string;
}

export default function ContractCard({ contract, currentAddress }: ContractCardProps) {
  const isClient = currentAddress?.toLowerCase() === contract.client.toLowerCase();
  const roleLabel = isClient ? 'Benim İlanım' : 'Müşteri: ' + formatAddress(contract.client);

  return (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.7}
      onPress={() => router.push(`/contract/${contract.id}` as any)}
    >
      <View style={styles.left}>
        <Text style={styles.title} numberOfLines={1}>{contract.title}</Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>
            {contract.id.slice(0, 10)}...
          </Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.metaText}>{roleLabel}</Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.budget}>
          {mistToSui(contract.total_budget)} SUI
        </Text>
        <StatusBadge status={contract.status} />
        <ChevronRight size={14} color={COLORS.mutedForeground} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING['2xl'],
    paddingVertical: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  left: {
    flex: 1,
    gap: 4,
    marginRight: 12,
  },
  title: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.foreground,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    color: COLORS.mutedForeground,
  },
  dot: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    color: 'rgba(240,246,255,0.2)',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  budget: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
