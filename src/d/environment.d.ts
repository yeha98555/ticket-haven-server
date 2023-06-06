declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production';
    PORT?: string;
    MONGODB_USER: string;
    MONGODB_PASSWORD: string;
    MONGODB_DATABASE: string;
    MONGODB_CONNECT_STRING: string;
    JWT_SECRET: string;
    LOG_FILE_DIR?: string;
    GOOGLE_AUTH_CLIENTID: string;
    GOOGLE_AUTH_CLIENT_SECRET: string;
    GOOGLE_REDIRECT_URL: string;
    GOOGLE_AUTH_REFRESH_TOKEN: string;
    USER_MAIL: string;
    NEWEBPAY_VERSION: string;
    NEWEBPAY_MERCHANT_ID: string;
    NEWEBPAY_HASH_KEY: string;
    NEWEBPAY_HASH_IV: string;
    NEWEBPAY_RETURN_URL: string;
    NEWEBPAY_NOTIFY_URL: string;
    PAYMENT_RETURN_URL: string;
  }
}
