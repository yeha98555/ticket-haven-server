declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: 'development' | 'production';
            PORT?: string;
            MONGODB_USER: string;
            MONGODB_PASSWORD: string;
            MONGODB_DATABASE: string;
            MONGODB_CONNECT_STRING: string;
        }
    }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}