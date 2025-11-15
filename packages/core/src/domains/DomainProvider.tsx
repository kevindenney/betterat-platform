// @ts-nocheck
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { DomainModule } from './types';
import { registerDomain as registerDomainInRegistry, getDomain } from './registry';

interface DomainContextType {
  currentDomain: DomainModule | null;
  activeDomains: string[];
  switchDomain: (domainId: string) => void;
  activateDomain: (domainId: string) => void;
  deactivateDomain: (domainId: string) => void;
  services: any; // Platform services
  userId: string;
}

const DomainContext = createContext<DomainContextType | undefined>(undefined);

interface DomainProviderProps {
  children: ReactNode;
  initialDomains?: DomainModule[];
  initialActiveDomains?: string[];
  userId: string;
  services?: any;
}

export const DomainProvider: React.FC<DomainProviderProps> = ({
  children,
  initialDomains = [],
  initialActiveDomains = [],
  userId,
  services = {},
}) => {
  const [currentDomainId, setCurrentDomainId] = useState<string | null>(
    initialActiveDomains.length > 0 ? initialActiveDomains[0] : null
  );
  const [activeDomains, setActiveDomains] = useState<string[]>(initialActiveDomains);

  // Register initial domains
  useEffect(() => {
    initialDomains.forEach(domain => {
      registerDomainInRegistry(domain);
    });
  }, [initialDomains]);

  const switchDomain = (domainId: string) => {
    const domain = getDomain(domainId);
    if (domain) {
      setCurrentDomainId(domainId);
      // Automatically activate the domain when switching to it
      if (!activeDomains.includes(domainId)) {
        setActiveDomains(prev => [...prev, domainId]);
      }
    }
  };

  const activateDomain = (domainId: string) => {
    if (!activeDomains.includes(domainId)) {
      setActiveDomains(prev => [...prev, domainId]);
    }
  };

  const deactivateDomain = (domainId: string) => {
    setActiveDomains(prev => prev.filter(id => id !== domainId));

    // If we're deactivating the current domain, clear it
    if (currentDomainId === domainId) {
      setCurrentDomainId(null);
    }
  };

  const currentDomain = currentDomainId ? getDomain(currentDomainId) : null;

  const value: DomainContextType = {
    currentDomain: currentDomain || null,
    activeDomains,
    switchDomain,
    activateDomain,
    deactivateDomain,
    services,
    userId,
  };

  return (
    <DomainContext.Provider value={value}>
      {children}
    </DomainContext.Provider>
  );
};

export const useDomain = (): DomainContextType => {
  const context = useContext(DomainContext);
  if (context === undefined) {
    throw new Error('useDomain must be used within a DomainProvider');
  }
  return context;
};
