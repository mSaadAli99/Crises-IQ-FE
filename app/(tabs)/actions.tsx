import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const FILTERS = ["All", "Routing", "Dispatch", "Alerts"];

const ACTION_CARDS = [
  {
    id: "1",
    type: "ROUTING INTERVENTION",
    time: "14:22:05",
    title: "Reroute Karsaz Traffic",
    status: "EXECUTED",
    description: "Diversion active via Shahrah-e-Faisal to bypass localized flooding point at Karsaz Flyover.",
    confidence: 0.85,
    impactScore: "+12.4 OPS",
    color: "#3B8DD4",
    icon: "swap-horizontal",
  },
  {
    id: "2",
    type: "DISPATCH LOGIC",
    time: "14:18:32",
    title: "Ambulance Tier 2 Pre-positioning",
    status: "SIMULATED",
    description: "Projecting 4x units to move to Saddar sector to preempt rising casualty reports from high-density zone.",
    hasAction: true,
    actionLabel: "Execute Now",
    color: "#F0883E",
    icon: "ambulance",
  },
  {
    id: "3",
    type: "PUBLIC ALERT",
    time: "14:15:01",
    title: "Geo-Fence SMS Push",
    status: "EXECUTED",
    description: "Broadcast alert sent to 45,000 devices in Radius Zone 4 (Gulshan) regarding power...",
    color: "#F85149",
    icon: "bell-outline",
  },
];

