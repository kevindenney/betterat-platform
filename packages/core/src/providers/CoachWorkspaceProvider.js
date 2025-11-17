// @ts-nocheck
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
const CoachWorkspaceContext = createContext(undefined);
export function CoachWorkspaceProvider({ children }) {
    const { user } = useAuth();
    const [coachId, setCoachId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [lastSyncedAt, setLastSyncedAt] = useState(null);
    const refresh = useCallback(async () => {
        if (!user) {
            setCoachId(null);
            return;
        }
        setLoading(true);
        try {
            // Placeholder for future workspace bootstrapping logic.
            setCoachId(user.id);
            setLastSyncedAt(new Date());
        }
        finally {
            setLoading(false);
        }
    }, [user]);
    useEffect(() => {
        void refresh();
    }, [refresh]);
    return (<CoachWorkspaceContext.Provider value={{ coachId, loading, lastSyncedAt, refresh }}>
      {children}
    </CoachWorkspaceContext.Provider>);
}
export function useCoachWorkspace() {
    const ctx = useContext(CoachWorkspaceContext);
    if (!ctx) {
        throw new Error('useCoachWorkspace must be used within a CoachWorkspaceProvider');
    }
    return ctx;
}
