import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
import CrisisMap from "@/components/CrisisMap";
import MetricsBlock from "@/components/MetricsBlock";
import SocialFeed from "@/components/SocialFeed";
import { useColors } from "@/hooks/useColors";
import { useCrisis } from "@/hooks/useCrises";
import { screenPadding, textShrink } from "@/constants/layout";

function ConfidenceCircle({ value }: { value: number }) {
  return (
    <View style={{
      width: 60,
      height: 60,
      borderRadius: 30,
      borderWidth: 3,
      borderColor: "#3B8DD4",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <Text style={{ fontSize: 14, fontFamily: 'Inter_700Bold', color: '#E6EDF3' }}>
        {Math.round(value * 100)}%
      </Text>
    </View>
  );
}

export default function CrisisDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const { data: crisis, isLoading, isError } = useCrisis(id);

  const signals = React.useMemo(() => {
    if (!crisis?.agent_logs) return [];
    
    // Extract unique signals processed by Ingestion (Agent 1) or Detection (Agent 2)
    const uniqueSignalsMap = new Map();
    
    crisis.agent_logs.forEach((log: any) => {
      if (log.agent_number === 2 && log.input_data?.signals) {
        log.input_data.signals.forEach((sig: any) => {
          const key = sig.normalized_text || sig.text;
          if (key) uniqueSignalsMap.set(key, sig);
        });
      }
      if (log.agent_number === 1 && log.output_data) {
        const sig = {
          normalized_text: log.output_data.normalized_text,
          source_type: log.output_data.source_type || "form",
          location: log.output_data.location || crisis.location,
        };
        const key = sig.normalized_text;
        if (key) uniqueSignalsMap.set(key, sig);
      }
    });
    
    return Array.from(uniqueSignalsMap.values());
  }, [crisis]);

  const filteredActions = React.useMemo(() => {
    if (!crisis?.actions) return [];
    return crisis.actions.filter((act: any) => (act.action_type || "").toLowerCase() !== "ticket");
  }, [crisis]);

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
        <Pressable 
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push("/");
            }
          }} 
          style={styles.backBtn}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Ionicons name="chevron-back" size={24} color="#E6EDF3" />
        </Pressable>
        <View style={[styles.logoRow, { flex: 1, minWidth: 0, justifyContent: 'center' }]}>
          <MaterialCommunityIcons name="asterisk" size={22} color={colors.tint} />
          <Text style={styles.headerTitle} numberOfLines={1}>CrisisIQ</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={[styles.headerLoc, textShrink]} numberOfLines={1}>
            {crisis.location.split(',')[0]}
          </Text>
          <Ionicons name="location-outline" size={14} color="#8B949E" style={{ flexShrink: 0 }} />
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad + 40 }}
      >
        <View style={styles.mapContainer}>
          <CrisisMap crises={[crisis]} />
        </View>

        <View style={styles.content}>
          {/* Main Detection Card */}
          <View style={[styles.mainCard, { backgroundColor: "#161B22", borderColor: "#30363D" }]}>
            <View style={styles.mainCardRow}>
              <View style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                <Text style={[styles.mainCardTitle, textShrink]} numberOfLines={2}>
                  {(crisis.crisis_type || "").toUpperCase()} Detection
                </Text>
                <Text style={styles.mainCardSubtitle}>
                  <Text style={{ color: crisis.status === 'resolved' ? '#3FB950' : colors.warning }}>
                    {(crisis.status || 'Active').toUpperCase()}
                  </Text>
                </Text>
              </View>
              <ConfidenceCircle value={crisis.confidence_score || 0} />
            </View>
            <Text style={styles.confidenceLabel}>AI CONFIDENCE SCORE: <Text style={{ color: colors.tint }}>{Math.round((crisis.confidence_score || 0) * 100)}%</Text></Text>
          </View>

          {/* Situation Analysis */}
          <View style={[styles.analysisCard, { backgroundColor: "#161B22", borderColor: "#30363D" }]}>
            <View style={styles.analysisHeader}>
              <Text style={[styles.analysisTitle, textShrink]}>SITUATION ANALYSIS</Text>
              <View style={[styles.severityTag, { backgroundColor: crisis.severity === 'critical' ? colors.critical + '20' : colors.warning + '20' }]}>
                <Text
                  style={[styles.severityTagText, { color: crisis.severity === 'critical' ? colors.critical : colors.warning }]}
                  numberOfLines={1}
                >
                  {(crisis.severity || 'Unknown').toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.analysisGrid}>
              <View style={[styles.analysisItem, styles.analysisItemHalf]}>
                <Text style={styles.analysisKey}>SEVERITY</Text>
                <Text style={[styles.analysisVal, textShrink]} numberOfLines={2}>
                  {(crisis.situation_report?.severity_level || crisis.severity || '--').toUpperCase()}
                </Text>
              </View>
              <View style={[styles.analysisItem, styles.analysisItemHalf]}>
                <Text style={styles.analysisKey}>LOCATION</Text>
                <Text style={[styles.analysisVal, textShrink]} numberOfLines={3}>
                  {crisis.location}
                </Text>
              </View>
            </View>

            {crisis.situation_report?.affected_area ? (
              <View style={{ marginBottom: 12 }}>
                <Text style={[styles.analysisKey, { marginBottom: 4 }]}>AFFECTED AREA</Text>
                <Text style={styles.analysisText}>{crisis.situation_report.affected_area}</Text>
              </View>
            ) : null}

            <Text style={styles.analysisText}>
              {crisis.situation_report?.reasoning || `Crisis reported at ${crisis.location}. Status: ${crisis.status || 'Active'}.`}
            </Text>
            {crisis.situation_report?.impact_estimate && (
              <View style={{ marginTop: 12 }}>
                <Text style={[styles.analysisKey, { marginBottom: 4 }]}>IMPACT ESTIMATE</Text>
                <Text style={styles.analysisText}>{crisis.situation_report.impact_estimate}</Text>
              </View>
            )}
          </View>

          <Text style={styles.sectionTitle}>SOCIAL VERIFICATION</Text>
          <View style={{ marginBottom: 24 }}>
            <SocialFeed
              posts={crisis.social_verification_sources || []}
              count={crisis.social_sources_count}
            />
          </View>

          <Text style={styles.sectionTitle}>INPUT SIGNALS ({signals.length})</Text>
          {signals.length > 0 ? (
            <View style={{ gap: 12, marginBottom: 24 }}>
              {signals.map((sig: any, index: number) => {
                const getSourceIcon = (source: string) => {
                  const s = (source || "").toLowerCase();
                  if (s.includes("weather")) return "cloud-outline";
                  if (s.includes("traffic")) return "car-outline";
                  if (s.includes("social")) return "chatbubble-outline";
                  return "document-text-outline";
                };

                const getSourceColor = (source: string) => {
                  const s = (source || "").toLowerCase();
                  if (s.includes("weather")) return colors.tint;
                  if (s.includes("traffic")) return colors.warning;
                  if (s.includes("social")) return "#1DA1F2";
                  return colors.text;
                };

                return (
                  <View key={index} style={[styles.socialCard, { marginBottom: 0 }]}>
                    <View style={styles.signalHeader}>
                      <Ionicons name={getSourceIcon(sig.source_type) as any} size={16} color={getSourceColor(sig.source_type)} style={{ flexShrink: 0 }} />
                      <Text style={[styles.signalLabel, textShrink]} numberOfLines={2}>
                        {(sig.source_type || "intelligence").toUpperCase()} · {sig.location || crisis.location}
                      </Text>
                    </View>
                    <Text style={[styles.socialText, textShrink]}>
                      "{sig.normalized_text || sig.text || "No signal details available."}"
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={[styles.socialCard, { padding: 16, alignItems: 'center', marginBottom: 24 }]}>
              <Ionicons name="information-circle-outline" size={24} color={colors.mutedForeground} style={{ marginBottom: 4 }} />
              <Text style={[styles.socialText, { color: colors.mutedForeground, textAlign: 'center' }]}>
                No direct sensor/ingestion signals logged for this crisis.
              </Text>
            </View>
          )}

          {/* Recommended Actions */}
          <Text style={styles.sectionTitle}>RECOMMENDED ACTIONS ({filteredActions.length})</Text>
          <View style={styles.actionsList}>
            {filteredActions.length > 0 ? (
              filteredActions.map((act: any) => {
                const getActionIcon = (type: string) => {
                  const t = (type || "").toLowerCase();
                  if (t.includes("reroute")) return "routes";
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

                return (
                  <View 
                    key={act.id} 
                    style={[
                      styles.actionBtnSecondary, 
                      { 
                        flexDirection: 'column', 
                        alignItems: 'stretch',
                        backgroundColor: "#161B22",
                        borderColor: "#30363D",
                        padding: 16,
                        gap: 8
                      }
                    ]}
                  >
                    <View style={styles.actionCardHeader}>
                      <MaterialCommunityIcons
                        name={getActionIcon(act.action_type) as any}
                        size={20}
                        color={getActionColor(act.action_type)}
                        style={{ flexShrink: 0 }}
                      />
                      <Text
                        style={[styles.actionBtnText, textShrink, { color: getActionColor(act.action_type) }]}
                        numberOfLines={1}
                      >
                        {(act.action_type || "action").toUpperCase()}
                      </Text>
                      <View style={{
                        backgroundColor: act.status === 'simulated' ? 'rgba(59,141,212,0.15)' : 'rgba(63,185,80,0.15)',
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 4,
                        flexShrink: 0,
                      }}>
                        <Text style={{
                          fontSize: 10,
                          fontFamily: 'Inter_700Bold',
                          color: act.status === 'simulated' ? colors.tint : '#3FB950',
                        }}>
                          {(act.status || "pending").toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <Text style={[styles.actionDesc, textShrink]}>
                      {act.description}
                    </Text>

                    {act.simulation_result?.message && (
                      <View style={{ 
                        marginTop: 4, 
                        borderLeftWidth: 2, 
                        borderLeftColor: colors.tint, 
                        paddingLeft: 8,
                        backgroundColor: 'rgba(13,17,23,0.4)',
                        paddingVertical: 6,
                        borderRadius: 4
                      }}>
                        <Text style={{ fontSize: 11, fontStyle: 'italic', color: '#8B949E' }}>
                          "Simulation: {act.simulation_result.message}"
                        </Text>
                      </View>
                    )}

                    <MetricsBlock before={act.before_metrics} after={act.after_metrics} />
                  </View>
                );
              })
            ) : (
              <View style={[styles.actionBtnSecondary, { justifyContent: 'center', padding: 16 }]}>
                <Text style={[styles.actionBtnText, { textAlign: 'center', color: colors.mutedForeground }]}>
                  No recommended actions have been generated yet.
                </Text>
              </View>
            )}
          </View>
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
    paddingHorizontal: screenPadding,
    paddingBottom: 12,
    gap: 8,
    zIndex: 10,
    backgroundColor: "#0A0C10",
  },
  backBtn: { width: 36, flexShrink: 0 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#E6EDF3", letterSpacing: -0.5 },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
    minWidth: 0,
    maxWidth: "42%",
    justifyContent: 'flex-end',
  },
  headerLoc: { color: "#8B949E", fontSize: 11, fontFamily: "Inter_700Bold", textAlign: 'right' },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  notFoundText: { fontSize: 16, fontFamily: "Inter_400Regular" },
  mapContainer: { height: 240, overflow: 'hidden' },
  mapOverlays: { position: 'absolute', top: 16, left: 16, gap: 8 },
  alertBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4 },
  alertBadgeText: { color: '#fff', fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
  zoneBadge: { backgroundColor: 'rgba(13,17,23,0.8)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4 },
  zoneBadgeText: { color: '#8B949E', fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
  content: { padding: screenPadding },
  mainCard: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16, overflow: 'hidden' },
  mainCardRow: { flexDirection: 'row', alignItems: 'center' },
  mainCardTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', color: '#E6EDF3', marginBottom: 4 },
  mainCardSubtitle: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#8B949E' },
  confidenceContainer: { width: 60, height: 60 },
  confidenceText: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#E6EDF3' },
  confidenceLabel: { fontSize: 10, fontFamily: 'Inter_700Bold', color: '#484E5D', marginTop: 12, letterSpacing: 0.5 },
  analysisCard: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16, overflow: 'hidden' },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 16,
  },
  analysisTitle: { flex: 1, fontSize: 11, fontFamily: 'Inter_700Bold', color: '#8B949E', letterSpacing: 0.5 },
  severityTag: {
    backgroundColor: 'rgba(255,138,107,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    flexShrink: 0,
    maxWidth: '45%',
  },
  severityTagText: { color: '#FF8A6B', fontSize: 10, fontFamily: 'Inter_700Bold' },
  analysisGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 16 },
  analysisItem: { gap: 4 },
  analysisItemHalf: { width: '47%', minWidth: 120 },
  analysisKey: { fontSize: 10, fontFamily: 'Inter_700Bold', color: '#484E5D', letterSpacing: 0.5 },
  analysisVal: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#E6EDF3' },
  analysisText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: '#E6EDF3', lineHeight: 20 },
  sectionTitle: { fontSize: 11, fontFamily: 'Inter_700Bold', color: '#484E5D', letterSpacing: 0.5, marginBottom: 12 },
  signalsGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  signalMiniCard: { flex: 1, backgroundColor: '#161B22', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#30363D' },
  signalHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  signalLabel: { fontSize: 10, fontFamily: 'Inter_700Bold', color: '#8B949E' },
  signalVal: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#E6EDF3' },
  socialCard: {
    backgroundColor: '#161B22',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#30363D',
    overflow: 'hidden',
  },
  actionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionDesc: {
    fontSize: 13,
    color: '#E6EDF3',
    lineHeight: 18,
    fontFamily: 'Inter_400Regular',
  },
  socialText: { fontSize: 13, fontFamily: 'Inter_400Regular', color: '#E6EDF3', fontStyle: 'italic', lineHeight: 18 },
  actionsList: { gap: 10, marginBottom: 32 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 8, gap: 12 },
  actionBtnSecondary: {
    borderRadius: 8,
    backgroundColor: '#161B22',
    borderWidth: 1,
    borderColor: '#30363D',
    overflow: 'hidden',
  },
  actionBtnText: { flex: 1, fontSize: 14, fontFamily: 'Inter_700Bold', color: '#E6EDF3' },
  simulationBtn: { backgroundColor: '#E6EDF3', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12, gap: 10 },
  simulationBtnText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: '#0A0C10' },
});
