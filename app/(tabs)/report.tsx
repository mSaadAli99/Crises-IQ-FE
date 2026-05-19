import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
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

import VerificationBadge from "@/components/VerificationBadge";
import { API_ENDPOINTS } from "@/constants/API";
import { useColors } from "@/hooks/useColors";
import { useSignals } from "@/hooks/useCrises";
import { invalidateCrisisQueries } from "@/lib/queryKeys";
import { screenPadding, tabBarClearance, textShrink } from "@/constants/layout";

async function parseApiError(res: Response, fallback: string): Promise<string> {
  const text = await res.text();
  if (text.includes("429") || text.toLowerCase().includes("quota")) {
    return "Gemini API quota exceeded. Wait ~1 minute or use a paid API key, then retry.";
  }
  try {
    const body = JSON.parse(text) as { detail?: unknown; message?: string };
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail)) {
      const joined = body.detail
        .map((d: { msg?: string }) => d.msg || "")
        .filter(Boolean)
        .join("; ");
      if (joined) return joined;
    }
    if (body.message) return String(body.message);
  } catch {
    if (text.length > 0 && text.length < 400) return text;
  }
  if (res.status === 429) {
    return "Gemini API quota exceeded. Wait ~1 minute or upgrade your API plan, then retry.";
  }
  return `${fallback} (HTTP ${res.status})`;
}

const INCIDENT_TYPES = [
  { id: "flood", label: "Flood", icon: "water-outline", color: "#3B8DD4" },
  { id: "heatwave", label: "Heatwave", icon: "weather-sunny", color: "#F0883E" },
  { id: "accident", label: "Accident", icon: "car-back", color: "#FF6B6B" },
  { id: "road_block", label: "Road Block", icon: "road-variant", color: "#8250DF" },
];

type SubmitStep = "idle" | "ingesting" | "forensics" | "triage" | "success";

