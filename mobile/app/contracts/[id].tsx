import { View, StyleSheet, ScrollView, RefreshControl, Alert, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useContracts } from "../../hooks/use-contracts";
import { useWalletStore } from "../../hooks/use-wallet-store";
import { useTransaction } from "../../hooks/use-transaction";
import { ThemedText } from "../../components/ThemedText";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { MilestoneItem } from "../../components/ui/MilestoneItem";
import { LoadingOverlay } from "../../components/ui/LoadingOverlay";
import { COLORS } from "../../constants/colors";
import { ContractStatus, mistToSui, formatDate, formatAddress } from "../../types";
import { Shield, Users, Clock, AlertTriangle } from "lucide-react-native";
import { useState } from "react";

export default function ContractDetailScreen() {
  const { id } = useLocalSearchParams();
  const { getContractById, isLoading: isQueryLoading, refetch } = useContracts();
  const { address } = useWalletStore();
  const { fundContract, submitMilestone, approveAndRelease, raiseDispute, isPending } = useTransaction();
  const [disputeReason, setDisputeReason] = useState("");
  const [showDisputeForm, setShowDisputeForm] = useState(false);

  const contract = getContractById(id as string);

  if (isQueryLoading && !contract) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!contract) {
    return (
      <View style={styles.center}>
        <ThemedText>Sözleşme bulunamadı.</ThemedText>
      </View>
    );
  }

  const isClient = contract.client === address;
  const isFreelancer = contract.freelancer === address;
  const isParticipant = isClient || isFreelancer;

  const handleFund = async () => {
    try {
      await fundContract(contract.id, contract.total_budget);
      Alert.alert("Başarılı", "Fonlar escrow hesabına yüklendi.");
    } catch (e) {}
  };

  const handleSubmitMilestone = async (index: number) => {
    try {
      await submitMilestone(contract.id, index);
      Alert.alert("Başarılı", "Milestone teslim edildi.");
    } catch (e) {}
  };

  const handleApproveMilestone = async (index: number) => {
    try {
      await approveAndRelease(contract.id, index);
      Alert.alert("Başarılı", "Ödeme freelancer'a aktarıldı.");
    } catch (e) {}
  };

  const handleDispute = async () => {
    if (!disputeReason) return;
    try {
      await raiseDispute(contract.id, disputeReason);
      setShowDisputeForm(false);
      Alert.alert("Başarılı", "Anlaşmazlık süreci başlatıldı.");
    } catch (e) {}
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={isQueryLoading} onRefresh={refetch} tintColor={COLORS.primary} />}
      >
        <View style={styles.header}>
          <StatusBadge status={contract.status} />
          <ThemedText variant="title" style={styles.title}>{contract.title}</ThemedText>
          <ThemedText variant="muted">{contract.description}</ThemedText>
        </View>

        <Card style={styles.escrowCard} padding={20}>
          <View style={styles.escrowHeader}>
            <Shield size={24} color={COLORS.primary} />
            <ThemedText style={styles.escrowTitle}>Escrow Özeti</ThemedText>
          </View>
          <ThemedText style={styles.totalBudget}>{mistToSui(contract.total_budget)} SUI</ThemedText>
          <ThemedText variant="muted">Toplam Bütçe</ThemedText>
          
          {isClient && contract.status === ContractStatus.Created && (
            <Button 
              label="ESCROW YÜKLE" 
              onPress={handleFund} 
              loading={isPending} 
              style={{ marginTop: 20 }} 
            />
          )}
        </Card>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={20} color={COLORS.muted} />
            <ThemedText style={styles.sectionTitle}>Taraflar</ThemedText>
          </View>
          <View style={styles.partyRow}>
            <View>
              <ThemedText variant="muted" style={styles.partyLabel}>Müşteri</ThemedText>
              <ThemedText style={styles.partyValue}>
                {formatAddress(contract.client)} {isClient && "(Sen)"}
              </ThemedText>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <ThemedText variant="muted" style={styles.partyLabel}>Freelancer</ThemedText>
              <ThemedText style={styles.partyValue}>
                {formatAddress(contract.freelancer)} {isFreelancer && "(Sen)"}
              </ThemedText>
            </View>
          </View>
          <View style={styles.dateRow}>
            <Clock size={16} color={COLORS.muted} />
            <ThemedText variant="muted">Teslim Tarihi: {formatDate(contract.deadline)}</ThemedText>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Milestone Listesi</ThemedText>
          {contract.milestones.map((m, i) => (
            <MilestoneItem
              key={i}
              index={i}
              milestone={m}
              isPending={isPending}
              canSubmit={isFreelancer && contract.status === ContractStatus.Active}
              canApprove={isClient && contract.status === ContractStatus.Active}
              onSubmit={handleSubmitMilestone}
              onApprove={handleApproveMilestone}
            />
          ))}
        </View>

        {isParticipant && contract.status === ContractStatus.Active && (
          <View style={styles.disputeSection}>
            {showDisputeForm ? (
              <Card padding={16}>
                <ThemedText style={{ fontWeight: "bold", marginBottom: 12 }}>Anlaşmazlık Başlat</ThemedText>
                <TextInput
                  style={styles.disputeInput}
                  placeholder="Anlaşmazlık sebebini açıklayın..."
                  placeholderTextColor={COLORS.muted}
                  multiline
                  value={disputeReason}
                  onChangeText={setDisputeReason}
                />
                <View style={styles.disputeActions}>
                  <Button label="İPTAL" variant="ghost" onPress={() => setShowDisputeForm(false)} />
                  <Button label="GÖNDER" variant="destructive" onPress={handleDispute} loading={isPending} />
                </View>
              </Card>
            ) : (
              <Button
                label="ANLAŞMAZLIK BAŞLAT"
                variant="outline"
                onPress={() => setShowDisputeForm(true)}
                icon={<AlertTriangle size={18} color={COLORS.destructive} />}
                style={{ borderColor: COLORS.destructive }}
              />
            )}
          </View>
        )}

        {contract.status === ContractStatus.Disputed && contract.dispute_history.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: COLORS.destructive }]}>Anlaşmazlık Geçmişi</ThemedText>
            {contract.dispute_history.map((d, i) => (
              <Card key={i} style={styles.disputeCard} padding={12}>
                <ThemedText variant="muted" style={{ fontSize: 12 }}>{formatDate(d.timestamp)}</ThemedText>
                <ThemedText style={{ marginVertical: 4 }}>{d.reason}</ThemedText>
                <ThemedText variant="muted" style={{ fontSize: 10 }}>Başlatan: {formatAddress(d.raised_by)}</ThemedText>
              </Card>
            ))}
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>

      <LoadingOverlay visible={isPending} />
    </View>
  );
}

import { ActivityIndicator } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 24,
  },
  escrowCard: {
    margin: 20,
    alignItems: "center",
    backgroundColor: COLORS.cardAlt,
  },
  escrowHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  escrowTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalBudget: {
    fontSize: 36,
    fontWeight: "900",
    color: COLORS.primary,
  },
  section: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  partyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  partyLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  partyValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  disputeSection: {
    padding: 20,
  },
  disputeInput: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    padding: 12,
    color: COLORS.foreground,
    height: 100,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  disputeActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  disputeCard: {
    marginBottom: 12,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.destructive,
  }
});
