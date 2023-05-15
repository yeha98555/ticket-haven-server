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
  }
}
