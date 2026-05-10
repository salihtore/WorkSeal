import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
} from "react-native";
import { COLORS } from "../../constants/colors";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, style, ...props }: InputProps) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error ? styles.inputError : null,
          props.multiline ? styles.multiline : null,
          style,
        ]}
        placeholderTextColor={COLORS.muted}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    color: COLORS.foreground,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    color: COLORS.foreground,
    fontSize: 16,
  },
  inputError: {
    borderColor: COLORS.destructive,
  },
  multiline: {
    height: 100,
    textAlignVertical: "top",
  },
  errorText: {
    color: COLORS.destructive,
    fontSize: 12,
    marginTop: 4,
  },
});
