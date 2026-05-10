import { View, ViewProps, StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";

interface CardProps extends ViewProps {
  padding?: number;
}

export const Card = ({ children, style, padding = 16, ...props }: CardProps) => {
  return (
    <View style={[styles.card, { padding }, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
});
