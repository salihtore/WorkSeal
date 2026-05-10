import { View, StyleSheet } from "react-native";
import { Milestone, mistToSui } from "../../types";
import { ThemedText } from "../ThemedText";
import { Button } from "./Button";
import { CheckCircle2, Clock, Hourglass } from "lucide-react-native";
import { COLORS } from "../../constants/colors";

interface MilestoneItemProps {
  milestone: Milestone;
  index: number;
  onSubmit?: (index: number) => void;
  onApprove?: (index: number) => void;
  isPending?: boolean;
  canSubmit?: boolean;
  canApprove?: boolean;
}

export const MilestoneItem = ({
  milestone,
  index,
  onSubmit,
  onApprove,
  isPending,
  canSubmit,
  canApprove,
}: MilestoneItemProps) => {
  const getStatus = () => {
    if (milestone.is_paid) return { label: "ÖDENDİ", color: COLORS.success, icon: <CheckCircle2 size={18} color={COLORS.success} /> };
    if (milestone.is_completed) return { label: "TESLİM EDİLDİ", color: COLORS.info, icon: <Clock size={18} color={COLORS.info} /> };
    return { label: "BEKLIYOR", color: COLORS.muted, icon: <Hourglass size={18} color={COLORS.muted} /> };
  };

  const status = getStatus();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>{status.icon}</View>
        <View style={styles.titleContainer}>
          <ThemedText style={styles.title}>{milestone.title}</ThemedText>
          <ThemedText variant="muted" style={styles.amount}>
            {mistToSui(milestone.amount)} SUI
          </ThemedText>
        </View>
        <ThemedText style={[styles.statusLabel, { color: status.color }]}>
          {status.label}
        </ThemedText>
      </View>

      {canSubmit && !milestone.is_completed && (
        <Button
          label="TESLİM ET"
          onPress={() => onSubmit?.(index)}
          size="sm"
          loading={isPending}
          style={styles.actionButton}
        />
      )}

      {canApprove && milestone.is_completed && !milestone.is_paid && (
        <Button
          label="ONAYLA VE ÖDE"
          onPress={() => onApprove?.(index)}
          size="sm"
          loading={isPending}
          style={styles.actionButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  amount: {
    fontSize: 13,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "bold",
  },
  actionButton: {
    marginTop: 12,
  },
});
