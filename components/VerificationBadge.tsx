import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { textShrink } from '@/constants/layout';

interface VerificationBadgeProps {
  score?: number | null;
  isAiGenerated?: boolean;
  compact?: boolean;
}

export default function VerificationBadge({ score, isAiGenerated, compact }: VerificationBadgeProps) {
  if (score == null && !isAiGenerated) return null;

  if (isAiGenerated) {
    return (
      <View style={[styles.badge, styles.aiBadge, compact && styles.compact]}>
        <MaterialCommunityIcons name="robot-outline" size={compact ? 10 : 12} color="#FF6B6B" />
        <Text style={[styles.text, textShrink, { color: '#FF6B6B' }]} numberOfLines={1}>
          AI SUSPECTED
        </Text>
      </View>
    );
  }

  const pct = Math.round((score ?? 0) * 100);
  const verified = pct >= 60;
  const label = verified ? `VERIFIED ${pct}%` : `LOW TRUST ${pct}%`;

  return (
    <View style={[styles.badge, verified ? styles.verified : styles.unverified, compact && styles.compact]}>
      <MaterialCommunityIcons
        name={verified ? 'shield-check' : 'shield-alert-outline'}
        size={compact ? 10 : 12}
        color={verified ? '#3FB950' : '#F0883E'}
      />
      <Text
        style={[styles.text, textShrink, { color: verified ? '#3FB950' : '#F0883E' }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    maxWidth: '100%',
  },
  compact: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  verified: {
    backgroundColor: 'rgba(63,185,80,0.08)',
    borderColor: 'rgba(63,185,80,0.25)',
  },
  unverified: {
    backgroundColor: 'rgba(240,136,62,0.08)',
    borderColor: 'rgba(240,136,62,0.25)',
  },
  aiBadge: {
    backgroundColor: 'rgba(255,107,107,0.08)',
    borderColor: 'rgba(255,107,107,0.25)',
  },
  text: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.3,
  },
});
