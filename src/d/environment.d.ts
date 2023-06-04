declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production';
    PORT?: string;
    MONGODB_USER: string;
    MONGODB_PASSWORD: string;
    MONGODB_DATABASE: string;
    MONGODB_CONNECT_STRING: string;
    JWT_SECRET: string;
    TICKET_SECRET: string;
    LOG_FILE_DIR?: string;
    NEWEBPAY_VERSION: string;
    NEWEBPAY_MERCHANT_ID: string;
    NEWEBPAY_HASH_KEY: string;
    NEWEBPAY_HASH_IV: string;
    NEWEBPAY_RETURN_URL: string;
    NEWEBPAY_NOTIFY_URL: string;
    PAYMENT_RETURN_URL: string;
  }
}
