import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Link, usePathname } from 'expo-router';
import { COLORS, FONTS } from '@/constants/theme';

import {
  LayoutDashboard,
  Search,
  FileText,
  Wallet,
  User,
  Scale,
} from 'lucide-react-native';

interface TabItem {
  href: string;
  path: string;
  label: string;
  Icon: React.ElementType;
}

const userTabs: TabItem[] = [
  { href: '/(tabs)/dashboard', path: '/dashboard', label: 'Ana', Icon: LayoutDashboard },
  { href: '/(tabs)/explore', path: '/explore', label: 'Keşfet', Icon: Search },
  { href: '/(tabs)/contracts', path: '/contracts', label: 'İşlerim', Icon: FileText },
  { href: '/(tabs)/wallet', path: '/wallet', label: 'Cüzdan', Icon: Wallet },
  { href: '/(tabs)/profile', path: '/profile', label: 'Profil', Icon: User },
];

const arbitratorTabs: TabItem[] = [
  { href: '/(tabs)/disputes', path: '/disputes', label: 'Yargı', Icon: Scale },
  { href: '/(tabs)/profile', path: '/profile', label: 'Profil', Icon: User },
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
        {tabs.map(({ href, path, label, Icon }) => {
          const active = pathname === path || pathname.startsWith(path + '/');
          return (
            <Link href={href as any} asChild replace key={href}>
              <TouchableOpacity
                style={styles.tab}
                activeOpacity={0.7}
              >
                <Icon
                  size={20}
                  color={active ? COLORS.primary : COLORS.mutedForeground}
                  strokeWidth={active ? 2.5 : 1.5}
                />
                <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
                  {label}
                </Text>
                {active && <View style={styles.indicator} />}
              </TouchableOpacity>
            </Link>
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
    paddingBottom: Platform.select({ ios: 34, android: 16 }) ?? 16,
  },
  bar: {
    flexDirection: 'row',
    height: 58,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: '100%',
    position: 'relative',
    paddingHorizontal: 2,
  },
  label: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    left: '20%',
    right: '20%',
    height: 2,
    backgroundColor: COLORS.primary,
  },
});
