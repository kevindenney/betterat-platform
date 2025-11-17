const domainRegistry = new Map();
export function registerDomain(domain) {
    if (domainRegistry.has(domain.meta.id)) {
        console.warn(`Domain ${domain.meta.id} is already registered`);
        return;
    }
    domainRegistry.set(domain.meta.id, domain);
}
export function getDomain(domainId) {
    return domainRegistry.get(domainId);
}
export function getAllDomains() {
    return Array.from(domainRegistry.values());
}
