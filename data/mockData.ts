export interface Signal {
  id: string;
  text: string;
  type: string;
  normalizedText: string;
  detectedLanguage: string;
  location: string;
  timestamp: string;
}

export interface Crisis {
  id: string;
  type: string;
  location: string;
  severity: "Critical" | "Severe" | "Moderate" | "Low";
  confidenceScore: number;
  status: "Active" | "Monitoring" | "Resolved";
  timestamp: string;
  severityLevel: string;
  impactEstimate: string;
  affectedArea: string;
  reasoning: string;
  recommendedActions: string[];
  signals: Signal[];
  coordinates: { lat: number; lng: number };
}

export interface Action {
  id: string;
  crisisId: string;
  crisisType: string;
  location: string;
  title: string;
  description: string;
  status: "Simulated" | "Pending" | "Resolved";
  beforeMetrics: Record<string, string | number>;
  afterMetrics: Record<string, string | number>;
  timestamp: string;
}

export interface AgentLog {
  id: string;
  agent: 1 | 2 | 3 | 4;
  crisisId: string;
  action: string;
  timestamp: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  reasoning: string;
}

export const CRISES: Crisis[] = [
  {
    id: "1",
    type: "Flash Flood",
    location: "Shahrah-e-Faisal, Area 4",
    severity: "Critical",
    confidenceScore: 0.87,
    status: "Active",
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    severityLevel: "Critical",
    impactEstimate: "High (Road Block)",
    affectedArea: "Shahrah-e-Faisal",
    reasoning: "Heavy rainfall causing immediate flooding on major arterial road.",
    recommendedActions: ["Divert traffic", "Alert emergency services"],
    signals: [],
    coordinates: { lat: 24.86, lng: 67.01 },
  },
  {
    id: "2",
    type: "Grid Failure",
    location: "Gulshan-e-Iqbal, Block 4",
    severity: "Severe",
    confidenceScore: 0.94,
    status: "Active",
    timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
    severityLevel: "Warning",
    impactEstimate: "2 Units Dispatched",
    affectedArea: "Gulshan-e-Iqbal",
    reasoning: "Transformer failure reported by utility sensors and social media.",
    recommendedActions: ["Dispatch repair crew", "Notify residents"],
    signals: [],
    coordinates: { lat: 24.91, lng: 67.09 },
  },
  {
    id: "3",
    type: "Large Assembly",
    location: "Clifton Sea View",
    severity: "Moderate",
    confidenceScore: 0.72,
    status: "Monitoring",
    timestamp: new Date(Date.now() - 24 * 60000).toISOString(),
    severityLevel: "Monitoring",
    impactEstimate: "Stable (4.2k pax)",
    affectedArea: "Clifton",
    reasoning: "Unscheduled gathering detected via social media and traffic patterns.",
    recommendedActions: ["Monitor crowd size", "Traffic management"],
    signals: [],
    coordinates: { lat: 24.81, lng: 67.03 },
  },
];

