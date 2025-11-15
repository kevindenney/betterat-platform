// @ts-nocheck
import { DomainModule } from './types';

const domainRegistry = new Map<string, DomainModule>();

export function registerDomain(domain: DomainModule): void {
  if (domainRegistry.has(domain.meta.id)) {
    console.warn(`Domain ${domain.meta.id} is already registered`);
    return;
  }
  domainRegistry.set(domain.meta.id, domain);
}

export function getDomain(domainId: string): DomainModule | undefined {
  return domainRegistry.get(domainId);
}

export function getAllDomains(): DomainModule[] {
  return Array.from(domainRegistry.values());
}
