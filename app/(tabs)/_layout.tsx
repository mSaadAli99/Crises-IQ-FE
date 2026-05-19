import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="report">
        <Icon sf={{ default: "antenna.radiowaves.left.and.right", selected: "antenna.radiowaves.left.and.right" }} />
        <Label>Report</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="actions">
        <Icon sf={{ default: "checkmark.circle", selected: "checkmark.circle.fill" }} />
        <Label>Actions</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="logs">
        <Icon sf={{ default: "list.bullet.rectangle", selected: "list.bullet.rectangle.fill" }} />
        <Label>Logs</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#A4D0F1",
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "#0A0C10",
          borderTopWidth: 1,
          borderTopColor: "#30363D",
          elevation: 0,
          paddingBottom: insets.bottom + 8,
          paddingTop: 6,
          height: 64 + insets.bottom,
          ...(isWeb ? { height: 76 } : {}),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: "Inter_600SemiBold",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="grid" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: "Report",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="antenna" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="actions"
        options={{
          title: "Actions",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          title: "Logs",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="file-document-outline" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  return <ClassicTabLayout />;
}
