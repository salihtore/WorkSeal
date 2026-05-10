import { Tabs } from "expo-router";
import { COLORS } from "../../constants/colors";
import { Home, FileText, Shield, AlertTriangle, Compass, User } from "lucide-react-native";
import { Platform } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
          height: Platform.OS === "ios" ? 88 : 68,
          paddingBottom: Platform.OS === "ios" ? 30 : 10,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.muted,
        headerStyle: {
          backgroundColor: COLORS.background,
        },
        headerTintColor: COLORS.foreground,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="contracts"
        options={{
          title: "Sözleşmeler",
          tabBarIcon: ({ color, size }) => <FileText color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="escrow"
        options={{
          title: "Escrow",
          tabBarIcon: ({ color, size }) => <Shield color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="disputes"
        options={{
          title: "Anlaşmazlıklar",
          tabBarIcon: ({ color, size }) => <AlertTriangle color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Keşfet",
          tabBarIcon: ({ color, size }) => <Compass color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
