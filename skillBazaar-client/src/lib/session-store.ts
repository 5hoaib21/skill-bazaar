// Shared session store — populated by layout, read by API client
let currentSession: { user?: any; session?: any } | null = null;

export function setSession(data: { user?: any; session?: any } | null) {
  currentSession = data;
}

export function getSession() {
  return currentSession;
}
