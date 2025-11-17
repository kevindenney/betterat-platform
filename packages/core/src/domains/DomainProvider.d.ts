import React, { ReactNode } from 'react';
import { DomainModule } from './types';
interface DomainContextType {
    currentDomain: DomainModule | null;
    activeDomains: string[];
    switchDomain: (domainId: string) => void;
    activateDomain: (domainId: string) => void;
    deactivateDomain: (domainId: string) => void;
    services: any;
    userId: string;
}
interface DomainProviderProps {
    children: ReactNode;
    initialDomains?: DomainModule[];
    initialActiveDomains?: string[];
    userId: string;
    services?: any;
}
export declare const DomainProvider: React.FC<DomainProviderProps>;
export declare const useDomain: () => DomainContextType;
export {};
//# sourceMappingURL=DomainProvider.d.ts.map