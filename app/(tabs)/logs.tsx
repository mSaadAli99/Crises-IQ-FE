import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useAgentLogs } from "@/hooks/useCrises";

const FILTERS = [
  "All Agents", 
  "Agent 1 (Ingestion)", 
  "Agent 2 (Detection)", 
  "Agent 3 (Analysis)", 
  "Agent 4 (Planner)"
];

export default function LogsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState("All Agents");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: logs = [], isLoading } = useAgentLogs();

  const topPad = Platform.OS === "web" ? 20 : insets.top;

  const filteredLogs = React.useMemo(() => {
    return logs.filter((log) => {
      if (activeFilter === "All Agents") return true;
      if (activeFilter === "Agent 1 (Ingestion)") return log.agent_number === 1;
      if (activeFilter === "Agent 2 (Detection)") return log.agent_number === 2;
      if (activeFilter === "Agent 3 (Analysis)") return log.agent_number === 3;
      if (activeFilter === "Agent 4 (Planner)") return log.agent_number === 4;
      return true;
    });
  }, [logs, activeFilter]);

  const getAgentColor = (num: number) => {
    switch (num) {
      case 1: return colors.tint;       // Ingestion -> Blue
      case 2: return "#8250DF";         // Detection -> Purple
      case 3: return "#F0883E";         // Analysis -> Orange
      default: return "#3FB950";        // Planner -> Green
    }
  };

  const getAgentLabel = (num: number) => {
    return `AGENT ${num}`;
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      const ms = String(d.getMilliseconds()).padStart(2, "0").slice(0, 2);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) + `.${ms}`;
    } catch {
      return "";
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: "#0A0C10" }]}>
      <FlatList
        data={filteredLogs}
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
              <FlatList
                data={FILTERS}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item}
                renderItem={({ item: f }) => (
                  <Pressable
                    onPress={() => setActiveFilter(f)}
                    style={[
                      styles.filterChip,
                      { 
                        backgroundColor: activeFilter === f ? colors.tint : "#161B22",
                        borderColor: activeFilter === f ? colors.tint : "#30363D",
                        marginRight: 8,
                      }
                    ]}
                  >
                    <Text style={[styles.filterText, { color: activeFilter === f ? "#fff" : "#8B949E" }]}>
                      {f}
                    </Text>
                  </Pressable>
                )}
              />
            </View>

            {isLoading && (
              <ActivityIndicator color={colors.tint} style={{ marginVertical: 32 }} />
            )}

            {!isLoading && filteredLogs.length === 0 && (
              <View style={{ padding: 40, alignItems: "center" }}>
                <MaterialCommunityIcons name="xml" size={48} color="#30363D" />
                <Text style={{ color: "#8B949E", marginTop: 12, fontFamily: "Inter_600SemiBold", textAlign: "center" }}>
                  No agent logs found. Ingest an incident to trigger AI operations.
                </Text>
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => {
          const actColor = getAgentColor(item.agent_number);
          const isExpanded = expandedId === item.id;

          return (
            <View style={styles.logWrapper}>
              <View style={[styles.indicator, { backgroundColor: actColor }]} />
              <Pressable 
                onPress={() => setExpandedId(isExpanded ? null : item.id)}
                style={styles.logCard}
              >
                <View style={styles.logHeader}>
                  <View style={styles.logAgentInfo}>
                    <View style={[styles.agentTag, { backgroundColor: actColor + '15' }]}>
                      <Text style={[styles.agentTagText, { color: actColor }]}>{getAgentLabel(item.agent_number)}</Text>
                    </View>
                    <Text style={styles.logRole}>/ {item.agent_name} /</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 10, fontFamily: 'Inter_600SemiBold', color: '#484E5D' }}>{item.duration_ms}ms</Text>
                    <Text style={styles.logTime}>{formatTime(item.created_at)}</Text>
                  </View>
                </View>

                <Text style={styles.logText}>{item.reasoning}</Text>

                <View style={styles.dataSection}>
                  <View style={styles.dataHeader}>
                    <Text style={styles.dataHeaderText}>INPUT & OUTPUT METADATA</Text>
                    <Ionicons 
                      name={isExpanded ? "chevron-up" : "chevron-down"} 
                      size={14} 
                      color="#484E5D" 
                    />
                  </View>
                  
                  {isExpanded && (
                    <View style={styles.codeBlock}>
                      {item.input_data ? (
                        <>
                          <Text style={styles.codeMetaTitle}>[INPUT DATA]</Text>
                          <Text style={styles.codeText}>
                            {JSON.stringify(item.input_data, null, 2)}
                          </Text>
                        </>
                      ) : null}
                      {item.output_data ? (
                        <>
                          <Text style={[styles.codeMetaTitle, { marginTop: 12 }]}>[OUTPUT RESULT]</Text>
                          <Text style={[styles.codeText, { color: '#3FB950' }]}>
                            {JSON.stringify(item.output_data, null, 2)}
                          </Text>
                        </>
                      ) : null}
                    </View>
                  )}
                </View>
              </Pressable>
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
  filterRow: { flexDirection: "row", marginBottom: 24 },
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
  codeMetaTitle: { fontSize: 9, fontFamily: 'Inter_700Bold', color: '#8B949E', marginBottom: 4, letterSpacing: 0.5 },
  codeText: { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 11, color: '#F0883E', lineHeight: 16, marginBottom: 8 },
});