export const ACTIONS: Action[] = [
  {
    id: "a1",
    crisisId: "1",
    crisisType: "Urban Flood",
    location: "G-10, Islamabad",
    title: "Emergency Flood Response Deployment",
    description:
      "Deploy 12 flood response teams with rescue boats and emergency supplies to G-10 sector",
    status: "Simulated",
    beforeMetrics: {
      "Response Teams": 0,
      "Rescue Boats": 0,
      "People Reached": 0,
      "Estimated Time": "N/A",
    },
    afterMetrics: {
      "Response Teams": 12,
      "Rescue Boats": 8,
      "People Reached": 38000,
      "Estimated Time": "18 min",
    },
    timestamp: "2025-05-15T08:32:00Z",
  },
  {
    id: "a2",
    crisisId: "1",
    crisisType: "Urban Flood",
    location: "G-10, Islamabad",
    title: "Evacuation Advisory & Shelter Opening",
    description:
      "Mandatory evacuation for G-10/1 and G-10/2, emergency shelters opened in G-9 and G-11",
    status: "Resolved",
    beforeMetrics: {
      Evacuated: 0,
      "Shelter Capacity": 5000,
      "Alerts Sent": 0,
    },
    afterMetrics: {
      Evacuated: 8500,
      "Shelter Capacity": 5000,
      "Alerts Sent": 45000,
    },
    timestamp: "2025-05-15T08:45:00Z",
  },
  {
    id: "a3",
    crisisId: "2",
    crisisType: "Heatwave Emergency",
    location: "Central Karachi",
    title: "Cooling Centers Activation",
    description:
      "Open 25 cooling centers across Karachi with water and medical support for heat-affected residents",
    status: "Simulated",
    beforeMetrics: {
      "Cooling Centers": 0,
      "Water Distributed": "0 L",
      "Medical Staff": 0,
    },
    afterMetrics: {
      "Cooling Centers": 25,
      "Water Distributed": "50,000 L",
      "Medical Staff": 75,
    },
    timestamp: "2025-05-15T10:20:00Z",
  },
  {
    id: "a4",
    crisisId: "3",
    crisisType: "Road Blockage",
    location: "M-2 Highway",
    title: "Traffic Diversion Protocol",
    description:
      "Divert M-2 traffic via GT Road and deploy 8 traffic police units to manage flow",
    status: "Pending",
    beforeMetrics: {
      "Traffic Flow": "Blocked",
      "Wait Time": "120+ min",
      "Alternate Routes": 0,
    },
    afterMetrics: {
      "Traffic Flow": "Diverted",
      "Wait Time": "35 min",
      "Alternate Routes": 2,
    },
    timestamp: "2025-05-15T11:50:00Z",
  },
];

