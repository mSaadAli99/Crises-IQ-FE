import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { SocialVerificationPost } from '@/hooks/useCrises';
import { textShrink } from '@/constants/layout';

interface SocialFeedProps {
  posts: SocialVerificationPost[];
  count?: number;
}

export default function SocialFeed({ posts, count }: SocialFeedProps) {
  const items = posts?.length ? posts : [];
  const displayCount = count ?? items.length;

  if (items.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Ionicons name="globe-outline" size={22} color="#484E5D" />
        <Text style={styles.emptyText}>No social verification posts indexed for this crisis yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      <Text style={styles.countLabel}>
        {displayCount} CROSS-VERIFIED SOURCE{displayCount === 1 ? '' : 'S'}
      </Text>
      {items.map((post, index) => (
        <View key={`${post.username}-${index}`} style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="logo-twitter" size={14} color="#1DA1F2" style={styles.platformIcon} />
            <Text style={[styles.username, textShrink]} numberOfLines={1}>
              @{post.username || 'unknown'}
            </Text>
            {post.platform ? (
              <Text style={[styles.platform, textShrink]} numberOfLines={1}>
                {post.platform}
              </Text>
            ) : null}
          </View>
          {post.timestamp ? (
            <Text style={styles.time} numberOfLines={1}>
              {post.timestamp}
            </Text>
          ) : null}
          <Text style={[styles.body, textShrink]}>"{post.text || 'No content'}"</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  countLabel: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#484E5D',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  card: {
    backgroundColor: '#161B22',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#30363D',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  platformIcon: {
    flexShrink: 0,
  },
  username: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#E6EDF3',
  },
  platform: {
    flexShrink: 0,
    maxWidth: '40%',
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: '#8B949E',
    textAlign: 'right',
  },
  time: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: '#484E5D',
    marginBottom: 8,
  },
  body: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#E6EDF3',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  emptyCard: {
    backgroundColor: '#161B22',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#30363D',
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#8B949E',
    textAlign: 'center',
  },
});
