// src/lib/server/auth.ts
import { betterAuth } from 'better-auth';
import { BETTER_AUTH_SECRET, BETTER_AUTH_URL } from '$env/static/private';
import { PUBLIC_API_URL } from '$env/static/public';
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "$lib/server/prisma";

export const auth = betterAuth({
  baseURL: BETTER_AUTH_URL,
  secret: BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
  },

  user: {
    additionalFields: {
      role:                  { type: 'string',  nullable: true, defaultValue: null },
      first_name:            { type: 'string',  nullable: true, defaultValue: null },
      last_name:             { type: 'string',  nullable: true, defaultValue: null },
      contact:               { type: 'string',  nullable: true, defaultValue: null },
      flask_adherent_id:     { type: 'number',  nullable: true, defaultValue: null },
      flask_access_token:    { type: 'string',  nullable: true, defaultValue: null },
      flask_refresh_token:   { type: 'string',  nullable: true, defaultValue: null },
      flask_access_expires:  { type: 'string',  nullable: true, defaultValue: null },
      flask_refresh_expires: { type: 'string',  nullable: true, defaultValue: null },
      is_validated:          { type: 'boolean', nullable: true, defaultValue: null },
    },
  },


  
  session: {
    expiresIn: 60 * 60 * 2,    // 2h — identique à JWT_REFRESH_TOKEN_EXPIRES Flask
    updateAge: 60 * 30,         // renouvelle la session Better Auth toutes les 30min
    cookieCache: {
      enabled: true,
      maxAge:  60 * 60 * 2,    // 2h — identique
    },
  },

  trustedOrigins: [
    BETTER_AUTH_URL,
    PUBLIC_API_URL,
  ],
});