// @ts-nocheck
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export type GuideFileType = 'pdf' | 'doc' | 'image' | 'link';

export interface TuningGuide {
  id: string;
  title: string;
  source: string;
  sourceUrl?: string;
  fileUrl?: string;
  fileType: GuideFileType;
  description?: string;
  year?: number;
  tags?: string[];
  rating?: number;
  downloads?: number;
}

export interface TuningGuideListProps {
  boatClass: string;
  guides: TuningGuide[];
  loading?: boolean;
  error?: string | null;
  fallbackGuides?: TuningGuide[];
  onOpenGuide?: (guide: TuningGuide) => void;
  onRetry?: () => void;
  emptyStateMessage?: string;
}

const FILE_TYPE_STYLES: Record<
  GuideFileType,
  { background: string; text: string; label: string }
> = {
  pdf: { background: '#FEE2E2', text: '#B91C1C', label: 'PDF' },
  link: { background: '#DBEAFE', text: '#1D4ED8', label: 'Link' },
  image: { background: '#F1F5F9', text: '#0F172A', label: 'Image' },
  doc: { background: '#F1F5F9', text: '#0F172A', label: 'Doc' },
};

export function TuningGuideList({
  boatClass,
  guides,
  loading = false,
  error,
  fallbackGuides = [],
  onOpenGuide,
  onRetry,
  emptyStateMessage = 'We\'re curating verified tuning matrices, rig numbers, and trim playbooks for this class.',
}: TuningGuideListProps) {
  const displayGuides = guides.length > 0 ? guides : fallbackGuides;

  if (loading && guides.length === 0 && fallbackGuides.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="book-outline" size={40} color="#94A3B8" />
        <Text style={styles.loadingText}>Loading tuning guides…</Text>
      </View>
    );
  }

  if (displayGuides.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="book" size={46} color="#CBD5E1" />
        <Text style={styles.emptyTitle}>No tuning guides yet</Text>
        <Text style={styles.emptyMessage}>
          {emptyStateMessage.replace('{class}', boatClass)}
        </Text>
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Ionicons name="refresh" size={16} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Refresh</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{boatClass} tuning guides</Text>
        <Text style={styles.subtitle}>
          {displayGuides.length} guide{displayGuides.length === 1 ? '' : 's'} available
        </Text>
        {error && (
          <Text style={styles.errorText}>{error} Showing curated recommendations instead.</Text>
        )}
      </View>

      <View style={styles.guideList}>
        {displayGuides.map((guide) => {
          const typeStyles = FILE_TYPE_STYLES[guide.fileType] ?? FILE_TYPE_STYLES.link;

          return (
            <TouchableOpacity
              key={guide.id}
              style={styles.guideCard}
              onPress={() => onOpenGuide?.(guide)}
              disabled={!onOpenGuide}
            >
              <View style={styles.guideHeader}>
                <View style={styles.guideTitleContainer}>
                  <Text style={styles.guideTitle}>{guide.title}</Text>
                  <Text style={styles.guideSource}>
                    {guide.source}
                    {guide.year ? ` • ${guide.year}` : ''}
                  </Text>
                </View>
                <View
                  style={[
                    styles.fileBadge,
                    { backgroundColor: typeStyles.background },
                  ]}
                >
                  <Text style={[styles.fileBadgeText, { color: typeStyles.text }]}>
                    {typeStyles.label}
                  </Text>
                </View>
              </View>

              {guide.description && (
                <Text style={styles.description}>{guide.description}</Text>
              )}

              {guide.tags && guide.tags.length > 0 && (
                <View style={styles.tagsRow}>
                  {guide.tags.slice(0, 5).map((tag) => (
                    <View key={tag} style={styles.tagChip}>
                      <Ionicons name="pricetag" size={12} color="#64748B" />
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.footerRow}>
                <View style={styles.statsRow}>
                  {guide.rating && (
                    <View style={styles.stat}>
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Text style={styles.statText}>{guide.rating.toFixed(1)}</Text>
                    </View>
                  )}
                  {guide.downloads && (
                    <View style={styles.stat}>
                      <Ionicons name="download" size={14} color="#64748B" />
                      <Text style={styles.statText}>{guide.downloads.toLocaleString()}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.openRow}>
                  <Text style={styles.openText}>Open guide</Text>
                  <Ionicons name="open-outline" size={16} color="#3B82F6" />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerTitle}>Tuning guide disclaimer</Text>
        <Text style={styles.disclaimerText}>
          Guides are published by sail makers and class experts. Confirm local class rules before
          making structural changes to your rig.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#475569',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#B45309',
    marginTop: 4,
  },
  guideList: {
    gap: 12,
  },
  guideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  guideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  guideTitleContainer: {
    flex: 1,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  guideSource: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
  },
  fileBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  fileBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#475569',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#475569',
  },
  openRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  openText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  disclaimer: {
    marginTop: 20,
    padding: 14,
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
  },
  disclaimerTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D4ED8',
    marginBottom: 4,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#1E3A8A',
    lineHeight: 16,
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  emptyMessage: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#475569',
  },
});

export default TuningGuideList;
