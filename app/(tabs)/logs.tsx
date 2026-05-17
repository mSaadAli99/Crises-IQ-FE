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

const FILTERS = ["All Agents", "Agent 1 (Router)", "Agent 2 (Dispatcher)"];

const LOG_ITEMS = [
  {
    id: "1",
    agent: "AGENT 1",
    role: "Router",
    time: "14:22:04.12",
    text: "Analyzing alternate routes for NIPA intersection due to unexpected flood surge data.",
    type: "RAW_DATA_INPUT",
    color: "#3B8DD4",
    data: {
      node: "NIPA_04",
      status: "IMPASSABLE",
      flow_rate: "1.2m/s",
      re_route_required: true,
    },
  },
  {
    id: "2",
    agent: "AGENT 2",
    role: "Dispatcher",
    time: "14:22:05.89",
    text: "Prioritizing medical units M-09 and M-12 for North Nazimabad sector. Calculating ETA variances.",
    type: "RAW_DATA_OUTPUT",
    color: "#F0883E",
  },
  {
    id: "3",
    agent: "CRITICAL",
    role: "Telemetry",
    time: "14:22:12.01",
    text: "Satellite uplink latency exceeded 500ms in Sector 7. Attempting failover to terrestrial mesh.",
    color: "#F85149",
  },
  {
    id: "4",
    agent: "AGENT 1",
    role: "Refinement",
    time: "14:22:15.44",
    text: "Updated route matrix for civilian evacuation. Redirecting to Stadium Road via University Rd bypass.",
    color: "#3B8DD4",
  },
];

export default function LogsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState("All Agents");
  const [expandedId, setExpandedId] = useState<string | null>("1");

  const topPad = Platform.OS === "web" ? 20 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: "#0A0C10" }]}>
      <FlatList
        data={LOG_ITEMS}
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
              <View style={styles.headerRight}>
                <Ionicons name="location-outline" size={16} color={colors.tint} />
                <Text style={styles.headerLoc}>Karachi, PK</Text>
              </View>
            </View>

            {/* Title */}
            <View style={styles.titleSection}>
              <Text style={styles.titleText}>Agent Reasoning Logs</Text>
              <View style={styles.subtitleRow}>
                <Text style={styles.subtitleText}>Live telemetry from operational neural agents</Text>
                <View style={styles.statusTag}>
                  <View style={[styles.statusDot, { backgroundColor: colors.tint }]} />
                  <Text style={styles.statusText}>SYSTEM ACTIVE</Text>
                </View>
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
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.logWrapper}>
            <View style={[styles.indicator, { backgroundColor: item.color }]} />
            <Pressable 
              onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
              style={styles.logCard}
            >
              <View style={styles.logHeader}>
                <View style={styles.logAgentInfo}>
                  <View style={[styles.agentTag, { backgroundColor: item.color + '20' }]}>
                    <Text style={[styles.agentTagText, { color: item.color }]}>{item.agent}</Text>
                  </View>
                  <Text style={styles.logRole}>/ {item.role} /</Text>
                </View>
                <Text style={styles.logTime}>{item.time}</Text>
              </View>

              <Text style={styles.logText}>{item.text}</Text>

              {item.type && (
                <View style={styles.dataSection}>
                  <View style={styles.dataHeader}>
                    <Text style={styles.dataHeaderText}>{item.type}</Text>
                    <Ionicons 
                      name={expandedId === item.id ? "chevron-up" : "chevron-down"} 
                      size={14} 
                      color="#484E5D" 
                    />
                  </View>
                  
                  {expandedId === item.id && item.data && (
                    <View style={styles.codeBlock}>
                      <Text style={styles.codeText}>
                        {JSON.stringify(item.data, null, 2)}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </Pressable>
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
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerLoc: { color: "#E6EDF3", fontSize: 14, fontFamily: "Inter_700Bold" },
  titleSection: { marginBottom: 20 },
  titleText: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#E6EDF3", marginBottom: 6 },
  subtitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subtitleText: { fontSize: 12, color: "#8B949E", fontFamily: "Inter_400Regular", flex: 1 },
  statusTag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#111418', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: '#1C2128' },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontFamily: 'Inter_700Bold', color: '#8B949E', letterSpacing: 0.5 },
  filterRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  filterText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  logWrapper: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, backgroundColor: '#111418', borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#1C2128' },
  indicator: { width: 3, height: '100%' },
  logCard: { flex: 1, padding: 12 },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  logAgentInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  agentTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  agentTagText: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
  logRole: { fontSize: 11, fontFamily: 'Inter_400Regular', color: '#8B949E' },
  logTime: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: '#484E5D' },
  logText: { fontSize: 14, fontFamily: 'Inter_500Medium', color: '#E6EDF3', lineHeight: 20, marginBottom: 12 },
  dataSection: { backgroundColor: '#0D1117', borderRadius: 6, overflow: 'hidden' },
  dataHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8 },
  dataHeaderText: { fontSize: 10, fontFamily: 'Inter_700Bold', color: '#8B949E', letterSpacing: 0.5 },
  codeBlock: { padding: 12, borderTopWidth: 1, borderTopColor: '#1C2128' },
  codeText: { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 12, color: '#F0883E', lineHeight: 18 },
});
