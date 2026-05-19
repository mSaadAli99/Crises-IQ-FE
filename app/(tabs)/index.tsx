import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CrisisMap from "@/components/CrisisMap";
import { useColors } from "@/hooks/useColors";
import { useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/API";
import {
  useCrises,
  useDetailedStats,
  useSeedDemo,
  useStats,
  Crisis as BackendCrisis,
} from "@/hooks/useCrises";
import { invalidateCrisisQueries } from "@/lib/queryKeys";
import { screenPadding, tabBarClearance, textShrink } from "@/constants/layout";


interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  iconType?: "Ionicons" | "MaterialCommunityIcons" | "Feather";
}

function StatCard({ label, value, icon, color, iconType = "Ionicons" }: StatCardProps) {
  const colors = useColors();
  
  const IconComp = iconType === "MaterialCommunityIcons" ? MaterialCommunityIcons : (iconType === "Feather" ? Feather : Ionicons);

  const valueStr = String(value);

  return (
    <View style={[styles.statCard, { backgroundColor: "#1A1D23", borderColor: colors.border }]}>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]} numberOfLines={2}>
        {label}
      </Text>
      <View style={styles.statContent}>
        <Text
          style={[styles.statValue, textShrink, { color: colors.text }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.65}
        >
          {valueStr}
        </Text>
        <IconComp name={icon as any} size={16} color={color} style={styles.statIcon} />
      </View>
    </View>
  );
}

interface CrisisCardProps {
  crisis: BackendCrisis;
}

