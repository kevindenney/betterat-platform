import React from 'react';
interface CoachWorkspaceContextValue {
    coachId: string | null;
    loading: boolean;
    lastSyncedAt: Date | null;
    refresh(): Promise<void>;
}
interface CoachWorkspaceProviderProps {
    children: React.ReactNode;
}
export declare function CoachWorkspaceProvider({ children }: CoachWorkspaceProviderProps): React.JSX.Element;
export declare function useCoachWorkspace(): CoachWorkspaceContextValue;
export {};
//# sourceMappingURL=CoachWorkspaceProvider.d.ts.map