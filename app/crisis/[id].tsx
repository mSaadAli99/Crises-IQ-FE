import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Defs, RadialGradient, Stop, Rect } from "react-native-svg";

import { useColors } from "@/hooks/useColors";
import { useCrisis } from "@/hooks/useCrises";

function ConfidenceCircle({ value }: { value: number }) {
  const size = 60;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value * circumference);

  return (
    <View style={styles.confidenceContainer}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1C2128"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#3B8DD4"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={StyleSheet.absoluteFill}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={styles.confidenceText}>{Math.round(value * 100)}%</Text>
        </View>
      </View>
    </View>
  );
}

function CrisisMap({ zoneId }: { zoneId: string }) {
  const colors = useColors();
  return (
    <View style={styles.mapContainer}>
      <LinearGradient colors={["#0D1117", "#161B22"]} style={StyleSheet.absoluteFill} />
      <Svg width="100%" height="240">
        <Defs>
          <RadialGradient id="grad" cx="50%" cy="50%" rx="40%" ry="40%" fx="50%" fy="50%">
            <Stop offset="0%" stopColor={colors.critical} stopOpacity="0.5" />
            <Stop offset="100%" stopColor={colors.critical} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#grad)" />
        {[1, 2, 3, 4, 5].map(i => (
          <React.Fragment key={i}>
            <Rect x={i * 80} y="0" width="1" height="100%" fill="#1C2128" />
            <Rect x="0" y={i * 50} width="100%" height="1" fill="#1C2128" />
          </React.Fragment>
        ))}
      </Svg>

      <View style={styles.mapOverlays}>
        <View style={[styles.alertBadge, { backgroundColor: colors.critical }]}>
          <MaterialCommunityIcons name="alert" size={14} color="#fff" />
          <Text style={styles.alertBadgeText}>CRITICAL ALERT</Text>
        </View>
        <View style={styles.zoneBadge}>
          <Text style={styles.zoneBadgeText}>ZONE: {zoneId}</Text>
        </View>
      </View>
    </View>
  );
}

