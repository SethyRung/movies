export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export function useUser() {
  return useState<AuthUser | null>("user", () => null);
}
