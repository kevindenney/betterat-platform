// @ts-nocheck
export function debugAuth(message, data) {
    console.log('[AUTH DEBUG]', message, data);
}
export function logAuthFlow(step) {
    console.log('[AUTH FLOW]', step);
}
export function logSession(...payload) {
    console.log('[AUTH SESSION]', ...payload);
}
export async function dumpSbStorage() {
    console.log('[AUTH DEBUG] dumpSbStorage invoked - stub implementation');
}
