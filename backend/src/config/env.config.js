const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGO_URI: process.env.MONGO_URI,
    DB_NAME: process.env.DB_NAME,
    PORT: process.env.PORT || 3000,

    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,

    EMAIL_ENABLED: process.env.EMAIL_ENABLED === 'true', // Converting to boolean
    ENABLE_JOBS: process.env.ENABLE_JOBS === 'true',

    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || '15m',
    REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || '7d',

};

export default env;