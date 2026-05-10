import { Modal, View, ActivityIndicator, StyleSheet } from "react-native";
import { ThemedText } from "../ThemedText";
import { COLORS } from "../../constants/colors";

interface LoadingOverlayProps {
  visible: boolean;
}

export const LoadingOverlay = ({ visible }: LoadingOverlayProps) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <ThemedText style={styles.text}>İşlem bekleniyor...</ThemedText>
          <ThemedText variant="muted" style={styles.subtext}>
            Lütfen cüzdanınızdan onay verin
          </ThemedText>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: COLORS.card,
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  text: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "bold",
  },
  subtext: {
    marginTop: 8,
    fontSize: 14,
  },
});
