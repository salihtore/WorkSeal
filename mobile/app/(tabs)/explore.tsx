import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet, Pressable
} from 'react-native';
import { useWalletStore } from '@/hooks/use-wallet-store';
import { queryEvents, multiGetObjects } from '@/lib/sui-client';
import { useRouter } from 'expo-router';
import { WORKSEAL_PACKAGE_ID } from '@/constants/config';
const TESTNET_RPC = 'https://fullnode.testnet.sui.io/';

const SORT_TABS = ['Newest', 'Highest Budget', 'Lowest Budget'] as const;

function mistToSui(mist: string | number): string {
  const val = Number(mist) / 1_000_000_000;
  return val.toFixed(2);
}

export default function ExploreScreen() {
  const router = useRouter();
  const { isConnected } = useWalletStore();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeSort, setActiveSort] = useState<typeof SORT_TABS[number]>('Newest');

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      try {
        const events = await queryEvents({
          MoveEventType: `${WORKSEAL_PACKAGE_ID}::workseal::ContractCreatedEvent`
        });
        
        const ids = events.data?.map((e: any) => e.parsedJson.contract_id) || [];
        if (ids.length === 0) {
          setJobs([]);
          return;
        }

        const objects = await multiGetObjects(ids);
        const parsedJobs = objects
          .filter((obj: any) => obj.data?.content?.dataType === 'moveObject')
          .map((obj: any) => {
            const fields = obj.data.content.fields;
            return {
              id: fields.id.id,
              title: fields.title,
              description: fields.description,
              budget: fields.total_budget,
              client: fields.client,
              created_at: fields.created_at,
              freelancer: fields.freelancer
            };
          })
          .filter((job: any) => 
            !job.freelancer || 
            job.freelancer === '0x0000000000000000000000000000000000000000000000000000000000000000'
          );

        setJobs(parsedJobs);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  const filtered = useMemo(() => {
    const result = jobs.filter(j =>
      j.title?.toLowerCase().includes(search.toLowerCase())
    );
    if (activeSort === 'Highest Budget') {
      return [...result].sort((a, b) => Number(b.budget) - Number(a.budget));
    }
    if (activeSort === 'Lowest Budget') {
      return [...result].sort((a, b) => Number(a.budget) - Number(b.budget));
    }
    return [...result].sort((a, b) => Number(b.created_at) - Number(a.created_at));
  }, [jobs, search, activeSort]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.liveRow}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>
            {loading ? 'SYNCING...' : `${filtered.length} OPEN JOBS · LIVE`}
          </Text>
        </View>
        <Text style={styles.title}>Open{'\n'}<Text style={styles.titleAccent}>Jobs</Text></Text>
        <Text style={styles.subtitle}>
          Escrow-secured jobs on Sui network, waiting for freelancers.
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title or ID..."
          placeholderTextColor="rgba(255,255,255,0.3)"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Sort Tabs */}
      <View style={styles.sortRow}>
        {SORT_TABS.map(tab => (
          <Pressable
            key={tab}
            onPress={() => setActiveSort(tab)}
            style={[styles.sortTab, activeSort === tab && styles.sortTabActive]}
          >
            <Text style={[styles.sortTabText, activeSort === tab && styles.sortTabTextActive]}>
              {tab.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#4FC3F7" size="large" />
            <Text style={styles.loadingText}>BLOCKCHAIN SYNCING</Text>
          </View>
        ) : filtered.length > 0 ? (
          filtered.map((job, i) => (
            <TouchableOpacity 
              key={i} 
              style={styles.jobCard}
              onPress={() => router.push(`/contracts/${job.id}`)}
            >
              <View style={styles.jobCardTop}>
                <Text style={styles.jobBudget}>
                  {mistToSui(job.budget)}<Text style={styles.jobBudgetUnit}> SUI</Text>
                </Text>
                <Text style={styles.jobArrow}>→</Text>
              </View>
              <Text style={styles.jobTitle}>{job.title}</Text>
              <Text style={styles.jobDesc} numberOfLines={2}>
                {job.description || 'No description provided.'}
              </Text>
              <View style={styles.jobCardBottom}>
                <Text style={styles.jobClient}>
                  {job.client?.slice(0, 8)}...{job.client?.slice(-6)}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyDot}>·</Text>
            <Text style={styles.emptyText}>NO OPEN JOBS YET</Text>
            {!isConnected && (
              <Text style={styles.emptyHint}>
                Connect your wallet on Dashboard to post a job.
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050810' },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 24,
  },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  liveDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#4ade80',
  },
  liveText: {
    fontFamily: 'monospace', fontSize: 10,
    color: 'rgba(74, 222, 128, 0.7)', letterSpacing: 2,
  },
  title: { fontSize: 40, fontWeight: '900', color: '#F0F6FF', lineHeight: 44 },
  titleAccent: { color: 'rgba(240,246,255,0.35)' },
  subtitle: { color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 8, lineHeight: 20 },
  searchRow: { paddingHorizontal: 24, paddingVertical: 16 },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    color: '#F0F6FF', paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 13, fontFamily: 'monospace',
  },
  sortRow: {
    flexDirection: 'row',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 24, marginBottom: 16,
  },
  sortTab: {
    flex: 1, paddingVertical: 10, alignItems: 'center',
    borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.08)',
  },
  sortTabActive: { backgroundColor: '#4FC3F7' },
  sortTabText: { fontFamily: 'monospace', fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: 1 },
  sortTabTextActive: { color: '#050810', fontWeight: '700' },
  list: { paddingHorizontal: 24, paddingBottom: 100 },
  center: { alignItems: 'center', paddingVertical: 80, gap: 16 },
  loadingText: { fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 },
  jobCard: {
    backgroundColor: '#0d1117',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    padding: 20, marginBottom: 1,
  },
  jobCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  jobBudget: { fontFamily: 'monospace', fontSize: 22, fontWeight: '900', color: '#4FC3F7' },
  jobBudgetUnit: { fontSize: 12, color: 'rgba(79,195,247,0.5)' },
  jobArrow: { color: 'rgba(255,255,255,0.3)', fontSize: 16 },
  jobTitle: { fontSize: 17, fontWeight: '700', color: '#F0F6FF', marginBottom: 6 },
  jobDesc: { fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 20, marginBottom: 16 },
  jobCardBottom: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingTop: 12 },
  jobClient: { fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.35)' },
  empty: { alignItems: 'center', paddingVertical: 80, gap: 12 },
  emptyDot: { fontSize: 80, fontWeight: '900', color: 'rgba(255,255,255,0.1)' },
  emptyText: { fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: 2 },
  emptyHint: { fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center', paddingHorizontal: 32 },
});
