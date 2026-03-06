type RequiredServerKey =
  | "DATABASE_URL"
  | "AUTH_SECRET"
  | "PREVIEW_TOKEN"
  | "CLOUDINARY_CLOUD_NAME"
  | "CLOUDINARY_API_KEY"
  | "CLOUDINARY_API_SECRET";

type ServerEnv = {
  DATABASE_URL: string;
  AUTH_SECRET: string;
  PREVIEW_TOKEN: string;
  IMAGE_PROVIDER?: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  NODE_ENV: "development" | "test" | "production";
};

type ClientEnv = {
  NEXT_PUBLIC_APP_URL?: string;
};

type AppEnv = {
  server: ServerEnv;
  client: ClientEnv;
};

let cachedEnv: AppEnv | null = null;

function requireEnv(key: RequiredServerKey): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function parseNodeEnv(value: string | undefined): ServerEnv["NODE_ENV"] {
  if (value === "production" || value === "test") {
    return value;
  }
  return "development";
}

export function getEnvConfig(): AppEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  cachedEnv = {
    server: {
      DATABASE_URL: requireEnv("DATABASE_URL"),
      AUTH_SECRET: requireEnv("AUTH_SECRET"),
      PREVIEW_TOKEN: requireEnv("PREVIEW_TOKEN"),
      IMAGE_PROVIDER: process.env.IMAGE_PROVIDER || undefined,
      CLOUDINARY_CLOUD_NAME: requireEnv("CLOUDINARY_CLOUD_NAME"),
      CLOUDINARY_API_KEY: requireEnv("CLOUDINARY_API_KEY"),
      CLOUDINARY_API_SECRET: requireEnv("CLOUDINARY_API_SECRET"),
      NODE_ENV: parseNodeEnv(process.env.NODE_ENV),
    },
    client: {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    },
  };

  return cachedEnv;
}

export const env = getEnvConfig();
