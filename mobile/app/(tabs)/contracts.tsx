import { View, StyleSheet, FlatList, TextInput, TouchableOpacity, RefreshControl } from "react-native";
import { useContracts } from "../../hooks/use-contracts";
import { useWalletStore } from "../../hooks/use-wallet-store";
import { ContractCard } from "../../components/ui/ContractCard";
import { ThemedText } from "../../components/ThemedText";
import { COLORS } from "../../constants/colors";
import { ContractStatus } from "../../types";
import { useState } from "react";
import { Search, Filter, Plus } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function ContractsScreen() {
  const { getMyContracts, isLoading, refetch } = useContracts();
  const { address } = useWalletStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ContractStatus | "ALL">("ALL");
  const router = useRouter();

  const myContracts = getMyContracts();

  const filteredContracts = myContracts.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                         c.id.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" || c.status === filter;
    return matchesSearch && matchesFilter;
  });

  const filterOptions = [
    { label: "Tümü", value: "ALL" },
    { label: "Aktif", value: ContractStatus.Active },
    { label: "Bekliyor", value: ContractStatus.Created },
    { label: "Tamamlandı", value: ContractStatus.Completed },
    { label: "Anlaşmazlık", value: ContractStatus.Disputed },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Search size={20} color={COLORS.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Sözleşme ara..."
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          data={filterOptions}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.label}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setFilter(item.value as any)}
              style={[
                styles.filterBadge,
                filter === item.value ? styles.filterBadgeActive : null
              ]}
            >
              <ThemedText style={filter === item.value ? styles.filterTextActive : styles.filterText}>
                {item.label}
              </ThemedText>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filterList}
        />
      </View>

      <FlatList
        data={filteredContracts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ContractCard
            contract={item}
            currentUserAddress={address}
            onPress={() => router.push(`/contracts/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={COLORS.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ThemedText variant="muted">Sözleşme bulunamadı.</ThemedText>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/contracts/new")}
      >
        <Plus color="#fff" size={30} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    margin: 20,
    marginBottom: 12,
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
  filterContainer: {
    marginBottom: 16,
  },
  filterList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  filterBadgeActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    color: COLORS.muted,
  },
  filterTextActive: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  emptyState: {
    marginTop: 60,
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
