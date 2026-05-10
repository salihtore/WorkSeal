import { View, Text, StyleSheet } from "react-native";
import { ContractStatus, getStatusLabel, getStatusColors } from "../../types";

interface StatusBadgeProps {
  status: ContractStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const { bg, text, border } = getStatusColors(status);
  const label = getStatusLabel(status);

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 12,
    fontWeight: "bold",
  },
});
