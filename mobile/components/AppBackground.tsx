import { View, StyleSheet, Dimensions } from "react-native";
import { COLORS } from "../constants/colors";

const { width, height } = Dimensions.get("window");

export const AppBackground = () => {
  return (
    <View style={styles.container}>
      {/* Mesh gradient simulation */}
      <View style={[styles.glow, { top: -height * 0.2, left: -width * 0.2, backgroundColor: COLORS.primaryLight }]} />
      <View style={[styles.glow, { bottom: -height * 0.2, right: -width * 0.2, backgroundColor: COLORS.accent }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
    zIndex: -1,
  },
  glow: {
    position: "absolute",
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width,
    opacity: 0.3,
  },
});