export default function ActionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"LIVE" | "BASELINE">("LIVE");

  const topPad = Platform.OS === "web" ? 20 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: "#0A0C10" }]}>
      <FlatList
        data={ACTION_CARDS}
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
              <Text style={styles.titleText}>Actions in Progress</Text>
              <View style={styles.opsRow}>
                <View style={[styles.opsDot, { backgroundColor: colors.tint }]} />
                <Text style={styles.opsText}>AI OPERATIONS ACTIVE</Text>
              </View>
            </View>

            {/* Filters */}
            <View style={styles.filterRow}>
              {FILTERS.map((f) => (
                <Pressable
                  key={f}
                  onPress={() => setActiveFilter(f)}
                  style={[
                    styles.filterChip,
                    { 
                      backgroundColor: activeFilter === f ? colors.tint : "#161B22",
                      borderColor: activeFilter === f ? colors.tint : "#30363D" 
                    }
                  ]}
                >
                  <Text style={[styles.filterText, { color: activeFilter === f ? "#fff" : "#8B949E" }]}>
                    {f}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Performance Card */}
            <View style={styles.perfCard}>
              <View style={styles.perfHeader}>
                <Text style={styles.perfTitle}>Aggregate Impact Performance</Text>
                <View style={styles.toggleRow}>
                  <Pressable 
                    onPress={() => setViewMode("LIVE")}
                    style={[styles.toggleBtn, viewMode === "LIVE" && { backgroundColor: colors.tint }]}
                  >
                    <Text style={[styles.toggleText, viewMode === "LIVE" && { color: "#fff" }]}>LIVE</Text>
                  </Pressable>
                  <Pressable 
                    onPress={() => setViewMode("BASELINE")}
                    style={[styles.toggleBtn, viewMode === "BASELINE" && { backgroundColor: "#30363D" }]}
                  >
                    <Text style={[styles.toggleText, viewMode === "BASELINE" && { color: "#8B949E" }]}>BASELINE</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.perfGrid}>
                <View style={styles.perfItem}>
                  <Text style={styles.perfKey}>CONGESTION DELTA</Text>
                  <Text style={[styles.perfVal, { color: colors.tint }]}>-22% <Text style={styles.perfSub}>vs Baseline</Text></Text>
                  <View style={[styles.perfBar, { backgroundColor: colors.tint + '20' }]}>
                    <View style={[styles.perfBarFill, { width: '78%', backgroundColor: colors.tint }]} />
                  </View>
                </View>
                <View style={styles.perfItem}>
                  <Text style={styles.perfKey}>AVG. RESPONSE TIME</Text>
                  <Text style={[styles.perfVal, { color: colors.warning }]}>-4.2m <Text style={styles.perfSub}>System Optimization</Text></Text>
                  <View style={[styles.perfBar, { backgroundColor: colors.warning + '20' }]}>
                    <View style={[styles.perfBarFill, { width: '65%', backgroundColor: colors.warning }]} />
                  </View>
                </View>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { borderColor: item.color + '40' }]}>
            <View style={[styles.cardHeader, { borderBottomColor: '#1C2128' }]}>
              <View style={styles.cardHeaderLeft}>
                <MaterialCommunityIcons name={item.icon as any} size={16} color={item.color} />
                <Text style={[styles.cardTypeText, { color: item.color }]}>{item.type}</Text>
              </View>
              <Text style={styles.cardTime}>{item.time}</Text>
            </View>
            
            <View style={styles.cardBody}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={styles.statusTag}>
                  <View style={[styles.statusDot, { backgroundColor: item.color }]} />
                  <Text style={styles.statusTagText}>{item.status}</Text>
                </View>
              </View>
              
              <Text style={styles.cardDesc}>{item.description}</Text>

              {item.confidence && (
                <View style={styles.cardMetaRow}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaKey}>SIMULATION CONFIDENCE</Text>
                    <View style={styles.confidenceBar}>
                      <View style={[styles.confidenceFill, { width: '85%', backgroundColor: item.color }]} />
                    </View>
                  </View>
                  <View style={styles.metaItemRight}>
                    <Text style={styles.metaKey}>IMPACT SCORE</Text>
                    <Text style={[styles.metaVal, { color: colors.tint }]}>{item.impactScore}</Text>
                  </View>
                </View>
              )}

              {item.hasAction && (
                <Pressable style={[styles.actionBtn, { backgroundColor: item.color }]}>
                  <MaterialCommunityIcons name="lightning-bolt" size={16} color="#E6EDF3" />
                  <Text style={styles.actionBtnText}>{item.actionLabel}</Text>
                </Pressable>
              )}
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
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#E6EDF3", letterSpacing: -0.5 },
  locationText: { color: "#8B949E", fontSize: 14, fontFamily: "Inter_700Bold" },
  titleSection: { marginBottom: 20 },
  titleText: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#E6EDF3", marginBottom: 4 },
  opsRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  opsDot: { width: 6, height: 6, borderRadius: 3 },
  opsText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#8B949E", letterSpacing: 0.5 },
  filterRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  filterText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  perfCard: { backgroundColor: "#111418", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#1C2128", marginBottom: 24 },
  perfHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  perfTitle: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#8B949E", letterSpacing: 0.5, flex: 1 },
  toggleRow: { flexDirection: "row", backgroundColor: "#1C2128", borderRadius: 6, padding: 2 },
  toggleBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  toggleText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#484E5D" },
  perfGrid: { gap: 16 },
  perfItem: { gap: 8 },
  perfKey: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#484E5D", letterSpacing: 0.5 },
  perfVal: { fontSize: 16, fontFamily: "Inter_700Bold" },
  perfSub: { fontSize: 10, fontFamily: "Inter_400Regular", color: "#484E5D" },
  perfBar: { height: 2, borderRadius: 1, overflow: "hidden" },
  perfBarFill: { height: "100%" },
  card: { backgroundColor: "#111418", borderRadius: 12, borderWidth: 1, marginHorizontal: 16, marginBottom: 12, overflow: "hidden" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1 },
  cardHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardTypeText: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  cardTime: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#484E5D" },
  cardBody: { padding: 12 },
  cardTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  cardTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#E6EDF3", flex: 1 },
  statusTag: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.05)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusDot: { width: 4, height: 4, borderRadius: 2 },
  statusTagText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#8B949E" },
  cardDesc: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#8B949E", lineHeight: 18, marginBottom: 16 },
  cardMetaRow: { flexDirection: "row", gap: 20 },
  metaItem: { flex: 1, gap: 8 },
  metaItemRight: { gap: 4, alignItems: "flex-end" },
  metaKey: { fontSize: 9, fontFamily: "Inter_700Bold", color: "#484E5D", letterSpacing: 0.5 },
  metaVal: { fontSize: 14, fontFamily: "Inter_700Bold" },
  confidenceBar: { height: 2, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 1 },
  confidenceFill: { height: "100%", borderRadius: 1 },
  actionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 8, gap: 8, marginTop: 4 },
  actionBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#E6EDF3" },
});
