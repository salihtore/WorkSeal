import { View, StyleSheet, FlatList, TextInput, RefreshControl, TouchableOpacity } from "react-native";
import { useContracts } from "../../hooks/use-contracts";
import { useWalletStore } from "../../hooks/use-wallet-store";
import { ThemedText } from "../../components/ThemedText";
import { Card } from "../../components/ui/Card";
import { COLORS } from "../../constants/colors";
import { formatAddress, mistToSui } from "../../types";
import { Search, Compass, Wallet } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function ExploreScreen() {
  const { getOpenJobs, isLoading, refetch } = useContracts();
  const { isConnected } = useWalletStore();
  const [search, setSearch] = useState("");
  const router = useRouter();

  const openJobs = getOpenJobs().filter(j => 
    j.title.toLowerCase().includes(search.toLowerCase()) || 
    j.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {!isConnected && (
        <View style={styles.banner}>
          <Wallet size={16} color="#fff" />
          <ThemedText style={styles.bannerText}>İşlem yapmak için cüzdan bağlantısı gereklidir.</ThemedText>
        </View>
      )}

      <View style={styles.searchBar}>
        <Search size={20} color={COLORS.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="İş ilanı ara..."
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={openJobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/contracts/${item.id}`)} activeOpacity={0.7}>
            <Card style={styles.jobCard} padding={16}>
              <ThemedText style={styles.jobTitle}>{item.title}</ThemedText>
              <ThemedText variant="muted" numberOfLines={3} style={styles.jobDesc}>
                {item.description}
              </ThemedText>
              
              <View style={styles.jobFooter}>
                <View>
                  <ThemedText variant="muted" style={styles.label}>Müşteri</ThemedText>
                  <ThemedText style={styles.value}>{formatAddress(item.client)}</ThemedText>
                </View>
                <View style={styles.priceContainer}>
                  <ThemedText variant="primary" style={styles.price}>{mistToSui(item.total_budget)} SUI</ThemedText>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={COLORS.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Compass size={64} color={COLORS.muted} style={{ marginBottom: 16 }} />
            <ThemedText variant="muted">Uygun iş ilanı bulunamadı.</ThemedText>
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
  banner: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 8,
  },
  bannerText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    margin: 20,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: COLORS.foreground,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  jobCard: {
    marginBottom: 16,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  jobDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  jobFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
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
  priceContainer: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  price: {
    fontWeight: "bold",
    fontSize: 16,
  },
  emptyState: {
    marginTop: 60,
    alignItems: "center",
  },
});
