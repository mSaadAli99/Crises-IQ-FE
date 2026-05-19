import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";

import MetricsBlock from "@/components/MetricsBlock";
import { API_ENDPOINTS } from "@/constants/API";
import { useColors } from "@/hooks/useColors";
import { useActions } from "@/hooks/useCrises";
import { invalidateCrisisQueries } from "@/lib/queryKeys";
import { screenPadding, tabBarClearance, textShrink } from "@/constants/layout";

const FILTERS = ["All", "Routing", "Dispatch", "Alerts"];

export default function ActionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  
  const [activeFilter, setActiveFilter] = useState("All");
  const [executingIds, setExecutingIds] = useState<Record<number, boolean>>({});

  const { data: actions = [], isLoading } = useActions();

  const topPad = Platform.OS === "web" ? 20 : insets.top;

  const filteredActions = React.useMemo(() => {
    return actions.filter((act) => {
      const type = (act.action_type || "").toLowerCase();
      
      // Exclude tickets
      if (type === "ticket") return false;

      if (activeFilter === "All") return true;
      if (activeFilter === "Routing") return type.includes("reroute") || type.includes("routing");
      if (activeFilter === "Dispatch") return type.includes("dispatch");
      if (activeFilter === "Alerts") return type.includes("alert");
      return true;
    });
  }, [actions, activeFilter]);

  const handleExecuteAction = async (actionId: number) => {
    setExecutingIds((prev) => ({ ...prev, [actionId]: true }));
    try {
      const res = await fetch(`${API_ENDPOINTS.ACTIONS}/${actionId}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to execute action");
      
      await invalidateCrisisQueries(queryClient);
    } catch (err) {
      console.error("Execution error:", err);
    } finally {
      setExecutingIds((prev) => ({ ...prev, [actionId]: false }));
    }
  };

  const getActionIcon = (type: string) => {
    const t = (type || "").toLowerCase();
    if (t.includes("reroute") || t.includes("routing")) return "swap-horizontal";
    if (t.includes("dispatch")) return "ambulance";
    if (t.includes("alert")) return "bell-outline";
    return "play-circle-outline";
  };

  const getActionColor = (type: string) => {
    const t = (type || "").toLowerCase();
    if (t.includes("dispatch")) return colors.critical;
    if (t.includes("alert")) return colors.warning;
    return colors.tint;
  };

  const getActionTypeLabel = (type: string) => {
    const t = (type || "").toLowerCase();
    if (t.includes("reroute") || t.includes("routing")) return "ROUTING INTERVENTION";
    if (t.includes("dispatch")) return "DISPATCH LOGIC";
    if (t.includes("alert")) return "PUBLIC ALERT";
    return "OPERATIONAL TASK";
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    } catch {
      return "";
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: "#0A0C10" }]}>
      <FlatList
        data={filteredActions}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: topPad,
          paddingBottom: tabBarClearance,
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

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
              contentContainerStyle={styles.filterRow}
            >
              {FILTERS.map((f) => (
                <Pressable
                  key={f}
                  onPress={() => setActiveFilter(f)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: activeFilter === f ? colors.tint : "#161B22",
                      borderColor: activeFilter === f ? colors.tint : "#30363D",
                    },
                  ]}
                >
                  <Text style={[styles.filterText, { color: activeFilter === f ? "#fff" : "#8B949E" }]}>
                    {f}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>



            {isLoading && (
              <ActivityIndicator color={colors.tint} style={{ marginVertical: 20 }} />
            )}

            {!isLoading && filteredActions.length === 0 && (
              <View style={{ padding: 40, alignItems: "center" }}>
                <MaterialCommunityIcons name="clipboard-check-outline" size={48} color="#30363D" />
                <Text style={{ color: "#8B949E", marginTop: 12, fontFamily: "Inter_600SemiBold", textAlign: "center" }}>
                  No operational actions registered. Ingest a signal to trigger the AI agents planner.
                </Text>
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => {
          const actColor = getActionColor(item.action_type);
          const actIcon = getActionIcon(item.action_type);
          const isSimulated = (item.status || "").toLowerCase() === "simulated";
          const isExecuting = !!executingIds[item.id];

          return (
            <View style={[styles.card, { borderColor: actColor + '30' }]}>
              <View style={[styles.cardHeader, { borderBottomColor: '#1C2128' }]}>
                <View style={styles.cardHeaderLeft}>
                  <MaterialCommunityIcons name={actIcon as any} size={16} color={actColor} style={{ flexShrink: 0 }} />
                  <Text style={[styles.cardTypeText, textShrink, { color: actColor }]} numberOfLines={2}>
                    {getActionTypeLabel(item.action_type)}
                  </Text>
                </View>
                <Text style={[styles.cardTime, textShrink]} numberOfLines={1}>
                  {formatTime(item.created_at)}
                </Text>
              </View>
              
              <View style={styles.cardBody}>
                <View style={styles.cardTitleRow}>
                  <Text style={[styles.cardTitle, textShrink]} numberOfLines={2}>
                    {item.description.split(" in ")[0].split(" to ")[0]}
                  </Text>
                  <View style={[styles.statusTag, { 
                    backgroundColor: isSimulated ? "rgba(240,136,62,0.08)" : "rgba(63,185,80,0.08)",
                    borderColor: isSimulated ? "rgba(240,136,62,0.2)" : "rgba(63,185,80,0.2)",
                    borderWidth: 1
                  }]}>
                    <View style={[styles.statusDot, { backgroundColor: isSimulated ? colors.warning : "#3FB950" }]} />
                    <Text style={[styles.statusTagText, { color: isSimulated ? colors.warning : "#3FB950" }]} numberOfLines={1}>
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                <Text style={[styles.cardDesc, textShrink]}>{item.description}</Text>

                {item.simulation_result?.message && (
                  <View style={{ 
                    borderLeftWidth: 2, 
                    borderLeftColor: colors.tint, 
                    paddingLeft: 8,
                    backgroundColor: 'rgba(13,17,23,0.4)',
                    paddingVertical: 8,
                    borderRadius: 4,
                    marginBottom: 8
                  }}>
                    <Text style={{ fontSize: 12, fontStyle: 'italic', color: '#8B949E', fontFamily: 'Inter_400Regular' }}>
                      "Simulation: {item.simulation_result.message}"
                    </Text>
                  </View>
                )}

                <MetricsBlock before={item.before_metrics} after={item.after_metrics} />

                {isSimulated && (
                  <Pressable 
                    onPress={() => handleExecuteAction(item.id)}
                    disabled={isExecuting}
                    style={[styles.actionBtn, { backgroundColor: actColor }]}
                  >
                    {isExecuting ? (
                      <ActivityIndicator size="small" color="#E6EDF3" />
                    ) : (
                      <>
                        <MaterialCommunityIcons name="lightning-bolt" size={16} color="#E6EDF3" />
                        <Text style={styles.actionBtnText}>Execute Action</Text>
                      </>
                    )}
                  </Pressable>
                )}
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
  filterScroll: { marginBottom: 20, flexGrow: 0 },
  filterRow: { flexDirection: "row", gap: 10, paddingRight: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, flexShrink: 0 },
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
  card: {
    backgroundColor: "#111418",
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: screenPadding,
    marginBottom: 12,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  cardHeaderLeft: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "flex-start", gap: 6 },
  cardTypeText: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.5, flex: 1 },
  cardTime: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#484E5D", flexShrink: 0, maxWidth: 72 },
  cardBody: { padding: 12 },
  cardTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 },
  cardTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#E6EDF3", flex: 1, minWidth: 0 },
  statusTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexShrink: 0,
    maxWidth: "42%",
  },
  statusDot: { width: 4, height: 4, borderRadius: 2 },
  statusTagText: { fontSize: 10, fontFamily: "Inter_700Bold" },
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
