import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Inject Leaflet CSS dynamically (avoids CSS import issues in Expo web)
function useLeafletCSS() {
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }
    }
  }, []);
}

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const KARACHI_CENTER: [number, number] = [24.8607, 67.0011];

// Bounding box that covers Karachi only — user cannot pan outside this
const KARACHI_BOUNDS: [[number, number], [number, number]] = [
  [24.74, 66.85], // South-West corner
  [25.10, 67.25], // North-East corner
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
  useLeafletCSS();

  const getSeverityColor = (severity: string) => {
    const sev = (severity || "").toLowerCase();
    if (sev === "critical") return "#FF6B6B";
    if (sev === "severe" || sev === "high") return "#FFA500";
    return "#3B8DD4";
  };

  const createCustomIcon = (severity: string) =>
    L.divIcon({
      className: "",
      html: `<div style="
        width: 18px;
        height: 18px;
        background-color: ${getSeverityColor(severity)};
        border-radius: 50%;
        border: 3px solid rgba(13,17,23,0.9);
        box-shadow: 0 0 12px ${getSeverityColor(severity)};
      "></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });

  // A deterministic spread using the golden angle to offset markers sharing exact/close coordinates
  const getJitteredPosition = (lat: number, lng: number, id: number): [number, number] => {
    const angle = (id * 137.5) * (Math.PI / 180); // Golden angle
    const radius = 0.0015 + (id % 3) * 0.0008; // Shift by ~150 to ~300 meters
    return [lat + Math.sin(angle) * radius, lng + Math.cos(angle) * radius];
  };

  return (
    <View style={styles.container}>
      <div style={{ height: "100%", width: "100%" }}>
        <MapContainer
          center={KARACHI_CENTER}
          zoom={12}
          minZoom={11}
          maxZoom={16}
          maxBounds={KARACHI_BOUNDS}
          maxBoundsViscosity={1.0}
          style={{ height: "100%", width: "100%", background: "#0d1117" }}
          zoomControl={false}
          attributionControl={false}
        >
          {/* CartoDB Dark Matter - free, no API key needed */}
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

          {crises
            .filter((c) => c.latitude && c.longitude)
            .map((crisis) => {
              const [jLat, jLng] = getJitteredPosition(crisis.latitude!, crisis.longitude!, crisis.id);
              return (
                <Marker
                  key={crisis.id}
                  position={[jLat, jLng]}
                  icon={createCustomIcon(crisis.severity)}
                >
                  <Popup>
                    <div style={{ color: "#0d1117", fontWeight: "bold" }}>
                      {crisis.crisis_type}
                      <br />
                      <span style={{ fontWeight: "normal" }}>{crisis.location}</span>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>
      </div>

      {/* AI Engine Active badge */}
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
