export type DomainType = 'sailracing' | 'nursing' | 'drawing';
export interface OrgAssignmentSuggestion {
    id: string;
    domain: DomainType;
    orgName: string;
    title: string;
    dateLabel: string;
    metadata: string;
    templateText?: string;
    fields?: Record<string, string>;
}
export declare function fetchOrgAssignmentSuggestions(domain: DomainType, _userId?: string): Promise<OrgAssignmentSuggestion[]>;
//# sourceMappingURL=orgAssignments.d.ts.map