import { Text, TextProps, StyleSheet } from "react-native";
import { COLORS } from "../constants/colors";

interface ThemedTextProps extends TextProps {
  variant?: "default" | "muted" | "primary" | "destructive" | "title" | "subtitle";
}

export const ThemedText = ({ style, variant = "default", ...props }: ThemedTextProps) => {
  const getStyle = () => {
    switch (variant) {
      case "muted":
        return { color: COLORS.muted };
      case "primary":
        return { color: COLORS.primary };
      case "destructive":
        return { color: COLORS.destructive };
      case "title":
        return { color: COLORS.foreground, fontSize: 24, fontWeight: "bold" as const };
      case "subtitle":
        return { color: COLORS.muted, fontSize: 16 };
      default:
        return { color: COLORS.foreground };
    }
  };

  return <Text style={[getStyle(), style]} {...props} />;
};
