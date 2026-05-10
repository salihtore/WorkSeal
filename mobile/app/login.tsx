import { View, StyleSheet, ActivityIndicator, Image } from "react-native";
import { useWalletConnect } from "../hooks/use-wallet-connect";
import { ThemedText } from "../components/ThemedText";
import { Button } from "../components/ui/Button";
import { AppBackground } from "../components/AppBackground";
import { COLORS } from "../constants/colors";
import { Shield, Zap, FileText, Wallet } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const { connect, isConnecting, error } = useWalletConnect();

  return (
    <SafeAreaView style={styles.container}>
      <AppBackground />
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Shield size={48} color={COLORS.primary} />
          </View>
          <ThemedText variant="title" style={styles.title}>WorkSeal</ThemedText>
          <ThemedText variant="muted" style={styles.subtitle}>
            Blockchain tabanlı freelance sözleşmeleri
          </ThemedText>
        </View>

        <View style={styles.features}>
          <FeatureItem 
            icon={<FileText size={24} color={COLORS.primary} />} 
            text="Akıllı sözleşmeler ile güvenli anlaşmalar" 
          />
          <FeatureItem 
            icon={<Shield size={24} color={COLORS.primary} />} 
            text="Escrow sistemi ile ödeme garantisi" 
          />
          <FeatureItem 
            icon={<Zap size={24} color={COLORS.primary} />} 
            text="Hızlı ve şeffaf işlem kaydı" 
          />
        </View>

        <View style={styles.buttonContainer}>
          {error && (
            <ThemedText variant="destructive" style={styles.error}>
              {error}
            </ThemedText>
          )}
          
          <Button
            label={isConnecting ? "BAĞLANILIYOR..." : "SLUSH WALLET İLE BAĞLAN"}
            onPress={connect}
            loading={isConnecting}
            icon={<Wallet size={20} color="#fff" />}
          />
          
          <ThemedText variant="muted" style={styles.footerText}>
            Slush Wallet yüklü değilse App Store/Play Store üzerinden indirebilirsiniz.
          </ThemedText>
        </View>
      </View>
    </SafeAreaView>
  );
}

function FeatureItem({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>{icon}</View>
      <ThemedText style={styles.featureText}>{text}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  title: {
    fontSize: 32,
    letterSpacing: 1,
  },
  subtitle: {
    marginTop: 8,
    textAlign: "center",
  },
  features: {
    gap: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 16,
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  featureIcon: {
    marginRight: 16,
  },
  featureText: {
    fontSize: 15,
    fontWeight: "500",
  },
  buttonContainer: {
    marginBottom: 40,
  },
  error: {
    textAlign: "center",
    marginBottom: 16,
  },
  footerText: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 12,
  },
});
