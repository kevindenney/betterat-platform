import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch } from 'react-native';

export type AudienceConfig = {
  id: string;
  label: string;
  description: string;
  channel: string;
  defaultEnabled?: boolean;
  badge?: string;
};

export type AttachmentPrompt = {
  id: string;
  label: string;
  helper: string;
  actionLabel?: string;
  onAttach?: () => void;
};

export type CommunicationTemplate = {
  id: string;
  label: string;
  summary: string;
  body: string;
};

export interface CollaborationBroadcastConsoleProps {
  title?: string;
  subtitle?: string;
  briefingContext?: string[];
  audiences?: AudienceConfig[];
  message?: string;
  onMessageChange?: (value: string) => void;
  templates?: CommunicationTemplate[];
  onTemplateSelect?: (template: CommunicationTemplate) => void;
  attachments?: AttachmentPrompt[];
  onSend?: () => void;
}

export const CollaborationBroadcastConsole: React.FC<CollaborationBroadcastConsoleProps> = ({
  title = 'Share the plan',
  subtitle = 'Push the latest intel to your crew, fleet, and coaching circle.',
  briefingContext = [],
  audiences = [],
  message = '',
  onMessageChange,
  templates = [],
  onTemplateSelect,
  attachments = [],
  onSend,
}) => {
  const [audienceState, setAudienceState] = React.useState<Record<string, boolean>>(
    () => Object.fromEntries(audiences.map((aud) => [aud.id, aud.defaultEnabled ?? true])),
  );

  const [activeTemplate, setActiveTemplate] = React.useState<string | null>(null);

  const handleToggleAudience = (audienceId: string) => {
    setAudienceState((prev) => ({
      ...prev,
      [audienceId]: !prev[audienceId],
    }));
  };

  const handleTemplateSelect = (template: CommunicationTemplate) => {
    setActiveTemplate(template.id);
    onTemplateSelect?.(template);
    onMessageChange?.(`${template.summary}\n\n${template.body}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={styles.contextPills}>
          {briefingContext.map((pill) => (
            <Text key={pill} style={styles.pill}>
              {pill}
            </Text>
          ))}
        </View>
      </View>

      {templates.length > 0 && (
        <View style={styles.templatesRow}>
          {templates.map((template) => {
            const isActive = template.id === activeTemplate;
            return (
              <TouchableOpacity
                key={template.id}
                style={[styles.templateCard, isActive && styles.templateCardActive]}
                onPress={() => handleTemplateSelect(template)}
              >
                <Text style={[styles.templateLabel, isActive && styles.templateLabelActive]}>{template.label}</Text>
                <Text style={styles.templateSummary}>{template.summary}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <View style={styles.messageCard}>
        <Text style={styles.sectionTitle}>Broadcast message</Text>
        <TextInput
          style={styles.messageInput}
          multiline
          placeholder="Draft a quick update for your crew, fleet, or coach..."
          value={message}
          onChangeText={onMessageChange}
        />
      </View>

      {audiences.length > 0 && (
        <View style={styles.audienceCard}>
          <Text style={styles.sectionTitle}>Recipients</Text>
          {audiences.map((audience) => (
            <View key={audience.id} style={styles.audienceRow}>
              <View style={styles.audienceMeta}>
                <View style={styles.audienceLabelRow}>
                  <Text style={styles.audienceLabel}>{audience.label}</Text>
                  {audience.badge ? <Text style={styles.audienceBadge}>{audience.badge}</Text> : null}
                </View>
                <Text style={styles.audienceDescription}>{audience.description}</Text>
                <Text style={styles.audienceChannel}>{audience.channel}</Text>
              </View>
              <Switch
                value={audienceState[audience.id]}
                onValueChange={() => handleToggleAudience(audience.id)}
                trackColor={{ false: '#D1D5DB', true: '#34D399' }}
                thumbColor="#FFFFFF"
              />
            </View>
          ))}
        </View>
      )}

      {attachments.length > 0 && (
        <View style={styles.attachmentsCard}>
          <Text style={styles.sectionTitle}>Add context</Text>
          {attachments.map((attachment) => (
            <View key={attachment.id} style={styles.attachmentRow}>
              <View>
                <Text style={styles.attachmentLabel}>{attachment.label}</Text>
                <Text style={styles.attachmentHelper}>{attachment.helper}</Text>
              </View>
              <TouchableOpacity style={styles.attachmentButton} onPress={attachment.onAttach}>
                <Text style={styles.attachmentButtonText}>{attachment.actionLabel ?? 'Attach'}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.sendButton} onPress={onSend}>
        <Text style={styles.sendButtonLabel}>Send briefing</Text>
        <Text style={styles.sendButtonHelper}>Shares via the active channels selected above</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 4,
  },
  contextPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end',
  },
  pill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontSize: 12,
    color: '#374151',
    backgroundColor: '#F3F4F6',
  },
  templatesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  templateCard: {
    flex: 1,
    minWidth: 200,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  templateCardActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  templateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  templateLabelActive: {
    color: '#1D4ED8',
  },
  templateSummary: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 6,
  },
  messageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  messageInput: {
    minHeight: 140,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5F5',
    padding: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#F8FAFC',
    textAlignVertical: 'top',
  },
  audienceCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    backgroundColor: '#FFFDF8',
    gap: 12,
  },
  audienceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  audienceMeta: {
    flex: 1,
  },
  audienceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  audienceLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  audienceBadge: {
    fontSize: 12,
    color: '#92400E',
    borderWidth: 1,
    borderColor: '#FBBF24',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  audienceDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  audienceChannel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  attachmentsCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  attachmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  attachmentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  attachmentHelper: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  attachmentButton: {
    borderRadius: 999,
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  attachmentButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sendButton: {
    borderRadius: 20,
    backgroundColor: '#111827',
    padding: 18,
    gap: 4,
  },
  sendButtonLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  sendButtonHelper: {
    fontSize: 13,
    color: '#CBD5F5',
  },
});

export default CollaborationBroadcastConsole;
