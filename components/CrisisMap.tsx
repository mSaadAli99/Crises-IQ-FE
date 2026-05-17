import React from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Karachi coordinates
const KARACHI_REGION = {
  latitude: 24.8607,
  longitude: 67.0011,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

// Dark map style (Google Maps custom JSON style)
const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0d1117" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8b949e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0d1117" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#1c2128" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#8b949e" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#21262d" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1c2128" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#30363d" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#21262d" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0a0c10" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3b8dd4" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#161b22" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#0d1117" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#161b22" }] },
];

interface Crisis {
  id: number;
  crisis_type: string;
  location: string;
  latitude?: number;
  longitude?: number;
  severity: string;
}

interface CrisisMapProps {
  crises: Crisis[];
}

export default function CrisisMap({ crises }: CrisisMapProps) {
  const getSeverityColor = (severity: string) => {
    const sev = (severity || "").toLowerCase();
    if (sev === "critical") return "#FF6B6B";
    if (sev === "severe" || sev === "high") return "#FFA500";
    return "#3B8DD4";
  };

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={KARACHI_REGION}
        customMapStyle={DARK_MAP_STYLE}
        showsUserLocation={false}
        showsCompass={false}
        showsScale={false}
        toolbarEnabled={false}
      >
        {crises
          .filter((c) => c.latitude && c.longitude)
          .map((crisis) => (
            <Marker
              key={crisis.id}
              coordinate={{
                latitude: crisis.latitude!,
                longitude: crisis.longitude!,
              }}
              title={crisis.crisis_type}
              description={crisis.location}
            >
              <View style={[styles.markerContainer, { borderColor: getSeverityColor(crisis.severity) }]}>
                <View style={[styles.markerDot, { backgroundColor: getSeverityColor(crisis.severity) }]} />
              </View>
            </Marker>
          ))}
      </MapView>

      {/* Overlays */}
      <View style={styles.statusPill}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>AI ENGINE ACTIVE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 280,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#30363D",
  },
  markerContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(13,17,23,0.8)",
  },
  markerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusPill: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(13,17,23,0.85)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: "#30363D",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#3FB950",
  },
  statusText: {
    color: "#E6EDF3",
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
});
