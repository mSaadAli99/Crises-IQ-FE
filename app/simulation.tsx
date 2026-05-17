import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
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
import Svg, { Circle, Defs, RadialGradient, Stop, Rect, Path } from "react-native-svg";

import { useColors } from "@/hooks/useColors";

function MiniMap({ type }: { type: "before" | "after" }) {
  const color = type === "before" ? "#F85149" : "#3B8DD4";
  return (
    <View style={[styles.miniMap, { borderColor: color + '20' }]}>
      <View style={styles.miniMapHeader}>
        <Text style={[styles.miniMapLabel, { color }]}>{type.toUpperCase()}</Text>
        <Text style={styles.miniMapSub}>{type === "before" ? "PRE-OP" : "POST-OP"}</Text>
      </View>
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id={`grad-${type}`} cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#grad-${type})`} />
        
        {/* Abstract road paths */}
        <Path 
          d="M 10 50 Q 50 50 90 50 M 50 10 Q 50 50 50 90 M 20 20 L 80 80 M 80 20 L 20 80" 
          stroke={color + '40'} 
          strokeWidth="1" 
          fill="none" 
          scale={1.5}
        />
      </Svg>
    </View>
  );
}

export default function SimulationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const topPad = Platform.OS === "web" ? 20 : insets.top;

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
        <Text style={styles.headerLoc}>Karachi, PK</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad + 40 }}
      >
        <View style={styles.content}>
          {/* Simulation Summary */}
          <View style={styles.titleSection}>
            <Text style={styles.titleText}>Simulation Summary</Text>
            <Text style={styles.subtitleText}>Post-intervention operational analysis for incident #IQ-992</Text>
          </View>

          {/* Before/After Maps */}
          <View style={styles.mapsRow}>
            <MiniMap type="before" />
            <MiniMap type="after" />
          </View>

          {/* Main Metric Card */}
          <View style={styles.mainMetricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>CONGESTION REDUCED</Text>
              <MaterialCommunityIcons name="trending-down" size={18} color={colors.tint} />
            </View>
            <Text style={styles.metricValue}>
              42% <Text style={styles.metricSub}>vs Baseline</Text>
            </Text>
          </View>

          {/* Grid Metrics */}
          <View style={styles.metricsGrid}>
            <View style={styles.gridCard}>
              <Text style={styles.gridLabel}>RESPONSE TIME</Text>
              <Text style={styles.gridValue}>3.4m <Text style={{ color: '#484E5D', fontSize: 18 }}>-</Text></Text>
              <Text style={[styles.gridSub, { color: colors.tint }]}>-1.2m</Text>
            </View>
            <View style={styles.gridCard}>
              <Text style={styles.gridLabel}>ALERTS DELIVERED</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.gridValue}>12.8k</Text>
                <Ionicons name="checkmark-circle" size={14} color={colors.tint} />
              </View>
              <Text style={styles.gridSub}>99.8% Success</Text>
            </View>
          </View>

          {/* Simulation Timeline */}
          <View style={styles.timelineSection}>
            <Text style={styles.timelineTitle}>SIMULATION TIMELINE</Text>
            
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: colors.tint }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>Signal Received</Text>
                <Text style={styles.timelineDesc}>
                  <Text style={styles.timelineTime}>08:00:01</Text> — Multi-sensor input cluster detected
                </Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: colors.tint }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>Detected</Text>
                <Text style={styles.timelineDesc}>
                  <Text style={styles.timelineTime}>08:00:14</Text> — Incident IQ-992 identified as Critical
                </Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: colors.tint }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>Analyzed</Text>
                <Text style={styles.timelineDesc}>
                  <Text style={styles.timelineTime}>08:00:22</Text> — AI Agent predicting 15m gridlock ripple
                </Text>
              </View>
            </View>

            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: colors.tint }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineLabel}>Actions Taken</Text>
                <Text style={styles.timelineDesc}>
                  <Text style={styles.timelineTime}>08:00:35</Text> — Rerouting plan deployed to 12 active sectors
                </Text>
              </View>
            </View>
          </View>

          {/* Close Button */}
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>Return to Operational Dashboard</Text>
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
    backgroundColor: "#0A0C10",
  },
  backBtn: { width: 40 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#E6EDF3", letterSpacing: -0.5 },
  headerLoc: { color: "#E6EDF3", fontSize: 14, fontFamily: "Inter_700Bold", width: 100, textAlign: 'right' },
  content: { padding: 16 },
  titleSection: { marginBottom: 24 },
  titleText: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#E6EDF3", marginBottom: 4 },
  subtitleText: { fontSize: 12, color: "#8B949E", fontFamily: "Inter_400Regular" },
  mapsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  miniMap: { flex: 1, height: 160, backgroundColor: '#111418', borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  miniMapHeader: { position: 'absolute', top: 12, left: 12, zIndex: 10 },
  miniMapLabel: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
  miniMapSub: { fontSize: 9, fontFamily: 'Inter_700Bold', color: '#484E5D', marginTop: 2 },
  mainMetricCard: { backgroundColor: '#111418', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#1C2128', marginBottom: 12 },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  metricLabel: { fontSize: 10, fontFamily: 'Inter_700Bold', color: '#8B949E', letterSpacing: 0.5 },
  metricValue: { fontSize: 28, fontFamily: 'Inter_700Bold', color: '#E6EDF3' },
  metricSub: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#484E5D' },
  metricsGrid: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  gridCard: { flex: 1, backgroundColor: '#111418', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#1C2128' },
  gridLabel: { fontSize: 10, fontFamily: 'Inter_700Bold', color: '#8B949E', letterSpacing: 0.5, marginBottom: 12 },
  gridValue: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#E6EDF3' },
  gridSub: { fontSize: 11, fontFamily: 'Inter_700Bold', color: '#8B949E', marginTop: 4 },
  timelineSection: { backgroundColor: '#111418', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#1C2128', marginBottom: 32 },
  timelineTitle: { fontSize: 10, fontFamily: 'Inter_700Bold', color: '#8B949E', letterSpacing: 0.5, marginBottom: 20 },
  timelineItem: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  timelineDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  timelineContent: { flex: 1 },
  timelineLabel: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#E6EDF3', marginBottom: 4 },
  timelineDesc: { fontSize: 12, color: '#8B949E', fontFamily: 'Inter_400Regular', lineHeight: 18 },
  timelineTime: { color: '#E6EDF3', fontFamily: 'Inter_600SemiBold' },
  closeBtn: { paddingVertical: 16, alignItems: 'center' },
  closeBtnText: { color: '#3B8DD4', fontSize: 14, fontFamily: 'Inter_700Bold' },
});