export default function CrisisDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const { data: crisis, isLoading, isError } = useCrisis(id);

  if (isLoading) {
    return (
      <View style={[styles.notFound, { backgroundColor: "#0A0C10" }]}>
        <Text style={[styles.notFoundText, { color: colors.mutedForeground }]}>Loading...</Text>
      </View>
    );
  }

  if (isError || !crisis) {
    return (
      <View style={[styles.notFound, { backgroundColor: "#0A0C10" }]}>
        <Feather name="alert-triangle" size={40} color={colors.mutedForeground} />
        <Text style={[styles.notFoundText, { color: colors.mutedForeground }]}>Crisis not found</Text>
      </View>
    );
  }

  const topPad = Platform.OS === "web" ? 20 : 0;

  return (
    <View style={[styles.container, { backgroundColor: "#0A0C10" }]}>
      {/* Header Bar */}
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#E6EDF3" />
        </Pressable>
        <View style={styles.logoRow}>
          <MaterialCommunityIcons name="asterisk" size={24} color={colors.tint} />
          <Text style={styles.headerTitle}>CrisisIQ</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.headerLoc}>Karachi, PK</Text>
          <Ionicons name="location-outline" size={14} color="#8B949E" />
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad + 40 }}
      >
        <CrisisMap zoneId="LYARI_EX_04" />

        <View style={styles.content}>
          {/* Main Detection Card */}
          <View style={[styles.mainCard, { backgroundColor: "#161B22", borderColor: "#30363D" }]}>
            <View style={styles.mainCardRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.mainCardTitle}>{crisis.crisis_type} Detection</Text>
                <Text style={styles.mainCardSubtitle}>
                  <Text style={{ color: colors.warning }}>{crisis.status || 'Active'}</Text>
                </Text>
              </View>
              <ConfidenceCircle value={crisis.confidence_score || 0} />
            </View>
            <Text style={styles.confidenceLabel}>AI CONFIDENCE SCORE: <Text style={{ color: colors.tint }}>{Math.round((crisis.confidence_score || 0) * 100)}%</Text></Text>
          </View>

          {/* Situation Analysis */}
          <View style={[styles.analysisCard, { backgroundColor: "#161B22", borderColor: "#30363D" }]}>
            <View style={styles.analysisHeader}>
              <Text style={styles.analysisTitle}>SITUATION ANALYSIS</Text>
              <View style={styles.severityTag}>
                <Text style={styles.severityTagText}>{(crisis.severity || 'Unknown').toUpperCase()}</Text>
              </View>
            </View>

            <View style={styles.analysisGrid}>
              <View style={styles.analysisItem}>
                <Text style={styles.analysisKey}>SEVERITY</Text>
                <Text style={styles.analysisVal}>{crisis.severity || '--'}</Text>
              </View>
              <View style={styles.analysisItem}>
                <Text style={styles.analysisKey}>LOCATION</Text>
                <Text style={styles.analysisVal}>{crisis.location}</Text>
              </View>
            </View>

            <Text style={styles.analysisText}>Crisis reported at {crisis.location}. Status: {crisis.status || 'Active'}.</Text>
          </View>

          {/* Input Signals */}
          <Text style={styles.sectionTitle}>INPUT SIGNALS</Text>
          <View style={styles.signalsGrid}>
            <View style={styles.signalMiniCard}>
              <View style={styles.signalHeader}>
                <Ionicons name="cloud-outline" size={16} color={colors.tint} />
                <Text style={styles.signalLabel}>Weather Sensor</Text>
              </View>
              <Text style={styles.signalVal}>88mm/h Precip</Text>
            </View>
            <View style={styles.signalMiniCard}>
              <View style={styles.signalHeader}>
                <Ionicons name="car-outline" size={16} color={colors.warning} />
                <Text style={styles.signalLabel}>Traffic API</Text>
              </View>
              <Text style={styles.signalVal}>+140% Spike</Text>
            </View>
          </View>

          <View style={styles.socialCard}>
            <View style={styles.signalHeader}>
              <Ionicons name="chatbubble-outline" size={16} color={colors.tint} />
              <Text style={styles.signalLabel}>Social Intelligence</Text>
            </View>
            <Text style={styles.socialText}>
              "Water crossing the barrier at Lyari ramp. Stuck for 20 mins." - <Text style={{ color: colors.tint }}>@pk_traffic_bot</Text>
            </Text>
          </View>

          {/* Recommended Actions */}
          <Text style={styles.sectionTitle}>RECOMMENDED ACTIONS</Text>
          <View style={styles.actionsList}>
            <Pressable style={[styles.actionBtn, { backgroundColor: colors.tint }]}>
              <MaterialCommunityIcons name="robot-outline" size={20} color="#E6EDF3" />
              <Text style={styles.actionBtnText}>Deploy Rerouting Agent</Text>
              <Ionicons name="chevron-forward" size={16} color="#E6EDF3" />
            </Pressable>
            <Pressable style={styles.actionBtnSecondary}>
              <Ionicons name="shield-outline" size={20} color="#E6EDF3" />
              <Text style={styles.actionBtnText}>Alert Traffic Police</Text>
              <Ionicons name="chevron-forward" size={16} color="#E6EDF3" />
            </Pressable>
            <Pressable style={styles.actionBtnSecondary}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#E6EDF3" />
              <Text style={styles.actionBtnText}>Issue SMS Warnings</Text>
              <Ionicons name="chevron-forward" size={16} color="#E6EDF3" />
            </Pressable>
          </View>

          {/* Bottom Action */}
          <Pressable 
            onPress={() => router.push("/simulation")}
            style={styles.simulationBtn}
          >
            <Ionicons name="videocam-outline" size={20} color="#0A0C10" />
            <Text style={styles.simulationBtnText}>View Simulation</Text>
          </Pressable>
        </View>
      </ScrollView>
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
    paddingBottom: 12,
    zIndex: 10,
    backgroundColor: "#0A0C10",
  },
  backBtn: { width: 40 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#E6EDF3", letterSpacing: -0.5 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 6, width: 100, justifyContent: 'flex-end' },
  headerLoc: { color: "#8B949E", fontSize: 12, fontFamily: "Inter_700Bold" },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  notFoundText: { fontSize: 16, fontFamily: "Inter_400Regular" },
  mapContainer: { height: 240, overflow: 'hidden' },
  mapOverlays: { position: 'absolute', top: 16, left: 16, gap: 8 },
  alertBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4 },
  alertBadgeText: { color: '#fff', fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
  zoneBadge: { backgroundColor: 'rgba(13,17,23,0.8)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4 },
  zoneBadgeText: { color: '#8B949E', fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
  content: { padding: 16 },
  mainCard: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16 },
  mainCardRow: { flexDirection: 'row', alignItems: 'center' },
  mainCardTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#E6EDF3', marginBottom: 4 },
  mainCardSubtitle: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#8B949E' },
  confidenceContainer: { width: 60, height: 60 },
  confidenceText: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#E6EDF3' },
  confidenceLabel: { fontSize: 10, fontFamily: 'Inter_700Bold', color: '#484E5D', marginTop: 12, letterSpacing: 0.5 },
  analysisCard: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 24 },
  analysisHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  analysisTitle: { fontSize: 11, fontFamily: 'Inter_700Bold', color: '#8B949E', letterSpacing: 0.5 },
  severityTag: { backgroundColor: 'rgba(255,138,107,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  severityTagText: { color: '#FF8A6B', fontSize: 10, fontFamily: 'Inter_700Bold' },
  analysisGrid: { flexDirection: 'row', gap: 32, marginBottom: 16 },
  analysisItem: { gap: 4 },
  analysisKey: { fontSize: 10, fontFamily: 'Inter_700Bold', color: '#484E5D', letterSpacing: 0.5 },
  analysisVal: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#E6EDF3' },
  analysisText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#E6EDF3', lineHeight: 20 },
  sectionTitle: { fontSize: 11, fontFamily: 'Inter_700Bold', color: '#484E5D', letterSpacing: 0.5, marginBottom: 12 },
  signalsGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  signalMiniCard: { flex: 1, backgroundColor: '#161B22', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#30363D' },
  signalHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  signalLabel: { fontSize: 10, fontFamily: 'Inter_700Bold', color: '#8B949E' },
  signalVal: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#E6EDF3' },
  socialCard: { backgroundColor: '#161B22', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#30363D', marginBottom: 24 },
  socialText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#E6EDF3', fontStyle: 'italic', lineHeight: 18 },
  actionsList: { gap: 10, marginBottom: 32 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 8, gap: 12 },
  actionBtnSecondary: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 8, gap: 12, backgroundColor: '#161B22', borderWidth: 1, borderColor: '#30363D' },
  actionBtnText: { flex: 1, fontSize: 14, fontFamily: 'Inter_700Bold', color: '#E6EDF3' },
  simulationBtn: { backgroundColor: '#E6EDF3', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, gap: 10 },
  simulationBtnText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#0A0C10' },
});
