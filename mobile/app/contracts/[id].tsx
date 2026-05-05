import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { getObject } from '@/lib/sui-client';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useWalletStore } from '@/hooks/use-wallet-store';
import { SuiTx } from '@/lib/sui-tx';

function mistToSui(mist: string | number): string {
  const val = Number(mist) / 1_000_000_000;
  return val.toFixed(2);
}

export default function ContractDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { address, isConnected, executeTransaction } = useWalletStore();
  
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'chat'>('details');
  const [message, setMessage] = useState('');
  const [isDisputeVisible, setIsDisputeVisible] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchContract();
  }, [id]);

  async function fetchContract() {
    setLoading(true);
    try {
      const result = await getObject(id as string);
      if (result.data?.content?.dataType === 'moveObject') {
        const fields = result.data.content.fields;
        setContract({
          ...fields,
          milestones: (fields.milestones || []).map((m: any) => m.fields || m),
        });
      }
    } catch (error) {
      console.error('Error fetching contract:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleAction = async (actionFn: () => any, successMsg: string) => {
    if (!isConnected) {
      alert('Please connect your wallet first.');
      return;
    }
    setActionLoading(true);
    try {
      const tx = actionFn();
      const result = await executeTransaction(tx);
      if (result?.digest) {
        alert(successMsg);
        fetchContract(); // Refresh data
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const isClient = address && contract?.client && address.toLowerCase() === contract.client.toLowerCase();
  const isFreelancer = address && contract?.freelancer && address.toLowerCase() === contract.freelancer.toLowerCase();
  const isNone = contract?.freelancer === '0x0000000000000000000000000000000000000000000000000000000000000000';

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator color="#4FC3F7" size="large" />
        <ThemedText style={styles.loadingText}>FETCHING CONTRACT DATA...</ThemedText>
      </ThemedView>
    );
  }

  if (!contract) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Contract not found.</ThemedText>
        <TouchableOpacity onPress={() => router.back()}>
          <ThemedText style={{ color: '#4FC3F7', marginTop: 16 }}>GO BACK</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ 
        headerTitle: 'CONTRACT DETAILS',
        headerShown: true,
        headerStyle: { backgroundColor: '#050810' },
        headerTintColor: '#4FC3F7',
        headerTitleStyle: { fontFamily: 'monospace', fontSize: 14, letterSpacing: 1 },
      }} />

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'details' && styles.tabActive]} 
          onPress={() => setActiveTab('details')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'details' && styles.tabTextActive]}>DETAILS</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'chat' && styles.tabActive]} 
          onPress={() => setActiveTab('chat')}
        >
          <ThemedText style={[styles.tabText, activeTab === 'chat' && styles.tabTextActive]}>CHAT</ThemedText>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'details' ? (
        <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ThemedText style={styles.label}>CONTRACT ID</ThemedText>
          <ThemedText style={styles.idText}>{id}</ThemedText>
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.title}>{contract.title}</ThemedText>
          <ThemedText style={styles.description}>{contract.description || 'No description provided.'}</ThemedText>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <ThemedText style={styles.statLabel}>BUDGET</ThemedText>
            <ThemedText style={styles.statValue}>{mistToSui(contract.total_budget)} SUI</ThemedText>
          </View>
          <View style={styles.statBox}>
            <ThemedText style={styles.statLabel}>STATUS</ThemedText>
            <ThemedText style={[styles.statValue, { color: '#4FC3F7' }]}>
              {contract.status === 0 ? 'OPEN' : contract.status === 1 ? 'ACTIVE' : 'COMPLETED'}
            </ThemedText>
          </View>
        </View>

        <View style={styles.infoSection}>
          <ThemedText style={styles.sectionLabel}>PARTICIPANTS</ThemedText>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoKey}>CLIENT</ThemedText>
            <ThemedText style={styles.infoVal}>{contract.client.slice(0, 14)}...</ThemedText>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoKey}>FREELANCER</ThemedText>
            <ThemedText style={styles.infoVal}>
              {contract.freelancer === '0x0000000000000000000000000000000000000000000000000000000000000000' 
                ? 'NONE (OPEN)' 
                : `${contract.freelancer.slice(0, 14)}...`}
            </ThemedText>
          </View>
        </View>

        {/* Milestones */}
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionLabel}>MILESTONES ({contract.milestones?.length})</ThemedText>
        </View>

        <View style={styles.milestoneList}>
          {contract.milestones?.map((m: any, i: number) => (
            <View key={i} style={[styles.milestoneItem, m.is_paid && styles.milestonePaid]}>
              <View style={styles.milestoneHeader}>
                <View style={[styles.milestoneBadge, m.is_paid ? styles.badgePaid : m.is_completed ? styles.badgeCompleted : styles.badgePending]}>
                  <ThemedText style={styles.badgeText}>{i + 1}</ThemedText>
                </View>
                <ThemedText style={[styles.milestoneTitle, m.is_paid && styles.textDim]}>{m.title}</ThemedText>
                <ThemedText style={styles.milestoneAmount}>{mistToSui(m.amount)} SUI</ThemedText>
              </View>
              
              {m.proof_link && (
                <View style={styles.proofBox}>
                  <ThemedText style={styles.proofLabel}>PROOF:</ThemedText>
                  <ThemedText style={styles.proofLink} numberOfLines={1}>{m.proof_link}</ThemedText>
                </View>
              )}

              {/* Actions for Client */}
              {isClient && m.is_completed && !m.is_paid && (
                <TouchableOpacity 
                  style={styles.approveBtn}
                  onPress={() => handleAction(() => SuiTx.approveAndRelease(id as string, i), 'Milestone approved and funds released!')}
                  disabled={actionLoading}
                >
                  <ThemedText style={styles.approveBtnText}>APPROVE & RELEASE</ThemedText>
                </TouchableOpacity>
              )}

              {/* Actions for Freelancer */}
              {isFreelancer && !m.is_completed && contract.status === 1 && (
                <TouchableOpacity 
                  style={styles.submitBtn}
                  onPress={() => handleAction(() => SuiTx.submitMilestone(id as string, i, 'https://workseal.link/proof', 'Work completed.'), 'Proof submitted for approval!')}
                  disabled={actionLoading}
                >
                  <ThemedText style={styles.submitBtnText}>SUBMIT PROOF</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Global Actions */}
        <View style={styles.actions}>
          {isNone && !isClient && (
            <TouchableOpacity 
              style={styles.mainBtn}
              onPress={() => handleAction(() => SuiTx.takeJob(id as string), 'You have successfully taken this job!')}
              disabled={actionLoading}
            >
              <ThemedText style={styles.mainBtnText}>TAKE THIS JOB</ThemedText>
            </TouchableOpacity>
          )}

          {isClient && contract.status === 0 && (
            <TouchableOpacity 
              style={[styles.mainBtn, { backgroundColor: '#F59E0B' }]}
              onPress={() => handleAction(() => SuiTx.fundContract(id as string, contract.total_budget), 'Contract successfully funded!')}
              disabled={actionLoading}
            >
              <ThemedText style={styles.mainBtnText}>FUND CONTRACT</ThemedText>
            </TouchableOpacity>
          )}

          {(isClient || isFreelancer) && contract.status === 1 && (
            <TouchableOpacity 
              style={styles.disputeBtn}
              onPress={() => {
                const reason = 'Work quality issues'; // This should come from a prompt
                handleAction(() => SuiTx.raiseDispute(id as string, reason), 'Dispute raised. An arbitrator will be assigned.');
              }}
              disabled={actionLoading}
            >
              <ThemedText style={styles.disputeBtnText}>RAISE DISPUTE</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
      ) : (
        <View style={styles.chatContainer}>
          <ScrollView contentContainerStyle={styles.chatScroll} ref={(ref) => ref?.scrollToEnd({ animated: true })}>
            {contract.messages && contract.messages.length > 0 ? (
              contract.messages.map((msg: any, i: number) => {
                const isMe = address && msg.sender.toLowerCase() === address.toLowerCase();
                return (
                  <View key={i} style={[styles.messageRow, isMe ? styles.messageMe : styles.messageThem]}>
                    <View style={[styles.messageBubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                      <ThemedText style={[styles.messageText, isMe && { color: '#050810' }]}>{msg.content}</ThemedText>
                    </View>
                    <ThemedText style={styles.messageTime}>{new Date(Number(msg.timestamp)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</ThemedText>
                  </View>
                );
              })
            ) : (
              <View style={styles.chatEmpty}>
                <ThemedText style={styles.emptyText}>No messages yet.</ThemedText>
              </View>
            )}
          </ScrollView>
          <View style={styles.inputArea}>
            <TextInput
              style={styles.chatInput}
              placeholder="Type a message..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={message}
              onChangeText={setMessage}
            />
            <TouchableOpacity 
              style={styles.sendBtn}
              onPress={() => {
                if (!message.trim()) return;
                handleAction(() => SuiTx.sendMessage(id as string, message), 'Message sent!');
                setMessage('');
              }}
              disabled={actionLoading}
            >
              <ThemedText style={styles.sendBtnText}>SEND</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 2,
    opacity: 0.5,
  },
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  label: {
    fontFamily: 'monospace',
    fontSize: 10,
    opacity: 0.5,
    marginBottom: 4,
  },
  idText: {
    fontFamily: 'monospace',
    fontSize: 12,
    opacity: 0.8,
  },
  card: {
    backgroundColor: '#0d1117',
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    opacity: 0.6,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 1,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#0d1117',
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  statLabel: {
    fontFamily: 'monospace',
    fontSize: 10,
    opacity: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: '#0d1117',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    marginBottom: 32,
  },
  sectionLabel: {
    fontFamily: 'monospace',
    fontSize: 10,
    opacity: 0.5,
    padding: 16,
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  infoKey: {
    fontSize: 12,
    opacity: 0.4,
  },
  infoVal: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  applyBtn: {
    backgroundColor: '#4FC3F7',
    padding: 18,
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#050810',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 8,
  },
  milestoneList: {
    gap: 12,
    marginBottom: 32,
  },
  milestoneItem: {
    backgroundColor: '#0d1117',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    padding: 16,
  },
  milestonePaid: {
    opacity: 0.6,
    backgroundColor: 'rgba(16, 185, 129, 0.03)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  milestoneBadge: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePending: { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  badgeCompleted: { backgroundColor: '#F59E0B' },
  badgePaid: { backgroundColor: '#10B981' },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  milestoneTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  milestoneAmount: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#4FC3F7',
  },
  textDim: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  proofBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    flexDirection: 'row',
    gap: 8,
  },
  proofLabel: {
    fontSize: 9,
    fontFamily: 'monospace',
    opacity: 0.5,
  },
  proofLink: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#4FC3F7',
    flex: 1,
  },
  approveBtn: {
    marginTop: 16,
    backgroundColor: '#10B981',
    padding: 12,
    alignItems: 'center',
  },
  approveBtnText: {
    color: '#050810',
    fontSize: 11,
    fontWeight: 'bold',
  },
  submitBtn: {
    marginTop: 16,
    backgroundColor: '#4FC3F7',
    padding: 12,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#050810',
    fontSize: 11,
    fontWeight: 'bold',
  },
  actions: {
    marginTop: 8,
  },
  mainBtn: {
    backgroundColor: '#4FC3F7',
    padding: 18,
    alignItems: 'center',
  },
  mainBtnText: {
    color: '#050810',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  disputeBtn: {
    marginTop: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.5)',
  },
  disputeBtnText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#050810',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#4FC3F7',
  },
  tabText: {
    fontFamily: 'monospace',
    fontSize: 11,
    opacity: 0.5,
  },
  tabTextActive: {
    opacity: 1,
    color: '#4FC3F7',
    fontWeight: 'bold',
  },
  chatContainer: {
    flex: 1,
  },
  chatScroll: {
    padding: 16,
    paddingBottom: 24,
  },
  messageRow: {
    marginBottom: 16,
    maxWidth: '85%',
  },
  messageMe: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  messageThem: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 2,
  },
  bubbleMe: {
    backgroundColor: '#4FC3F7',
  },
  bubbleThem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 9,
    opacity: 0.4,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  chatEmpty: {
    paddingVertical: 100,
    alignItems: 'center',
  },
  inputArea: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#050810',
    gap: 12,
  },
  chatInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
  },
  sendBtn: {
    backgroundColor: '#4FC3F7',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  sendBtnText: {
    color: '#050810',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
