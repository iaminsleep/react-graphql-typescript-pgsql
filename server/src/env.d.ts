declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: string;
      APP_PORT: string;
      DATABASE_NAME: string;
      DATABASE_USER: string;
      DATABASE_PASSWORD: string;
      DATABASE_PORT: string;
      SESSION_SECRET: string;
      CORS_ORIGIN: string;
    }
  }
}

export {}
