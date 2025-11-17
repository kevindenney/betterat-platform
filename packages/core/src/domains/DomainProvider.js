// @ts-nocheck
import React, { createContext, useContext, useState, useEffect } from 'react';
import { registerDomain as registerDomainInRegistry, getDomain } from './registry';
const DomainContext = createContext(undefined);
export const DomainProvider = ({ children, initialDomains = [], initialActiveDomains = [], userId, services = {}, }) => {
    const [currentDomainId, setCurrentDomainId] = useState(initialActiveDomains.length > 0 ? initialActiveDomains[0] : null);
    const [activeDomains, setActiveDomains] = useState(initialActiveDomains);
    // Register initial domains
    useEffect(() => {
        initialDomains.forEach(domain => {
            registerDomainInRegistry(domain);
        });
    }, [initialDomains]);
    const switchDomain = (domainId) => {
        const domain = getDomain(domainId);
        if (domain) {
            setCurrentDomainId(domainId);
            // Automatically activate the domain when switching to it
            if (!activeDomains.includes(domainId)) {
                setActiveDomains(prev => [...prev, domainId]);
            }
        }
    };
    const activateDomain = (domainId) => {
        if (!activeDomains.includes(domainId)) {
            setActiveDomains(prev => [...prev, domainId]);
        }
    };
    const deactivateDomain = (domainId) => {
        setActiveDomains(prev => prev.filter(id => id !== domainId));
        // If we're deactivating the current domain, clear it
        if (currentDomainId === domainId) {
            setCurrentDomainId(null);
        }
    };
    const currentDomain = currentDomainId ? getDomain(currentDomainId) : null;
    const value = {
        currentDomain: currentDomain || null,
        activeDomains,
        switchDomain,
        activateDomain,
        deactivateDomain,
        services,
        userId,
    };
    return (<DomainContext.Provider value={value}>
      {children}
    </DomainContext.Provider>);
};
export const useDomain = () => {
    const context = useContext(DomainContext);
    if (context === undefined) {
        throw new Error('useDomain must be used within a DomainProvider');
    }
    return context;
};
