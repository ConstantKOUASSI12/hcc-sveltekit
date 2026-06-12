import type { auth } from '$lib/server/auth';

type Session = typeof auth.$Infer.Session.session;
type User    = typeof auth.$Infer.Session.user;

declare global {
  namespace App {
    interface Locals {
      session: { session: Session; user: User } | null;
      user:    User | null;
    }
  }
}

export {};