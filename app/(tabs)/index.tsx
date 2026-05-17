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
import { useCrises, Crisis as BackendCrisis } from "@/hooks/useCrises";


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

  return (
    <View style={[styles.statCard, { backgroundColor: "#1A1D23", borderColor: colors.border }]}>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={styles.statContent}>
        <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
        <IconComp name={icon as any} size={18} color={color} style={styles.statIcon} />
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
        <View style={styles.incidentIconBox}>
          <MaterialCommunityIcons name={getIcon() as any} size={24} color="#E6EDF3" />
        </View>
        <View style={styles.incidentHeader}>
          <Text style={styles.incidentType}>{crisis.crisis_type}</Text>
          <Text style={styles.incidentLoc}>{crisis.location}</Text>
        </View>
        <View style={[styles.incidentTag, { backgroundColor: tagColor + "20" }]}>
          <Text style={[styles.incidentTagText, { color: tagColor }]}>
            {(crisis.severity || "info").toUpperCase()}
          </Text>
        </View>
        <Text style={styles.incidentTime}>{timeAgo(crisis.created_at)}</Text>
      </View>

      <View style={styles.incidentDivider} />

      <View style={styles.incidentFooter}>
        <View style={styles.incidentStat}>
          <Text style={styles.incidentStatLabel}>CONFIDENCE</Text>
          <Text style={styles.incidentStatValue}>
            <Text style={{ color: colors.tint }}>{Math.round((crisis.confidence_score || 0) * 100)}% SCORE</Text>
          </Text>
        </View>
        <View style={styles.incidentStat}>
          <Text style={styles.incidentStatLabel}>STATUS</Text>
          <Text style={styles.incidentStatValue}>{crisis.status || "Active"}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data: backendCrises, isLoading, isError, refetch } = useCrises();

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
          paddingBottom: 100,
        }}
        ListHeaderComponent={
          <>
            {/* Custom Header */}
            <View style={styles.header}>
              <View style={styles.logoRow}>
                <MaterialCommunityIcons name="asterisk" size={24} color={colors.tint} />
                <Text style={styles.headerTitle}>CrisisIQ</Text>
              </View>
              
              <View style={styles.locationPill}>
                <Ionicons name="location-sharp" size={14} color={colors.mutedForeground} />
                <Text style={styles.locationText}>Karachi, PK</Text>
              </View>

              <Pressable style={styles.iconBtn} onPress={() => refetch()}>
                <Ionicons 
                  name={isLoading ? "sync" : "notifications-outline"} 
                  size={22} 
                  color={isLoading ? colors.tint : colors.text} 
                />
              </Pressable>
            </View>

            <CrisisMap crises={displayCrises} />

            <View style={styles.statsRow}>
              <StatCard
                label="ACTIVE CRISES"
                value={displayCrises.length}
                icon="triangle-outline"
                color={colors.critical}
              />
              <StatCard
                label="AGENTS RUNNING"
                value="--"
                icon="shield-outline"
                color={colors.tint}
                iconType="MaterialCommunityIcons"
              />
              <StatCard
                label="SYSTEM STATUS"
                value={isError ? "OFFLINE" : "STABLE"}
                icon={isError ? "alert-circle-outline" : "checkmark-circle-outline"}
                color={isError ? colors.critical : colors.tint}
              />
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Live Intelligence Feed
              </Text>
              {isError && (
                <Text style={{ color: colors.critical, fontSize: 10 }}>Backend Unreachable</Text>
              )}
              <Pressable>
                <Text style={styles.viewAllText}>VIEW ALL</Text>
              </Pressable>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    backgroundColor: "#161B22",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
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
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
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
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  statIcon: {
    opacity: 0.8,
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
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  incidentTop: {
    flexDirection: "row",
    alignItems: "center",
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
    marginRight: 8,
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
    gap: 32,
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
