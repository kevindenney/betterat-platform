import React from 'react';
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
    onSubmit: (payload: {
        text: string;
        url?: string;
    }) => void;
    isProcessing?: boolean;
    highlights?: {
        label: string;
        value: string;
    }[];
    highlightTitle?: string;
    disabled?: boolean;
}
export declare const AIAssistedEntryPanel: React.FC<AIAssistedEntryPanelProps>;
export default AIAssistedEntryPanel;
//# sourceMappingURL=AIAssistedEntryPanel.d.ts.map