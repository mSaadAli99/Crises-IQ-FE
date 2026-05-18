import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";

import { useColors } from "@/hooks/useColors";
import { useSignals } from "@/hooks/useCrises";
import { API_ENDPOINTS } from "@/constants/API";

const INCIDENT_TYPES = [
  { id: "flood", label: "Flood", icon: "water-outline", color: "#3B8DD4" },
  { id: "heatwave", label: "Heatwave", icon: "weather-sunny", color: "#F0883E" },
  { id: "accident", label: "Accident", icon: "car-back", color: "#FF6B6B" },
  { id: "roadblock", label: "Road Block", icon: "road-variant", color: "#8250DF" },
];

export default function ReportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  
  const [description, setDescription] = useState("");
  const [selectedType, setSelectedType] = useState("flood");
  const [locationName, setLocationName] = useState("Gulshan-e-Iqbal, Block 4");
  const [isEditingLoc, setIsEditingLoc] = useState(false);
  const [submitStep, setSubmitStep] = useState<"idle" | "ingesting" | "triage" | "success">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const { data: signals = [], isLoading: isLoadingSignals } = useSignals();

  const topPad = Platform.OS === "web" ? 20 : insets.top;

  const handleTriggerPipeline = async () => {
    if (!description.trim()) {
      setErrorMsg("Please provide a description of the incident.");
      return;
    }
    setErrorMsg("");
    setSubmitStep("ingesting");

    try {
      // Step 1: Ingest Signal via Agent 1 (Ingestion)
      const ingestRes = await fetch(API_ENDPOINTS.INGEST, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `[Category: ${selectedType.toUpperCase()}] ${description}`,
          source_type: "form",
          location: locationName,
          latitude: 24.9180,
          longitude: 67.0970,
        }),
      });

      if (!ingestRes.ok) {
        throw new Error("Failed to ingest signal");
      }

      const signal = await ingestRes.json();
      
      setSubmitStep("triage");

      // Step 2: Trigger AI Multi-Agent Triage Pipeline (Agent 2, 3, 4)
      const pipelineRes = await fetch(API_ENDPOINTS.PIPELINE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signal_ids: [signal.id],
          location: locationName,
        }),
      });

      if (!pipelineRes.ok) {
        throw new Error("Failed to trigger pipeline");
      }

      setSubmitStep("success");
      setDescription("");
      
      // Refresh cache so the new signal and home page/stats update instantly
      queryClient.invalidateQueries({ queryKey: ["signals"] });
      queryClient.invalidateQueries({ queryKey: ["crises"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard_stats"] });

      setTimeout(() => {
        setSubmitStep("idle");
      }, 3000);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred during triage.");
      setSubmitStep("idle");
    }
  };

  const getSubmitButtonConfig = () => {
    switch (submitStep) {
      case "ingesting":
        return { text: "Agent 1: Ingesting Raw Signal...", color: colors.warning, icon: "lightning-bolt" };
      case "triage":
        return { text: "Agents 2-4: Triage & Action Planning...", color: "#3FB950", icon: "robot-outline" };
      case "success":
        return { text: "Triage Pipeline Complete!", color: "#3FB950", icon: "check-all" };
      default:
        return { text: "Trigger Agent Triage Pipeline", color: "#3B8DD4", icon: "lightning-bolt" };
    }
  };

  const btnConfig = getSubmitButtonConfig();

  const getSignalSourceConfig = (source: string) => {
    const s = (source || "").toLowerCase();
    if (s.includes("weather")) return { color: colors.tint, label: "WEATHER" };
    if (s.includes("traffic")) return { color: colors.warning, label: "TRAFFIC" };
    if (s.includes("social")) return { color: "#1DA1F2", label: "SOCIAL" };
    return { color: "#3FB950", label: "FORM" };
  };

  return (
    <View style={[styles.container, { backgroundColor: "#0A0C10" }]}>
      <FlatList
        data={signals}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: topPad,
          paddingBottom: 100,
        }}
        ListHeaderComponent={
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoRow}>
                <MaterialCommunityIcons name="asterisk" size={24} color={colors.tint} />
                <Text style={styles.headerTitle}>CrisisIQ</Text>
              </View>
              <Text style={styles.locationText}>Karachi, PK</Text>
            </View>
 
            {/* Title */}
            <View style={styles.titleSection}>
              <Text style={styles.titleText}>Report an Incident</Text>
              <Text style={styles.subtitleText}>Real-time signal ingestion for AI triage and response.</Text>
            </View>
 
            {/* Incident Description */}
            <View style={styles.section}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>INCIDENT DESCRIPTION</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Describe what you see... (Urdu or English)"
                  placeholderTextColor="#484E5D"
                  multiline
                  value={description}
                  onChangeText={setDescription}
                  editable={submitStep === "idle"}
                />
              </View>
            </View>
 
            {/* Type Grid */}
            <View style={styles.typeGrid}>
              {INCIDENT_TYPES.map((type) => (
                <Pressable
                  key={type.id}
                  onPress={() => submitStep === "idle" && setSelectedType(type.id)}
                  style={[
                    styles.typeCard,
                    { 
                      backgroundColor: selectedType === type.id ? "#1C2128" : "#161B22",
                      borderColor: selectedType === type.id ? colors.tint : "#30363D" 
                    }
                  ]}
                >
                  <MaterialCommunityIcons name={type.icon as any} size={24} color={type.color} />
                  <Text style={styles.typeCardLabel}>{type.label}</Text>
                </Pressable>
              ))}
            </View>
 
            {/* Detected Location */}
            <View style={styles.locationSection}>
              <View style={styles.locationBox}>
                <View style={styles.locationInfo}>
                  <Text style={styles.locationLabel}>REPORTING LOCATION</Text>
                  {isEditingLoc ? (
                    <TextInput
                      style={{ color: "#E6EDF3", fontSize: 14, fontFamily: "Inter_600SemiBold", padding: 0 }}
                      value={locationName}
                      onChangeText={setLocationName}
                      autoFocus
                      onBlur={() => setIsEditingLoc(false)}
                      onSubmitEditing={() => setIsEditingLoc(false)}
                    />
                  ) : (
                    <Text style={styles.locationValue}>{locationName}</Text>
                  )}
                </View>
                <Pressable onPress={() => setIsEditingLoc(!isEditingLoc)}>
                  <Feather name={isEditingLoc ? "check" : "edit-2"} size={16} color="#8B949E" />
                </Pressable>
              </View>
            </View>

            {errorMsg ? (
              <Text style={{ color: colors.critical, fontSize: 12, marginBottom: 12, fontFamily: "Inter_600SemiBold" }}>
                {errorMsg}
              </Text>
            ) : null}
 
            {/* Action Button */}
            <Pressable 
              style={[styles.triggerBtn, { backgroundColor: btnConfig.color }]}
              onPress={handleTriggerPipeline}
              disabled={submitStep !== "idle"}
            >
              <MaterialCommunityIcons name={btnConfig.icon as any} size={20} color="#E6EDF3" />
              <Text style={styles.triggerBtnText}>{btnConfig.text}</Text>
            </Pressable>
 
            {/* Recent Reports Header */}
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>RECENT SECTOR SIGNALS</Text>
              <View style={styles.syncRow}>
                <Text style={styles.syncText}>Live Ingestion Sync</Text>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => {
          const cfg = getSignalSourceConfig(item.source_type);
          return (
            <View style={styles.reportItem}>
              <View style={[styles.reportIndicator, { backgroundColor: cfg.color }]} />
              <View style={styles.reportContent}>
                <Text style={styles.reportIdTitle} numberOfLines={2}>
                  <Text style={{ fontWeight: '700', color: '#8B949E' }}>SIG-{item.id}: </Text>
                  <Text style={{ color: '#E6EDF3' }}>{item.normalized_text || item.text}</Text>
                </Text>
                <Text style={styles.reportMeta}>
                  {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {item.location}
                </Text>
              </View>
              <View style={[styles.statusTag, { borderColor: cfg.color + '40' }]}>
                <Text style={[styles.statusTagText, { color: cfg.color }]}>{cfg.label}</Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    marginBottom: 10,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#E6EDF3",
    letterSpacing: -0.5,
  },
  locationText: {
    color: "#8B949E",
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  titleSection: {
    marginBottom: 24,
  },
  titleText: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#E6EDF3",
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 13,
    color: "#8B949E",
    fontFamily: "Inter_400Regular",
  },
  section: {
    marginBottom: 16,
  },
  inputContainer: {
    backgroundColor: "#111418",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1C2128",
  },
  inputLabel: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: "#484E5D",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  textArea: {
    fontSize: 15,
    color: "#E6EDF3",
    fontFamily: "Inter_400Regular",
    height: 80,
    textAlignVertical: "top",
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginBottom: 20,
  },
  typeCard: {
    width: '46%',
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  typeCardLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#8B949E",
  },
  locationSection: {
    marginBottom: 16,
  },
  locationBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111418",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1C2128",
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: "#484E5D",
    marginBottom: 4,
  },
  locationValue: {
    fontSize: 14,
    color: "#E6EDF3",
    fontFamily: "Inter_600SemiBold",
  },
  triggerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
    marginBottom: 32,
  },
  triggerBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#E6EDF3",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
  },
  listTitle: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: "#484E5D",
    letterSpacing: 0.5,
  },
  syncRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  syncText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: "#3B8DD4",
  },
  reportItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111418",
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
  },
  reportIndicator: {
    width: 3,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
  },
  reportContent: {
    flex: 1,
  },
  reportIdTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 2,
  },
  reportMeta: {
    fontSize: 11,
    color: "#8B949E",
    fontFamily: "Inter_400Regular",
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  statusTagText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
  },
});
