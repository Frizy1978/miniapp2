export type AppEnvironment = {
  app: {
    corsOrigin: string;
    port: number;
  };
  database: {
    url: string;
  };
  telegram: {
    adminTelegramIds: string[];
    authMaxAgeSeconds: number;
    botEnablePolling: boolean;
    botToken: string;
    botUsername: string;
    devMode: boolean;
    devUser: {
      firstName: string;
      lastName: string;
      telegramUserId: string;
      username: string;
    };
    miniAppUrl: string;
    sessionTtlSeconds: number;
  };
  woocommerce: {
    baseUrl: string;
    consumerKey: string;
    consumerSecret: string;
  };
};

function asBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }

  return value === "true";
}

export default (): AppEnvironment => ({
  app: {
    corsOrigin: process.env.API_CORS_ORIGIN ?? "http://localhost:3000",
    port: Number.parseInt(process.env.API_PORT ?? "4000", 10)
  },
  database: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@localhost:5432/fisholha_miniapp?schema=public"
  },
  telegram: {
    adminTelegramIds: (process.env.ADMIN_TELEGRAM_IDS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    authMaxAgeSeconds: Number.parseInt(process.env.TELEGRAM_INIT_DATA_MAX_AGE_SECONDS ?? "86400", 10),
    botEnablePolling: asBoolean(process.env.TELEGRAM_BOT_ENABLE_POLLING, false),
    botToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
    botUsername: process.env.TELEGRAM_BOT_USERNAME ?? "",
    devMode: asBoolean(process.env.TELEGRAM_DEV_MODE, true),
    devUser: {
      firstName: process.env.TELEGRAM_DEV_FIRST_NAME ?? "Dev",
      lastName: process.env.TELEGRAM_DEV_LAST_NAME ?? "Buyer",
      telegramUserId: process.env.TELEGRAM_DEV_USER_ID ?? "100000000",
      username: process.env.TELEGRAM_DEV_USERNAME ?? "dev_buyer"
    },
    miniAppUrl: process.env.TELEGRAM_MINI_APP_URL ?? "http://localhost:3000",
    sessionTtlSeconds: Number.parseInt(process.env.TELEGRAM_SESSION_TTL_SECONDS ?? "2592000", 10)
  },
  woocommerce: {
    baseUrl: process.env.WOOCOMMERCE_BASE_URL ?? "https://fisholha.ru",
    consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY ?? "",
    consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET ?? ""
  }
});
