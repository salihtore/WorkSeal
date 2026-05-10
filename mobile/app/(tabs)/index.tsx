import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { useWalletStore } from "../../hooks/use-wallet-store";
import { useContracts } from "../../hooks/use-contracts";
import { useWalletConnect } from "../../hooks/use-wallet-connect";
import { ThemedText } from "../../components/ThemedText";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ContractCard } from "../../components/ui/ContractCard";
import { formatAddress, mistToSui, ContractStatus } from "../../types";
import { COLORS } from "../../constants/colors";
import { Plus, Wallet, Shield, AlertTriangle, FileText, Compass } from "lucide-react-native";
import { useRouter } from "expo-router";
import { suiClient } from "../../lib/sui-client";
import { useEffect, useState } from "react";

export default function DashboardScreen() {
  const { address, isConnected } = useWalletStore();
  const { getMyContracts, getOpenJobs, isLoading, refetch } = useContracts();
  const { connect } = useWalletConnect();
  const router = useRouter();
  const [balance, setBalance] = useState("0");

  const myContracts = getMyContracts();
  const openJobs = getOpenJobs();

  useEffect(() => {
    if (address) {
      suiClient.getSuiBalance(address).then(b => setBalance(mistToSui(b)));
    }
  }, [address, myContracts]);

  const stats = [
    { label: "Aktif İş", value: myContracts.filter(c => c.status === ContractStatus.Active).length, icon: <FileText size={20} color={COLORS.primary} /> },
    { label: "Escrow", value: `${balance} SUI`, icon: <Shield size={20} color={COLORS.success} /> },
    { label: "Anlaşmazlık", value: myContracts.filter(c => c.status === ContractStatus.Disputed).length, icon: <AlertTriangle size={20} color={COLORS.destructive} /> },
  ];

  if (!isConnected) {
    return (
      <View style={styles.centerContainer}>
        <Card style={styles.loginCard}>
          <Wallet size={48} color={COLORS.primary} style={{ marginBottom: 16 }} />
          <ThemedText variant="title">Bağlı Değil</ThemedText>
          <ThemedText variant="muted" style={{ textAlign: "center", marginVertical: 16 }}>
            İşlemlerinizi görmek ve yeni sözleşme oluşturmak için cüzdanınızı bağlayın.
          </ThemedText>
          <Button label="CÜZDANI BAĞLA" onPress={connect} />
        </Card>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={COLORS.primary} />}
    >
      <View style={styles.header}>
        <View>
          <ThemedText variant="muted">Cüzdan Adresi</ThemedText>
          <ThemedText style={styles.addressText}>{formatAddress(address!)}</ThemedText>
        </View>
        <Button 
          label="YENİ" 
          onPress={() => router.push("/contracts/new")} 
          size="sm" 
          icon={<Plus size={16} color="#fff" />} 
        />
      </View>

      <View style={styles.statsGrid}>
        {stats.map((stat, i) => (
          <Card key={i} style={styles.statCard} padding={12}>
            {stat.icon}
            <ThemedText variant="muted" style={styles.statLabel}>{stat.label}</ThemedText>
            <ThemedText style={styles.statValue}>{stat.value}</ThemedText>
          </Card>
        ))}
      </View>

      <SectionHeader title="Son Sözleşmelerim" onSeeAll={() => router.push("/(tabs)/contracts")} />
      {myContracts.length > 0 ? (
        myContracts.slice(0, 4).map(c => (
          <ContractCard 
            key={c.id} 
            contract={c} 
            currentUserAddress={address} 
            onPress={() => router.push(`/contracts/${c.id}`)} 
          />
        ))
      ) : (
        <EmptyState 
          icon={<FileText size={48} color={COLORS.muted} />} 
          title="Henüz sözleşme yok" 
          description="İlk sözleşmeni oluşturmak için yukarıdaki '+' butonuna tıkla." 
        />
      )}

      <SectionHeader title="Pazar Yeri (Açık İşler)" onSeeAll={() => router.push("/(tabs)/explore")} />
      {openJobs.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {openJobs.slice(0, 5).map(job => (
            <TouchableOpacity 
              key={job.id} 
              onPress={() => router.push(`/contracts/${job.id}`)}
              style={styles.jobCard}
            >
              <Card padding={16} style={{ width: 240, height: 160 }}>
                <ThemedText numberOfLines={1} style={styles.jobTitle}>{job.title}</ThemedText>
                <ThemedText variant="muted" numberOfLines={2} style={styles.jobDesc}>{job.description}</ThemedText>
                <View style={styles.jobFooter}>
                  <ThemedText variant="primary" style={styles.jobPrice}>{mistToSui(job.total_budget)} SUI</ThemedText>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <EmptyState 
          icon={<Compass size={48} color={COLORS.muted} />} 
          title="Açık iş bulunamadı" 
          description="Şu an için pazar yerinde listelenen açık iş bulunmuyor." 
        />
      )}
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      <TouchableOpacity onPress={onSeeAll}>
        <ThemedText variant="primary">Tümünü Gör</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

function EmptyState({ icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <Card style={styles.emptyContainer} padding={24}>
      {icon}
      <ThemedText style={styles.emptyTitle}>{title}</ThemedText>
      <ThemedText variant="muted" style={styles.emptyDesc}>{description}</ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    padding: 40,
  },
  loginCard: {
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 10,
  },
  addressText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    alignItems: "flex-start",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  horizontalScroll: {
    marginBottom: 24,
  },
  jobCard: {
    marginRight: 12,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  jobDesc: {
    fontSize: 12,
    flex: 1,
  },
  jobFooter: {
    marginTop: 10,
  },
  jobPrice: {
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
  },
  emptyDesc: {
    textAlign: "center",
    marginTop: 8,
  },
});
