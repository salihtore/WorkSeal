import { View, ViewProps } from "react-native";
import { COLORS } from "../constants/colors";

export const ThemedView = ({ style, ...props }: ViewProps) => {
  return <View style={[{ backgroundColor: COLORS.background }, style]} {...props} />;
};
