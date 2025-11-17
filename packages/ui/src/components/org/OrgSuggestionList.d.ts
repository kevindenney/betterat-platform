import React from 'react';
import type { OrgAssignmentSuggestion } from '@betterat/core/services/orgAssignments';
interface OrgSuggestionListProps {
    title?: string;
    suggestions: OrgAssignmentSuggestion[];
    onApply: (suggestion: OrgAssignmentSuggestion) => void;
}
export declare const OrgSuggestionList: React.FC<OrgSuggestionListProps>;
export {};
//# sourceMappingURL=OrgSuggestionList.d.ts.map