/**
 * Auth skeleton for future PIN/credentials.
 * Local v1: AUTH_DISABLED=true skips session checks.
 */

export function isAuthDisabled(): boolean {
  return (
    process.env.AUTH_DISABLED === "true" ||
    process.env.AUTH_DISABLED === "1" ||
    !process.env.AUTH_SECRET
  );
}

export interface SessionUser {
  id: string;
  name: string;
}

/** Placeholder for future credentials login. */
export async function getSession(): Promise<SessionUser | null> {
  if (isAuthDisabled()) {
    return { id: "local", name: "Local" };
  }
  // Future: read cookie / verify JWT
  return null;
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
