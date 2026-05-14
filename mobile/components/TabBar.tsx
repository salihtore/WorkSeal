import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { router, usePathname } from 'expo-router';
import { COLORS, FONTS, SPACING } from '@/constants/theme';

// Lucide icons for RN
import {
  LayoutDashboard,
  Search,
  FileText,
  AlertTriangle,
  User,
  Scale,
} from 'lucide-react-native';

interface TabItem {
  href: string;
  label: string;
  Icon: React.ElementType;
}

const userTabs: TabItem[] = [
  { href: '/(app)/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/(app)/explore', label: 'Keşfet', Icon: Search },
  { href: '/(app)/contracts', label: 'Sözleşmeler', Icon: FileText },
  { href: '/(app)/disputes', label: 'Anlaşmazlık', Icon: AlertTriangle },
  { href: '/(app)/profile', label: 'Profil', Icon: User },
];

const arbitratorTabs: TabItem[] = [
  { href: '/(app)/arbitrator', label: 'Yargı', Icon: Scale },
  { href: '/(app)/profile', label: 'Profil', Icon: User },
];

interface TabBarProps {
  isArbitrator?: boolean;
}

export default function TabBar({ isArbitrator = false }: TabBarProps) {
  const pathname = usePathname();
  const tabs = isArbitrator ? arbitratorTabs : userTabs;

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {tabs.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <TouchableOpacity
              key={href}
              style={styles.tab}
              onPress={() => router.push(href as any)}
              activeOpacity={0.7}
            >
              <Icon
                size={20}
                color={active ? COLORS.primary : COLORS.mutedForeground}
                strokeWidth={active ? 2.5 : 1.5}
              />
              <Text style={[styles.label, active && styles.labelActive]}>
                {label}
              </Text>
              {active && <View style={styles.indicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: Platform.select({ ios: 28, android: 8 }) ?? 8,
  },
  bar: {
    flexDirection: 'row',
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingTop: 4,
    position: 'relative',
  },
  label: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelActive: {
    color: COLORS.primary,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    left: '20%',
    right: '20%',
    height: 1,
    backgroundColor: COLORS.primary,
  },
});