export const LOGS: AgentLog[] = [
  {
    id: "l1",
    agent: 1,
    crisisId: "1",
    action: "Signal Ingestion",
    timestamp: "2025-05-15T08:25:10Z",
    input: {
      text: "پانی بہت زیادہ ہے گھروں میں گھس رہا ہے",
      type: "Social Media",
      location: "G-10 Islamabad",
    },
    output: {
      normalized_text: "Water level is very high, flooding is entering homes",
      detected_language: "Urdu",
      location: "G-10, Islamabad",
      timestamp: "2025-05-15T08:25:10Z",
    },
    reasoning:
      "Detected Urdu script using language identification model. Applied Urdu-to-English normalization pipeline. Location extracted from context and validated against known city sectors.",
  },
  {
    id: "l2",
    agent: 2,
    crisisId: "1",
    action: "Crisis Detection",
    timestamp: "2025-05-15T08:26:05Z",
    input: {
      signals_count: 3,
      location: "G-10, Islamabad",
      signal_types: ["Social Media", "Weather Alert", "Traffic Report"],
    },
    output: {
      crisis_type: "Urban Flood",
      confidence_score: 0.92,
      severity: "Critical",
      explanation:
        "High-confidence flood cluster detected from 3 independent sources",
    },
    reasoning:
      "Clustered 3 corroborating signals with geographic overlap in G-10. Rainfall + social reports + traffic congestion is a textbook urban flood signature. Confidence boosted to 0.92 by PMD official alert.",
  },
  {
    id: "l3",
    agent: 3,
    crisisId: "1",
    action: "Situation Analysis",
    timestamp: "2025-05-15T08:27:02Z",
    input: {
      crisis_type: "Urban Flood",
      confidence_score: 0.92,
      location: "G-10, Islamabad",
    },
    output: {
      severity_level: "Critical",
      impact_estimate: "~50,000 residents affected",
      affected_area: "2.3 km radius around G-10/1",
      recommended_actions: 4,
    },
    reasoning:
      "Cross-referenced population density data with G-10 flood zone maps. Critical infrastructure at risk includes 2 hospitals and 12 schools within 2km radius. Rainfall rate of 40mm/hour exceeds drainage capacity by 3x.",
  },
  {
    id: "l4",
    agent: 4,
    crisisId: "1",
    action: "Action Planning",
    timestamp: "2025-05-15T08:28:15Z",
    input: {
      severity_level: "Critical",
      impact_estimate: "~50,000 residents",
      affected_area: "2.3 km radius",
    },
    output: {
      actions_generated: 4,
      simulation_status: "Complete",
      projected_impact_reduction: "76%",
      estimated_response_time: "18 min",
    },
    reasoning:
      "Generated optimal response plan from NDMA emergency protocols. Simulated 3 deployment scenarios; proposed plan shows 76% reduction in affected population. Prioritized rescue boats for G-10/1 due to elevation data.",
  },
  {
    id: "l5",
    agent: 1,
    crisisId: "2",
    action: "Signal Ingestion",
    timestamp: "2025-05-15T10:10:22Z",
    input: {
      text: "Extreme heat in Karachi 48 degrees celsius unbearable",
      type: "Social Media",
      location: "Karachi",
    },
    output: {
      normalized_text:
        "Extreme heat in Karachi reaching 48°C, conditions critical for residents",
      detected_language: "English",
      location: "Karachi",
      timestamp: "2025-05-15T10:10:22Z",
    },
    reasoning:
      "English text detected. Temperature value '48 degrees celsius' extracted and formatted. Value cross-validated against PMD historical records; 48°C is within observed Karachi extremes.",
  },
  {
    id: "l6",
    agent: 2,
    crisisId: "2",
    action: "Crisis Detection",
    timestamp: "2025-05-15T10:11:18Z",
    input: {
      signals_count: 3,
      location: "Karachi",
      signal_types: ["Social Media", "Medical Alert", "Utility Report"],
    },
    output: {
      crisis_type: "Heatwave Emergency",
      confidence_score: 0.87,
      severity: "Severe",
      explanation:
        "3 independent signals confirm severe heat emergency in Karachi",
    },
    reasoning:
      "Medical alert from Lyari Hospital provides strong corroboration for environmental signals. Power outage data amplifies danger. Confidence at 0.87 due to lack of official meteorological alert.",
  },
  {
    id: "l7",
    agent: 3,
    crisisId: "2",
    action: "Situation Analysis",
    timestamp: "2025-05-15T10:12:44Z",
    input: {
      crisis_type: "Heatwave Emergency",
      confidence_score: 0.87,
      location: "Karachi",
    },
    output: {
      severity_level: "Severe",
      impact_estimate: "~200,000 residents at risk",
      affected_area: "Central & East Karachi",
      recommended_actions: 4,
    },
    reasoning:
      "Population density analysis of Central/East Karachi shows 200k+ residents in high-risk zones. Power outages affecting 60% of city eliminate cooling options for majority. Elderly and children identified as highest risk groups.",
  },
  {
    id: "l8",
    agent: 1,
    crisisId: "3",
    action: "Signal Ingestion",
    timestamp: "2025-05-15T11:40:55Z",
    input: {
      text: "Major accident on M-2 near Sheikhupura interchange multiple trucks",
      type: "Traffic Report",
      location: "M-2 Highway",
    },
    output: {
      normalized_text:
        "Multi-vehicle accident on M-2 Highway near Sheikhupura interchange causing complete blockage",
      detected_language: "English",
      location: "M-2 Highway, Sheikhupura",
      timestamp: "2025-05-15T11:40:55Z",
    },
    reasoning:
      "Single signal detected. Location resolved to M-2 Km 47 using highway interchange database. Incident classified as traffic emergency pending additional signal correlation.",
  },
  {
    id: "l9",
    agent: 2,
    crisisId: "3",
    action: "Crisis Detection",
    timestamp: "2025-05-15T11:41:30Z",
    input: {
      signals_count: 1,
      location: "M-2 Highway",
      signal_types: ["Traffic Report"],
    },
    output: {
      crisis_type: "Road Blockage",
      confidence_score: 0.78,
      severity: "Moderate",
      explanation:
        "Single-source signal indicates road blockage; moderate confidence pending corroboration",
    },
    reasoning:
      "Only 1 signal available. Confidence capped at 0.78 for single-source events. Road blockage pattern matches M-2 incident database for peak hours. Monitoring for additional signals.",
  },
];
