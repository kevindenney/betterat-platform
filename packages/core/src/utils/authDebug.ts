export function debugAuth(message: string, data?: any) {
  console.log('[AUTH DEBUG]', message, data);
}

export function logAuthFlow(step: string) {
  console.log('[AUTH FLOW]', step);
}

export function logSession(...payload: unknown[]) {
  console.log('[AUTH SESSION]', ...payload);
}

export async function dumpSbStorage() {
  console.log('[AUTH DEBUG] dumpSbStorage invoked - stub implementation');
}
