import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useWalletStore } from '@/hooks/use-wallet-store';
import { SuiTx } from '@/lib/sui-tx';

export default function NewContractScreen() {
  const router = useRouter();
  const { isConnected } = useWalletStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');

  const handleCreate = async () => {
    if (!isConnected || !useWalletStore.getState().address) {
      Alert.alert('Wallet Required', 'Please connect your wallet on the Dashboard first.');
      return;
    }
    if (!title || !budget) {
      Alert.alert('Missing Info', 'Please provide at least a title and a budget.');
      return;
    }

    try {
      const clientAddr = useWalletStore.getState().address!;
      const deadline = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days default
      const mistAmount = (Number(budget) * 1_000_000_000).toString();

      const tx = SuiTx.createContract(
        title,
        description,
        clientAddr,
        deadline,
        ['Initial Milestone'], // Default for simple mobile UI
        [mistAmount]
      );

      const result = await useWalletStore.getState().executeTransaction(tx);
      
      if (result?.digest) {
        Alert.alert('Success', 'Contract deployed to blockchain!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ 
        headerTitle: 'POST A JOB',
        headerShown: true,
        headerStyle: { backgroundColor: '#050810' },
        headerTintColor: '#4FC3F7',
        headerTitleStyle: { fontFamily: 'monospace', fontSize: 14, letterSpacing: 1 },
      }} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerInfo}>
          <ThemedText style={styles.infoText}>
            Creating a job will deploy a new Escrow contract on the Sui network.
          </ThemedText>
        </View>

        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>JOB TITLE</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="e.g. React Native Expert"
            placeholderTextColor="rgba(255,255,255,0.2)"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>DESCRIPTION</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the job requirements..."
            placeholderTextColor="rgba(255,255,255,0.2)"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View style={styles.formGroup}>
          <ThemedText style={styles.label}>BUDGET (SUI)</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor="rgba(255,255,255,0.2)"
            keyboardType="numeric"
            value={budget}
            onChangeText={setBudget}
          />
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleCreate}>
          <ThemedText style={styles.submitBtnText}>DEPLOY TO BLOCKCHAIN</ThemedText>
        </TouchableOpacity>

        <ThemedText style={styles.footerNote}>
          Funds will be locked in the escrow until you approve the work or a dispute is resolved.
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  headerInfo: {
    backgroundColor: 'rgba(79, 195, 247, 0.05)',
    padding: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#4FC3F7',
    marginBottom: 32,
  },
  infoText: {
    fontSize: 13,
    opacity: 0.7,
    lineHeight: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 1,
    opacity: 0.5,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    color: '#fff',
    fontSize: 15,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#4FC3F7',
    padding: 18,
    alignItems: 'center',
    marginTop: 16,
  },
  submitBtnText: {
    color: '#050810',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  footerNote: {
    fontSize: 11,
    opacity: 0.4,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 16,
  },
});
