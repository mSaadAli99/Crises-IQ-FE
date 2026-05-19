import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { textShrink } from '@/constants/layout';

interface MetricsBlockProps {
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
}

function formatMetrics(metrics: Record<string, unknown>): string {
  return Object.entries(metrics)
    .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`)
    .join(' · ');
}

export default function MetricsBlock({ before, after }: MetricsBlockProps) {
  if (!before && !after) return null;

  return (
    <View style={styles.container}>
      {before && Object.keys(before).length > 0 ? (
        <View style={styles.row}>
          <Text style={styles.label}>BEFORE</Text>
          <Text style={[styles.value, textShrink]}>{formatMetrics(before)}</Text>
        </View>
      ) : null}
      {after && Object.keys(after).length > 0 ? (
        <View style={[styles.row, before ? styles.rowSpaced : null]}>
          <Text style={styles.label}>AFTER</Text>
          <Text style={[styles.value, styles.valueAfter, textShrink]}>{formatMetrics(after)}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 8,
    padding: 10,
    backgroundColor: 'rgba(13,17,23,0.5)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1C2128',
    overflow: 'hidden',
  },
  row: {
    gap: 4,
  },
  rowSpaced: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1C2128',
  },
  label: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    color: '#484E5D',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#8B949E',
    lineHeight: 16,
    flexWrap: 'wrap',
  },
  valueAfter: {
    color: '#3FB950',
  },
});
