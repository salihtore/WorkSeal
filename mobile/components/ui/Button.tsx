import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";
import { COLORS } from "../../constants/colors";
import { ReactNode } from "react";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
}

export const Button = ({
  label,
  onPress,
  variant = "primary",
  size = "md",
  disabled,
  loading,
  icon,
}: ButtonProps) => {
  const getStyles = () => {
    let bg = COLORS.primary;
    let border = "transparent";
    let text = "#fff";

    if (variant === "outline") {
      bg = "transparent";
      border = COLORS.primary;
      text = COLORS.primary;
    } else if (variant === "ghost") {
      bg = "transparent";
      text = COLORS.primary;
    } else if (variant === "destructive") {
      bg = COLORS.destructive;
      text = "#fff";
    }

    if (disabled) bg = COLORS.secondary;

    return { bg, border, text };
  };

  const { bg, border, text } = getStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        styles[size],
        { backgroundColor: bg, borderColor: border, borderWidth: 1 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={text} />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={[styles.text, styles[`text_${size}`], { color: text }]}>
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 8,
  },
  sm: { paddingVertical: 8, paddingHorizontal: 16 },
  md: { paddingVertical: 14, paddingHorizontal: 24 },
  lg: { paddingVertical: 18, paddingHorizontal: 32 },
  text: { fontWeight: "bold" },
  text_sm: { fontSize: 14 },
  text_md: { fontSize: 16 },
  text_lg: { fontSize: 18 },
});
