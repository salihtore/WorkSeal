import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from "react-native";
import { useContracts } from "../../hooks/use-contracts";
import { useWalletStore } from "../../hooks/use-wallet-store";
import { ThemedText } from "../../components/ThemedText";
import { Card } from "../../components/ui/Card";
import { COLORS } from "../../constants/colors";
import { ContractStatus, mistToSui } from "../../types";
import { Shield, ArrowUpRight, ArrowDownLeft, Lock } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function EscrowScreen() {
  const { getMyContracts, isLoading, refetch } = useContracts();
  const { address } = useWalletStore();
  const router = useRouter();

  const myContracts = getMyContracts();
  const escrowContracts = myContracts.filter(c => c.status === ContractStatus.Active || c.status === ContractStatus.Created);

  const totalLocked = escrowContracts.reduce((sum, c) => sum + (c.status === ContractStatus.Active ? c.total_budget : BigInt(0)), BigInt(0));
  
  return (
    <View style={styles.container}>
      <View style={styles.summaryGrid}>
        <Card style={styles.mainSummary} padding={20}>
          <Lock size={24} color={COLORS.primary} style={{ marginBottom: 12 }} />
          <ThemedText variant="muted">Toplam Kilitli (Escrow)</ThemedText>
          <ThemedText style={styles.summaryValue}>{mistToSui(totalLocked)} SUI</ThemedText>
        </Card>
        
        <View style={styles.subGrid}>
          <Card style={styles.subCard} padding={12}>
            <ArrowUpRight size={20} color={COLORS.destructive} />
            <ThemedText variant="muted" style={styles.subLabel}>Gönderilen</ThemedText>
            <ThemedText style={styles.subValue}>0 SUI</ThemedText>
          </Card>
          <Card style={styles.subCard} padding={12}>
            <ArrowDownLeft size={20} color={COLORS.success} />
            <ThemedText variant="muted" style={styles.subLabel}>Alınan</ThemedText>
            <ThemedText style={styles.subValue}>0 SUI</ThemedText>
          </Card>
        </View>
      </View>

      <ThemedText style={styles.sectionTitle}>Aktif Escrow İşlemleri</ThemedText>

      <FlatList
        data={escrowContracts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/contracts/${item.id}`)} activeOpacity={0.7}>
            <Card style={styles.itemCard} padding={16}>
              <View style={styles.itemHeader}>
                <ThemedText style={styles.itemTitle}>{item.title}</ThemedText>
                <ThemedText variant="primary" style={styles.itemAmount}>{mistToSui(item.total_budget)} SUI</ThemedText>
              </View>
              <View style={styles.itemFooter}>
                <View style={[styles.statusTag, { backgroundColor: item.status === ContractStatus.Active ? COLORS.primaryLight : COLORS.secondary }]}>
                  <ThemedText style={{ color: item.status === ContractStatus.Active ? COLORS.primary : COLORS.muted, fontSize: 11, fontWeight: "bold" }}>
                    {item.status === ContractStatus.Active ? "ESCROW YÜKLÜ" : "FON BEKLENİYOR"}
                  </ThemedText>
                </View>
                <ThemedText variant="muted" style={styles.itemId}>ID: {item.id.slice(0, 10)}...</ThemedText>
              </View>
            </Card>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={COLORS.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Shield size={64} color={COLORS.muted} style={{ marginBottom: 16 }} />
            <ThemedText variant="muted">Aktif escrow işlemi bulunmuyor.</ThemedText>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  summaryGrid: {
    padding: 20,
    gap: 12,
  },
  mainSummary: {
    alignItems: "flex-start",
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: "800",
    marginTop: 4,
  },
  subGrid: {
    flexDirection: "row",
    gap: 12,
  },
  subCard: {
    flex: 1,
  },
  subLabel: {
    fontSize: 12,
    marginTop: 8,
  },
  subValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: 20,
    marginBottom: 16,
    marginTop: 10,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  itemCard: {
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    marginRight: 8,
  },
  itemAmount: {
    fontWeight: "800",
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  itemId: {
    fontSize: 10,
  },
  emptyState: {
    marginTop: 60,
    alignItems: "center",
  },
});
