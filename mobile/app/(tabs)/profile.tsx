import { View, StyleSheet, ScrollView, Alert, Linking } from "react-native";
import { useWalletStore } from "../../hooks/use-wallet-store";
import { useWalletConnect } from "../../hooks/use-wallet-connect";
import { ThemedText } from "../../components/ThemedText";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { COLORS } from "../../constants/colors";
import { User, LogOut, ExternalLink, Globe, ShieldCheck } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { address, network, setNetwork } = useWalletStore();
  const { disconnect } = useWalletConnect();

  const handleLogout = () => {
    Alert.alert(
      "Çıkış Yap",
      "Cüzdan bağlantısını kesmek istediğinize emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        { text: "Evet, Çıkış Yap", style: "destructive", onPress: disconnect }
      ]
    );
  };

  const openExplorer = () => {
    const url = `https://suiscan.xyz/${network}/account/${address}`;
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <ThemedText style={styles.avatarText}>
            {address?.slice(2, 4).toUpperCase()}
          </ThemedText>
        </View>
        <ThemedText variant="title" style={styles.userName}>Anonim Kullanıcı</ThemedText>
        <ThemedText variant="muted" style={styles.address}>{address}</ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Hesap Ayarları</ThemedText>
        <Card padding={0}>
          <ProfileItem 
            icon={<ExternalLink size={20} color={COLORS.muted} />} 
            label="Explorer'da Görüntüle" 
            onPress={openExplorer} 
          />
          <ProfileItem 
            icon={<ShieldCheck size={20} color={COLORS.muted} />} 
            label="Doğrulanmış Profil" 
            value="Bekliyor"
            onPress={() => {}} 
          />
        </Card>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Ağ Seçimi</ThemedText>
        <Card padding={8}>
          <View style={styles.networkToggle}>
            {["mainnet", "testnet", "devnet"].map((n) => (
              <Button
                key={n}
                label={n.toUpperCase()}
                onPress={() => setNetwork(n as any)}
                variant={network === n ? "primary" : "ghost"}
                size="sm"
                style={{ flex: 1 }}
              />
            ))}
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <Button 
          label="ÇIKIŞ YAP" 
          onPress={handleLogout} 
          variant="destructive" 
          icon={<LogOut size={20} color="#fff" />} 
        />
      </View>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function ProfileItem({ icon, label, value, onPress }: { icon: any; label: string; value?: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.profileItem}>
      <View style={styles.profileItemLeft}>
        {icon}
        <ThemedText style={styles.profileItemLabel}>{label}</ThemedText>
      </View>
      <View style={styles.profileItemRight}>
        {value && <ThemedText variant="muted">{value}</ThemedText>}
      </View>
    </TouchableOpacity>
  );
}

import { TouchableOpacity } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  userName: {
    fontSize: 24,
  },
  address: {
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    marginTop: 8,
    paddingHorizontal: 40,
    textAlign: "center",
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: COLORS.muted,
    marginBottom: 12,
  },
  profileItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  profileItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profileItemLabel: {
    fontSize: 16,
  },
  profileItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  networkToggle: {
    flexDirection: "row",
    gap: 4,
  },
});
import { Platform } from "react-native";