function CrisisCard({ crisis }: CrisisCardProps) {
  const colors = useColors();

  const getTagColor = () => {
    const severity = (crisis.severity || "").toLowerCase();
    if (severity === "critical") return colors.critical;
    if (severity === "severe" || severity === "high") return colors.warning;
    return colors.info;
  };

  const getIcon = () => {
    const type = (crisis.crisis_type || "").toLowerCase();
    if (type.includes("flood")) return "home-flood";
    if (type.includes("grid") || type.includes("power")) return "flash";
    if (type.includes("assembly") || type.includes("crowd")) return "account-group";
    return "alert-circle";
  };

  const timeAgo = (ts: string) => {
    if (!ts) return "Just now";
    const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  const tagColor = getTagColor();

  return (
    <Pressable
      onPress={() => router.push(`/crisis/${crisis.id}` as any)}
      style={({ pressed }) => [
        styles.incidentCard,
        {
          backgroundColor: "#161B22",
          borderColor: colors.border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={styles.incidentTop}>
        <View style={styles.incidentMainRow}>
          <View style={styles.incidentIconBox}>
            <MaterialCommunityIcons name={getIcon() as any} size={22} color="#E6EDF3" />
          </View>
          <View style={styles.incidentHeader}>
            <Text style={[styles.incidentType, textShrink]} numberOfLines={1}>
              {crisis.crisis_type}
            </Text>
            <Text style={[styles.incidentLoc, textShrink]} numberOfLines={2}>
              {crisis.location}
            </Text>
          </View>
        </View>
        <View style={styles.incidentMetaRow}>
          <View style={[styles.incidentTag, { backgroundColor: tagColor + "20" }]}>
            <Text style={[styles.incidentTagText, { color: tagColor }]} numberOfLines={1}>
              {(crisis.severity || "info").toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.incidentTime, textShrink]} numberOfLines={1}>
            {timeAgo(crisis.created_at)}
          </Text>
        </View>
      </View>

      <View style={styles.incidentDivider} />

      <View style={styles.incidentFooter}>
        <View style={styles.incidentStat}>
          <Text style={styles.incidentStatLabel}>CONFIDENCE</Text>
          <Text style={styles.incidentStatValue}>
            <Text style={{ color: colors.tint }}>{Math.round((crisis.confidence_score || 0) * 100)}% SCORE</Text>
          </Text>
        </View>
        <View style={[styles.incidentStat, { flex: 1 }]}>
          <Text style={styles.incidentStatLabel}>STATUS</Text>
          <Text style={[styles.incidentStatValue, textShrink]} numberOfLines={1}>
            {crisis.status || "Active"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { data: backendCrises, isLoading, isError, refetch } = useCrises(5);
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: detailedStats } = useDetailedStats();
  const seedDemo = useSeedDemo();

  React.useEffect(() => {
    let ws: WebSocket | undefined;
    let pingTimer: ReturnType<typeof setInterval> | undefined;
    try {
      ws = new WebSocket(API_ENDPOINTS.WS_CRISES);

      ws.onopen = () => {
        pingTimer = setInterval(() => {
          if (ws?.readyState === WebSocket.OPEN) {
            ws.send("ping");
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.event === "new_crisis") {
            invalidateCrisisQueries(queryClient);
          }
        } catch (e) {
          console.error("Error parsing WS message", e);
        }
      };
    } catch (e) {
      console.error("WebSocket connection error:", e);
    }

    return () => {
      if (pingTimer) clearInterval(pingTimer);
      if (ws) ws.close();
    };
  }, [queryClient]);

  // Only use backend data
  const displayCrises = backendCrises || [];
  
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: "#0A0C10" }]}>
      <FlatList
        data={displayCrises}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={refetch}
        contentContainerStyle={{
          paddingTop: topPad,
          paddingBottom: tabBarClearance,
        }}
        ListHeaderComponent={
          <>
            {/* Custom Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.logoRow}>
                  <MaterialCommunityIcons name="asterisk" size={24} color={colors.tint} />
                  <Text style={styles.headerTitle}>CrisisIQ</Text>
                </View>
                <View style={styles.locationPill}>
                  <Ionicons name="location-sharp" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.locationText, textShrink]} numberOfLines={1}>
                    Karachi, PK
                  </Text>
                </View>
              </View>

              <View style={styles.headerActions}>
                <Pressable
                  style={styles.seedBtn}
                  onPress={() => seedDemo.mutate()}
                  disabled={seedDemo.isPending}
                >
                  <MaterialCommunityIcons
                    name={seedDemo.isPending ? "progress-clock" : "database-plus-outline"}
                    size={18}
                    color={seedDemo.isPending ? colors.mutedForeground : colors.tint}
                  />
                </Pressable>
                <Pressable style={styles.iconBtn} onPress={() => refetch()}>
                  <Ionicons
                    name={isLoading ? "sync" : "notifications-outline"}
                    size={22}
                    color={isLoading ? colors.tint : colors.text}
                  />
                </Pressable>
              </View>
            </View>

            <CrisisMap crises={displayCrises} />

            <View style={styles.statsRow}>
              <StatCard
                label="ACTIVE CRISES"
                value={stats ? stats.active_crises : (statsLoading ? "..." : displayCrises.length)}
                icon="triangle-outline"
                color={colors.critical}
              />
              <StatCard
                label="AGENTS RUNNING"
                value={stats ? stats.agents_running : "--"}
                icon="shield-outline"
                color={colors.tint}
                iconType="MaterialCommunityIcons"
              />
              <StatCard
                label="SYSTEM STATUS"
                value={isError ? "OFFLINE" : (stats ? stats.system_status.toUpperCase() : "STABLE")}
                icon={isError ? "alert-circle-outline" : "checkmark-circle-outline"}
                color={isError ? colors.critical : colors.tint}
              />
            </View>

            {detailedStats ? (
              <View style={styles.secondaryStatsRow}>
                <Text style={styles.secondaryStat}>
                  Signals: <Text style={styles.secondaryVal}>{detailedStats.total_signals}</Text>
                </Text>
                <Text style={styles.secondaryStat}>
                  Alerts: <Text style={styles.secondaryVal}>{detailedStats.alerts_sent}</Text>
                </Text>
                <Text style={styles.secondaryStat}>
                  Resolved today: <Text style={styles.secondaryVal}>{detailedStats.resolved_today}</Text>
                </Text>
              </View>
            ) : null}

            <View style={styles.sectionHeader}>
              <View style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
                <Text style={[styles.sectionTitle, textShrink]} numberOfLines={1}>
                  Live Intelligence Feed
                </Text>
                {isError ? (
                  <Text style={{ color: colors.critical, fontSize: 10, marginTop: 4 }}>
                    Backend unreachable
                  </Text>
                ) : null}
              </View>
            </View>
          </>
        }
        renderItem={({ item }) => <CrisisCard crisis={item as any} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      {/* Floating Action Button */}
      <Pressable 
        style={[styles.fab, { backgroundColor: "#A4D0F1" }]}
        onPress={() => router.push("/(tabs)/report" as any)}
      >
        <Ionicons name="add" size={32} color="#0A0C10" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: screenPadding,
    paddingVertical: 12,
    gap: 12,
  },
  headerLeft: {
    flex: 1,
    minWidth: 0,
    gap: 8,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
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
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#161B22",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    maxWidth: "100%",
  },
  locationText: {
    color: "#8B949E",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  seedBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#161B22",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#30363D",
  },
  secondaryStatsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  secondaryStat: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#8B949E",
  },
  secondaryVal: {
    color: "#E6EDF3",
    fontFamily: "Inter_700Bold",
  },
  mapContainer: {
    height: 280,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#30363D",
  },
  mapStatusPill: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(13,17,23,0.8)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  statusDotActive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#3FB950",
  },
  mapStatusText: {
    color: "#E6EDF3",
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  mapControls: {
    position: "absolute",
    bottom: 16,
    right: 16,
    gap: 8,
  },
  mapControlBtn: {
    width: 36,
    height: 36,
    backgroundColor: "rgba(13,17,23,0.8)",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#30363D",
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: 0,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  statLabel: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statValue: {
    flex: 1,
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    marginRight: 4,
  },
  statIcon: {
    opacity: 0.8,
    flexShrink: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#E6EDF3",
  },
  viewAllText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: "#3B8DD4",
    letterSpacing: 0.5,
  },
  incidentCard: {
    marginHorizontal: screenPadding,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    overflow: "hidden",
  },
  incidentTop: {
    gap: 10,
  },
  incidentMainRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  incidentMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingLeft: 56,
  },
  incidentIconBox: {
    width: 44,
    height: 44,
    backgroundColor: "#1C2128",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  incidentHeader: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  incidentType: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#E6EDF3",
  },
  incidentLoc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#8B949E",
    marginTop: 2,
  },
  incidentTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexShrink: 0,
  },
  incidentTagText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
  },
  incidentTime: {
    fontSize: 11,
    color: "#8B949E",
    fontFamily: "Inter_500Medium",
  },
  incidentDivider: {
    height: 1,
    backgroundColor: "#30363D",
    marginVertical: 14,
  },
  incidentFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  incidentStat: {
    gap: 4,
  },
  incidentStatLabel: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: "#8B949E",
    letterSpacing: 0.5,
  },
  incidentStatValue: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#E6EDF3",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
