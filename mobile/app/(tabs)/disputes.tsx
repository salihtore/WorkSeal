import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import { useContracts } from "../../hooks/use-contracts";
import { ThemedText } from "../../components/ThemedText";
import { Card } from "../../components/ui/Card";
import { COLORS } from "../../constants/colors";
import { ContractStatus, formatDate, formatAddress } from "../../types";
import { AlertTriangle, CheckCircle2 } from "lucide-react-native";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

export default function DisputesScreen() {
  const { getMyContracts, isLoading, refetch } = useContracts();
  const router = useRouter();

  const disputeContracts = getMyContracts().filter(c => c.status === ContractStatus.Disputed);

  return (
    <View style={styles.container}>
      <FlatList
        data={disputeContracts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const lastDispute = item.dispute_history[item.dispute_history.length - 1];
          return (
            <TouchableOpacity onPress={() => router.push(`/contracts/${item.id}`)} activeOpacity={0.7}>
              <Card style={styles.itemCard} padding={16}>
                <View style={styles.itemHeader}>
                  <ThemedText style={styles.itemTitle}>{item.title}</ThemedText>
                  <AlertTriangle size={20} color={COLORS.destructive} />
                </View>
                
                <ThemedText variant="muted" style={styles.disputeReason}>
                  "{lastDispute?.reason || "Sebep belirtilmedi"}"
                </ThemedText>

                <View style={styles.itemFooter}>
                  <View>
                    <ThemedText variant="muted" style={styles.label}>Başlatan</ThemedText>
                    <ThemedText style={styles.value}>{formatAddress(lastDispute?.raised_by || "")}</ThemedText>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <ThemedText variant="muted" style={styles.label}>Tarih</ThemedText>
                    <ThemedText style={styles.value}>{lastDispute ? formatDate(lastDispute.timestamp) : "-"}</ThemedText>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={COLORS.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.successCircle}>
              <CheckCircle2 size={48} color={COLORS.success} />
            </View>
            <ThemedText style={styles.emptyTitle}>Aktif anlaşmazlık yok</ThemedText>
            <ThemedText variant="muted" style={styles.emptyDesc}>
              Tüm sözleşmeleriniz sorunsuz bir şekilde devam ediyor.
            </ThemedText>
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
  listContent: {
    padding: 20,
  },
  itemCard: {
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.destructive,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  disputeReason: {
    fontStyle: "italic",
    backgroundColor: COLORS.secondary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 10,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  value: {
    fontSize: 13,
    fontWeight: "600",
  },
  emptyState: {
    marginTop: 80,
    alignItems: "center",
    paddingHorizontal: 40,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.successLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptyDesc: {
    textAlign: "center",
  },
});
