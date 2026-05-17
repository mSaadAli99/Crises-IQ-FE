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

import { useColors } from "@/hooks/useColors";

const INCIDENT_TYPES = [
  { id: "flood", label: "Flood", icon: "water-outline", color: "#E6EDF3" },
  { id: "heatwave", label: "Heatwave", icon: "feather", color: "#E6EDF3", isFeather: true },
  { id: "accident", label: "Accident", icon: "car-crash", color: "#FF8A6B" },
  { id: "roadblock", label: "Road Block", icon: "minus-circle-outline", color: "#E6EDF3" },
  { id: "infras", label: "Infras.", icon: "tools", color: "#E6EDF3" },
];

const RECENT_REPORTS = [
  { id: "ID-9928", title: "Heavy Water Logging", meta: "02m ago • University Rd.", status: "Processing", statusColor: "#3B8DD4" },
  { id: "ID-9921", title: "Power Line Down", meta: "14m ago • Block 13-D", status: "Detected", statusColor: "#F0883E" },
  { id: "ID-9915", title: "Medical Emergency", meta: "45m ago • Safari Park", status: "Resolved", statusColor: "#3FB950" },
  { id: "ID-9862", title: "Fallen Tree", meta: "2h ago • Millennium Mall", status: "Resolved", statusColor: "#3FB950" },
  { id: "ID-9851", title: "Drain Overflow", meta: "3h ago • NIPA Flyover", status: "Processing", statusColor: "#3B8DD4" },
];

export default function ReportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [description, setDescription] = useState("");
  const [selectedType, setSelectedType] = useState("flood");

  const topPad = Platform.OS === "web" ? 20 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: "#0A0C10" }]}>
      <FlatList
        data={RECENT_REPORTS}
        keyExtractor={(item) => item.id}
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
                />
              </View>
            </View>

            {/* Type Grid */}
            <View style={styles.typeGrid}>
              {INCIDENT_TYPES.map((type) => (
                <Pressable
                  key={type.id}
                  onPress={() => setSelectedType(type.id)}
                  style={[
                    styles.typeCard,
                    { 
                      backgroundColor: selectedType === type.id ? "#1C2128" : "#161B22",
                      borderColor: selectedType === type.id ? colors.tint : "#30363D" 
                    },
                    type.id === "infras" && { width: '48.5%' }
                  ]}
                >
                  {type.isFeather ? (
                    <View style={styles.featherContainer}>
                      <Text style={styles.featherText}>FEATHER</Text>
                      <Text style={styles.typeCardLabel}>Heatwave</Text>
                    </View>
                  ) : (
                    <>
                      <MaterialCommunityIcons name={type.icon as any} size={24} color={type.color} />
                      <Text style={styles.typeCardLabel}>{type.label}</Text>
                    </>
                  )}
                </Pressable>
              ))}
            </View>

            {/* Detected Location */}
            <View style={styles.locationSection}>
              <View style={styles.locationBox}>
                <View style={styles.locationInfo}>
                  <Text style={styles.locationLabel}>DETECTED LOCATION</Text>
                  <Text style={styles.locationValue}>Gulshan-e-Iqbal, Block 4</Text>
                </View>
                <Pressable>
                  <Feather name="edit-2" size={16} color="#8B949E" />
                </Pressable>
              </View>
            </View>

            {/* Action Button */}
            <Pressable style={[styles.triggerBtn, { backgroundColor: "#3B8DD4" }]}>
              <MaterialCommunityIcons name="lightning-bolt" size={20} color="#E6EDF3" />
              <Text style={styles.triggerBtnText}>Trigger Agent Pipeline</Text>
            </Pressable>

            {/* Recent Reports Header */}
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>RECENT SECTOR REPORTS</Text>
              <View style={styles.syncRow}>
                <Text style={styles.syncText}>Live Sync Active</Text>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.reportItem}>
            <View style={[styles.reportIndicator, { backgroundColor: item.statusColor }]} />
            <View style={styles.reportContent}>
              <Text style={styles.reportIdTitle}>
                <Text style={{ fontWeight: '700', color: '#8B949E' }}>{item.id}: </Text>
                <Text style={{ color: '#E6EDF3' }}>{item.title}</Text>
              </Text>
              <Text style={styles.reportMeta}>{item.meta}</Text>
            </View>
            <View style={[styles.statusTag, { borderColor: item.statusColor + '40' }]}>
              <Text style={[styles.statusTagText, { color: item.statusColor }]}>{item.status}</Text>
            </View>
          </View>
        )}
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
    gap: 10,
    marginBottom: 20,
  },
  typeCard: {
    width: '48.5%',
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
  featherContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  featherText: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#E6EDF3",
    letterSpacing: 1,
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
