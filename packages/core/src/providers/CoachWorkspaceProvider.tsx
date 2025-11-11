import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';

interface CoachWorkspaceContextValue {
  coachId: string | null;
  loading: boolean;
  lastSyncedAt: Date | null;
  refresh(): Promise<void>;
}

const CoachWorkspaceContext = createContext<CoachWorkspaceContextValue | undefined>(undefined);

interface CoachWorkspaceProviderProps {
  children: React.ReactNode;
}

export function CoachWorkspaceProvider({ children }: CoachWorkspaceProviderProps) {
  const { user } = useAuth();
  const [coachId, setCoachId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

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
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <CoachWorkspaceContext.Provider value={{ coachId, loading, lastSyncedAt, refresh }}>
      {children}
    </CoachWorkspaceContext.Provider>
  );
}

export function useCoachWorkspace(): CoachWorkspaceContextValue {
  const ctx = useContext(CoachWorkspaceContext);
  if (!ctx) {
    throw new Error('useCoachWorkspace must be used within a CoachWorkspaceProvider');
  }
  return ctx;
}
