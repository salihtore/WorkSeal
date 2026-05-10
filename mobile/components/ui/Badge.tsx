import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";

interface BadgeProps {
  label: string;
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
}

export const Badge = ({ label, variant = "default" }: BadgeProps) => {
  const getStyles = () => {
    switch (variant) {
      case "primary":
        return { bg: COLORS.primaryLight, text: COLORS.primary };
      case "success":
        return { bg: COLORS.successLight, text: COLORS.success };
      case "warning":
        return { bg: COLORS.warningLight, text: COLORS.warning };
      case "destructive":
        return { bg: COLORS.destructiveLight, text: COLORS.destructive };
      default:
        return { bg: COLORS.secondary, text: COLORS.muted };
    }
  };

  const { bg, text } = getStyles();

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
});
