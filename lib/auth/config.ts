import { env } from "@/lib/config/env";

export type AuthRole = "ADMIN" | "EDITOR";

export type CredentialsInput = {
  email: string;
  password: string;
};

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string | null;
  role: AuthRole;
};

export type CredentialsProviderConfig = {
  id: "credentials";
  name: "Credentials";
  credentials: {
    email: { label: "Email"; type: "email" };
    password: { label: "Password"; type: "password" };
  };
  authorize: (credentials: CredentialsInput) => Promise<AuthenticatedUser | null>;
};

export type AuthConfigScaffold = {
  secret: string;
  session: {
    strategy: "jwt";
  };
  providers: [CredentialsProviderConfig];
  pages: {
    signIn: string;
  };
};

async function authorizeCredentials(
  _credentials: CredentialsInput,
): Promise<AuthenticatedUser | null> {
  // T007+ will add DB-backed lookup and password verification.
  void _credentials;
  return null;
}

export const authConfig: AuthConfigScaffold = {
  secret: env.server.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    {
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: authorizeCredentials,
    },
  ],
  pages: {
    signIn: "/admin/login",
  },
};