export default function ReportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [description, setDescription] = useState("");
  const [selectedType, setSelectedType] = useState("flood");
  const [locationName, setLocationName] = useState("Gulshan-e-Iqbal, Block 4");
  const [isEditingLoc, setIsEditingLoc] = useState(false);
  const [submitStep, setSubmitStep] = useState<SubmitStep>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState("image/jpeg");

  const { data: signals = [] } = useSignals();

  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const reportText = `[Category: ${selectedType.toUpperCase()}] ${description}`;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Photo library permission is required to attach proof.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setImageMime(result.assets[0].mimeType || "image/jpeg");
      setErrorMsg("");
    }
  };

  const clearImage = () => {
    setImageUri(null);
    setImageMime("image/jpeg");
  };

  const appendImageToForm = async (formData: FormData, uri: string, mime: string) => {
    if (Platform.OS === "web") {
      const blobRes = await fetch(uri);
      const blob = await blobRes.blob();
      formData.append("image", blob, "proof.jpg");
    } else {
      formData.append("image", {
        uri,
        name: "proof.jpg",
        type: mime,
      } as unknown as Blob);
    }
  };

  const submitWithImage = async () => {
    setSubmitStep("forensics");
    const formData = new FormData();
    formData.append("text", reportText);
    formData.append("source_type", "form");
    formData.append("location", locationName);
    formData.append("latitude", "24.9180");
    formData.append("longitude", "67.0970");
    if (imageUri) {
      await appendImageToForm(formData, imageUri, imageMime);
    }

    const res = await fetch(API_ENDPOINTS.INGEST_WITH_IMAGE, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const message = await parseApiError(
        res,
        "Failed to ingest signal with image proof"
      );
      throw new Error(message);
    }
    return res.json();
  };

  const submitTextOnly = async () => {
    setSubmitStep("ingesting");
    const ingestRes = await fetch(API_ENDPOINTS.INGEST, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: reportText,
        source_type: "form",
        location: locationName,
        latitude: 24.918,
        longitude: 67.097,
      }),
    });
    if (!ingestRes.ok) {
      throw new Error("Failed to ingest signal");
    }
    const signal = await ingestRes.json();

    setSubmitStep("triage");
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
    return pipelineRes.json();
  };

  const handleTriggerPipeline = async () => {
    if (!description.trim()) {
      setErrorMsg("Please provide a description of the incident.");
      return;
    }
    setErrorMsg("");
    setSubmitStep(imageUri ? "forensics" : "ingesting");

    try {
      if (imageUri) {
        await submitWithImage();
      } else {
        await submitTextOnly();
      }

      setSubmitStep("success");
      setDescription("");
      clearImage();
      await invalidateCrisisQueries(queryClient);

      setTimeout(() => setSubmitStep("idle"), 3000);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : "An error occurred during triage.");
      setSubmitStep("idle");
    }
  };

  const getSubmitButtonConfig = () => {
    switch (submitStep) {
      case "ingesting":
        return { text: "Agent 1: Ingesting Raw Signal...", color: colors.warning, icon: "lightning-bolt" };
      case "forensics":
        return { text: "Agent 5: Image Forensics & Verification...", color: "#8250DF", icon: "shield-search" };
      case "triage":
        return { text: "Agents 2-4: Triage & Action Planning...", color: "#3FB950", icon: "robot-outline" };
      case "success":
        return { text: "Triage Pipeline Complete!", color: "#3FB950", icon: "check-all" };
      default:
        return {
          text: imageUri ? "Submit with Photo Proof" : "Trigger Agent Triage Pipeline",
          color: "#3B8DD4",
          icon: "lightning-bolt",
        };
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
          paddingBottom: tabBarClearance,
        }}
        ListHeaderComponent={
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.logoRow}>
                <MaterialCommunityIcons name="asterisk" size={24} color={colors.tint} />
                <Text style={styles.headerTitle}>CrisisIQ</Text>
              </View>
              <Text style={styles.locationText}>Karachi, PK</Text>
            </View>

            <View style={styles.titleSection}>
              <Text style={styles.titleText}>Report an Incident</Text>
              <Text style={styles.subtitleText}>
                Add optional photo proof for Agent 5 forensics and boosted verification.
              </Text>
            </View>

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

            <View style={styles.typeGrid}>
              {INCIDENT_TYPES.map((type) => (
                <Pressable
                  key={type.id}
                  onPress={() => submitStep === "idle" && setSelectedType(type.id)}
                  style={[
                    styles.typeCard,
                    {
                      backgroundColor: selectedType === type.id ? "#1C2128" : "#161B22",
                      borderColor: selectedType === type.id ? colors.tint : "#30363D",
                    },
                  ]}
                >
                  <MaterialCommunityIcons name={type.icon as never} size={24} color={type.color} />
                  <Text style={styles.typeCardLabel}>{type.label}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.photoSection}>
              <Text style={styles.inputLabel}>PHOTO PROOF (OPTIONAL)</Text>
              {imageUri ? (
                <View style={styles.photoPreviewWrap}>
                  <Image source={{ uri: imageUri }} style={styles.photoPreview} contentFit="cover" />
                  <Pressable style={styles.removePhotoBtn} onPress={clearImage} disabled={submitStep !== "idle"}>
                    <Feather name="x" size={16} color="#E6EDF3" />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  style={styles.photoPickerBtn}
                  onPress={pickImage}
                  disabled={submitStep !== "idle"}
                >
                  <MaterialCommunityIcons name="camera-plus-outline" size={28} color="#8B949E" />
                  <Text style={styles.photoPickerText}>Attach incident photo</Text>
                </Pressable>
              )}
            </View>

            <View style={styles.locationSection}>
              <View style={styles.locationBox}>
                <View style={styles.locationInfo}>
                  <Text style={styles.locationLabel}>REPORTING LOCATION</Text>
                  {isEditingLoc ? (
                    <TextInput
                      style={{
                        color: "#E6EDF3",
                        fontSize: 14,
                        fontFamily: "Inter_600SemiBold",
                        padding: 0,
                      }}
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
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            <Pressable
              style={[styles.triggerBtn, { backgroundColor: btnConfig.color }]}
              onPress={handleTriggerPipeline}
              disabled={submitStep !== "idle"}
            >
              <MaterialCommunityIcons
                name={btnConfig.icon as never}
                size={20}
                color="#E6EDF3"
                style={styles.triggerBtnIcon}
              />
              <Text style={[styles.triggerBtnText, textShrink]} numberOfLines={2}>
                {btnConfig.text}
              </Text>
            </Pressable>

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
          const hasVerification =
            item.verification_score != null || item.is_ai_generated || item.image_url;
          return (
            <View style={styles.reportItem}>
              <View style={styles.reportRow}>
                <View style={[styles.reportIndicator, { backgroundColor: cfg.color }]} />
                <View style={styles.reportContent}>
                  <Text style={[styles.reportIdTitle, textShrink]} numberOfLines={3}>
                    <Text style={{ fontWeight: "700", color: "#8B949E" }}>SIG-{item.id}: </Text>
                    <Text style={{ color: "#E6EDF3" }}>{item.normalized_text || item.text}</Text>
                  </Text>
                  <Text style={[styles.reportMeta, textShrink]} numberOfLines={1}>
                    {new Date(item.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    • {item.location}
                  </Text>
                </View>
              </View>
              <View style={styles.reportFooter}>
                <View style={[styles.statusTag, { borderColor: cfg.color + "40" }]}>
                  <Text style={[styles.statusTagText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
                {hasVerification ? (
                  <VerificationBadge
                    score={item.verification_score}
                    isAiGenerated={item.is_ai_generated}
                    compact
                  />
                ) : null}
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
  content: { paddingHorizontal: screenPadding },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
    paddingVertical: 12,
    marginBottom: 10,
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#E6EDF3",
    letterSpacing: -0.5,
  },
  locationText: { color: "#8B949E", fontSize: 14, fontFamily: "Inter_700Bold" },
  titleSection: { marginBottom: 24 },
  titleText: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#E6EDF3",
    marginBottom: 4,
  },
  subtitleText: { fontSize: 13, color: "#8B949E", fontFamily: "Inter_400Regular" },
  section: { marginBottom: 16 },
  inputContainer: {
    backgroundColor: "#111418",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1C2128",
    overflow: "hidden",
  },
  errorBox: {
    backgroundColor: "rgba(248,81,73,0.08)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(248,81,73,0.25)",
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: "#F85149",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 18,
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
    width: "47%",
    minWidth: 140,
    maxWidth: "48%",
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  typeCardLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#8B949E" },
  photoSection: { marginBottom: 16 },
  photoPickerBtn: {
    backgroundColor: "#111418",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#30363D",
    borderStyle: "dashed",
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  photoPickerText: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#8B949E" },
  photoPreviewWrap: { position: "relative", borderRadius: 12, overflow: "hidden" },
  photoPreview: { width: "100%", height: 160, borderRadius: 12 },
  removePhotoBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 16,
    padding: 6,
  },
  locationSection: { marginBottom: 16 },
  locationBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111418",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1C2128",
  },
  locationInfo: { flex: 1 },
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
    flexShrink: 1,
  },
  triggerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 32,
    overflow: "hidden",
  },
  triggerBtnIcon: { flexShrink: 0 },
  triggerBtnText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: "#E6EDF3",
    textAlign: "center",
    lineHeight: 20,
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
  syncRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  syncText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#3B8DD4" },
  reportItem: {
    backgroundColor: "#111418",
    marginHorizontal: screenPadding,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#1C2128",
    overflow: "hidden",
    gap: 10,
  },
  reportRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  reportIndicator: {
    width: 3,
    borderRadius: 2,
    marginRight: 12,
    alignSelf: "stretch",
    minHeight: 40,
  },
  reportContent: { flex: 1, minWidth: 0 },
  reportFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    paddingLeft: 15,
  },
  reportIdTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  reportMeta: { fontSize: 11, color: "#8B949E", fontFamily: "Inter_400Regular" },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  statusTagText: { fontSize: 11, fontFamily: "Inter_700Bold" },
});
