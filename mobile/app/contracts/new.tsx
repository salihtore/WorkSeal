import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import { useRouter, Stack } from "expo-router";
import { ThemedText } from "../../components/ThemedText";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useTransaction } from "../../hooks/use-transaction";
import { COLORS } from "../../constants/colors";
import { Plus, Trash2, X } from "lucide-react-native";
import { suiToMist } from "../../types";

export default function NewContractScreen() {
  const router = useRouter();
  const { createContract, isPending } = useTransaction();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [deadlineDays, setDeadlineDays] = useState("30");
  const [milestones, setMilestones] = useState([{ title: "", amount: "" }]);

  const addMilestone = () => {
    setMilestones([...milestones, { title: "", amount: "" }]);
  };

  const removeMilestone = (index: number) => {
    if (milestones.length > 1) {
      const newMilestones = [...milestones];
      newMilestones.splice(index, 1);
      setMilestones(newMilestones);
    }
  };

  const updateMilestone = (index: number, field: "title" | "amount", value: string) => {
    const newMilestones = [...milestones];
    newMilestones[index][field] = value;
    setMilestones(newMilestones);
  };

  const totalBudget = milestones.reduce(
    (sum, m) => sum + (parseFloat(m.amount) || 0),
    0
  );

  const handleCreate = async () => {
    if (!title || !clientAddress || milestones.some(m => !m.title || !m.amount)) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }

    if (!clientAddress.startsWith("0x") || clientAddress.length < 20) {
      Alert.alert("Hata", "Geçerli bir müşteri adresi girin (0x...).");
      return;
    }

    const days = parseInt(deadlineDays);
    if (!days || days < 1) {
      Alert.alert("Hata", "Süre en az 1 gün olmalıdır.");
      return;
    }

    try {
      const deadlineMs = Date.now() + days * 24 * 60 * 60 * 1000;
      
      await createContract({
        title,
        description,
        client: clientAddress,
        deadline_ms: deadlineMs,
        milestone_titles: milestones.map(m => m.title),
        milestone_amounts: milestones.map(m => suiToMist(parseFloat(m.amount))),
      });

      Alert.alert("Başarılı", "Sözleşme oluşturuldu!", [
        { text: "Tamam", onPress: () => router.replace("/(tabs)/contracts") }
      ]);
    } catch (err: any) {
      // Error handled in hook
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Stack.Screen 
        options={{
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <X color={COLORS.foreground} size={24} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <Button 
              label="OLUŞTUR" 
              onPress={handleCreate} 
              size="sm" 
              loading={isPending} 
              disabled={isPending}
            />
          )
        }} 
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Section title="Genel Bilgiler">
          <Input
            label="Sözleşme Başlığı"
            placeholder="Örn: Mobil Uygulama Geliştirme"
            value={title}
            onChangeText={setTitle}
          />
          <Input
            label="Açıklama"
            placeholder="İş kapsamını detaylandırın..."
            multiline
            value={description}
            onChangeText={setDescription}
          />
          <Input
            label="Müşteri Cüzdan Adresi"
            placeholder="0x..."
            autoCapitalize="none"
            value={clientAddress}
            onChangeText={setClientAddress}
          />
          <Input
            label="Süre (Gün)"
            placeholder="30"
            keyboardType="numeric"
            value={deadlineDays}
            onChangeText={setDeadlineDays}
          />
        </Section>

        <Section title="Milestone'lar (Ödeme Planı)">
          {milestones.map((m, i) => (
            <Card key={i} style={styles.milestoneCard} padding={12}>
              <View style={styles.milestoneHeader}>
                <ThemedText style={styles.milestoneLabel}>Milestone #{i + 1}</ThemedText>
                {milestones.length > 1 && (
                  <TouchableOpacity onPress={() => removeMilestone(i)}>
                    <Trash2 size={18} color={COLORS.destructive} />
                  </TouchableOpacity>
                )}
              </View>
              <Input
                placeholder="Başlık (Örn: Tasarım Onayı)"
                value={m.title}
                onChangeText={(v) => updateMilestone(i, "title", v)}
              />
              <Input
                placeholder="Tutar (SUI)"
                keyboardType="numeric"
                value={m.amount}
                onChangeText={(v) => updateMilestone(i, "amount", v)}
              />
            </Card>
          ))}
          
          <Button
            label="MİLESTONE EKLE"
            variant="outline"
            onPress={addMilestone}
            icon={<Plus size={18} color={COLORS.primary} />}
            style={{ marginTop: 12 }}
          />
        </Section>

        <Card style={styles.totalCard} padding={20}>
          <ThemedText variant="muted">Toplam Bütçe</ThemedText>
          <ThemedText style={styles.totalAmount}>{totalBudget.toFixed(2)} SUI</ThemedText>
        </Card>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 16,
    textTransform: "uppercase",
  },
  milestoneCard: {
    marginBottom: 12,
  },
  milestoneHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  milestoneLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.muted,
  },
  totalCard: {
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.primary,
  },
});
