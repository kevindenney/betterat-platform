// @ts-nocheck
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export interface AIAssistedEntryPanelProps {
  title?: string;
  description?: string;
  helperText?: string;
  placeholder?: string;
  urlPlaceholder?: string;
  ctaLabel?: string;
  textValue: string;
  urlValue?: string;
  onChangeText: (value: string) => void;
  onChangeUrl?: (value: string) => void;
  onSubmit: (payload: { text: string; url?: string }) => void;
  isProcessing?: boolean;
  highlights?: { label: string; value: string }[];
  highlightTitle?: string;
  disabled?: boolean;
}

export const AIAssistedEntryPanel: React.FC<AIAssistedEntryPanelProps> = ({
  title = 'AI Entry',
  description = 'Drop a URL or paste unstructured text. The AI assistant will extract structured fields automatically.',
  helperText = 'Paste a NOR, sailing instructions, staffing email, or any other doc snippet. Add a link for richer context.',
  placeholder = 'Paste unstructured text, instructions, or bullets here…',
  urlPlaceholder = 'https://example.com/notice-of-race.pdf',
  ctaLabel = 'Extract Details',
  textValue,
  urlValue,
  onChangeText,
  onChangeUrl,
  onSubmit,
  isProcessing = false,
  highlights = [],
  highlightTitle = 'Important fields',
  disabled = false,
}) => {
  const canSubmit = !disabled && (!!textValue?.trim() || !!urlValue?.trim());

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      text: textValue,
      url: urlValue,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.chip}>
          <Text style={styles.chipLabel}>AI</Text>
        </View>
      </View>
      <Text style={styles.description}>{description}</Text>

      {onChangeUrl ? (
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Reference URL</Text>
          <TextInput
            style={styles.urlInput}
            placeholder={urlPlaceholder}
            placeholderTextColor="#94A3B8"
            value={urlValue}
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={onChangeUrl}
          />
        </View>
      ) : null}

      <View style={styles.fieldBlock}>
        <Text style={styles.fieldLabel}>Raw Text or Notes</Text>
        <TextInput
          style={styles.textArea}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          value={textValue}
          onChangeText={onChangeText}
        />
      </View>

      <Text style={styles.helperText}>{helperText}</Text>

      <TouchableOpacity
        style={[styles.submitButton, (!canSubmit || isProcessing) && styles.submitDisabled]}
        activeOpacity={0.9}
        disabled={!canSubmit || isProcessing}
        onPress={handleSubmit}
      >
        {isProcessing ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitLabel}>{ctaLabel}</Text>
        )}
      </TouchableOpacity>

      {highlights.length > 0 ? (
        <View style={styles.highlightCard}>
          <Text style={styles.highlightTitle}>{highlightTitle}</Text>
          {highlights.map((field) => (
            <View key={`${field.label}-${field.value}`} style={styles.highlightRow}>
              <Text style={styles.highlightLabel}>{field.label}</Text>
              <Text style={styles.highlightValue}>{field.value}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  chip: {
    backgroundColor: '#DBEAFE',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  chipLabel: {
    color: '#1D4ED8',
    fontWeight: '700',
    fontSize: 12,
  },
  description: {
    color: '#475569',
    lineHeight: 20,
    marginBottom: 12,
  },
  fieldBlock: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  urlInput: {
    borderWidth: 1,
    borderColor: '#CBD5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#CBD5F5',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    fontSize: 15,
    minHeight: 140,
  },
  helperText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 18,
  },
  submitButton: {
    backgroundColor: '#111827',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitDisabled: {
    opacity: 0.5,
  },
  submitLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  highlightCard: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  highlightTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 10,
  },
  highlightRow: {
    marginBottom: 8,
  },
  highlightLabel: {
    fontSize: 12,
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  highlightValue: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
  },
});

export default AIAssistedEntryPanel;
