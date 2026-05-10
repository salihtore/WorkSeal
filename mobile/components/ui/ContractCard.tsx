import { TouchableOpacity, View, StyleSheet } from "react-native";
import { WorkContract, formatAddress, mistToSui, formatDate } from "../../types";
import { Card } from "./Card";
import { ThemedText } from "../ThemedText";
import { StatusBadge } from "./StatusBadge";
import { Badge } from "./Badge";
import { ChevronRight } from "lucide-react-native";
import { COLORS } from "../../constants/colors";

interface ContractCardProps {
  contract: WorkContract;
  currentUserAddress?: string | null;
  onPress: () => void;
}

export const ContractCard = ({
  contract,
  currentUserAddress,
  onPress,
}: ContractCardProps) => {
  const isClient = contract.client === currentUserAddress;
  const isFreelancer = contract.freelancer === currentUserAddress;
  const otherParty = isClient ? contract.freelancer : contract.client;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleArea}>
            <ThemedText variant="default" style={styles.title} numberOfLines={1}>
              {contract.title}
            </ThemedText>
            <ThemedText variant="muted" style={styles.address}>
              {formatAddress(otherParty)}
            </ThemedText>
          </View>
          <StatusBadge status={contract.status} />
        </View>

        <View style={styles.footer}>
          <View>
            <ThemedText variant="primary" style={styles.budget}>
              {mistToSui(contract.total_budget)} SUI
            </ThemedText>
            <ThemedText variant="muted" style={styles.date}>
              {formatDate(contract.created_at)}
            </ThemedText>
          </View>
          <View style={styles.roles}>
            {isClient && <Badge label="Müşteri" variant="primary" />}
            {isFreelancer && <Badge label="Freelancer" variant="success" />}
            <ChevronRight color={COLORS.muted} size={20} />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleArea: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  address: {
    fontSize: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  budget: {
    fontSize: 18,
    fontWeight: "800",
  },
  date: {
    fontSize: 12,
  },
  roles: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
