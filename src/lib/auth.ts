// Auth is now handled server-side via JWT sessions (src/lib/session.ts)
// and API routes at /api/auth/*.
// This file is kept for backward compatibility types only.

export interface User {
  id: string;
  email: string;
  name: string;
}
