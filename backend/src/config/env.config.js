const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    VERIFICATION_REQUIRED: process.env.VERIFICATION_REQUIRED === 'true', // Converting to boolean
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

    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,

    GOOGLE_OAUTH_STATE_SECRET: process.env.GOOGLE_OAUTH_STATE_SECRET,
    GOOGLE_OAUTH_STATE_EXPIRY: process.env.GOOGLE_OAUTH_STATE_EXPIRY || '10m',
    GOOGLE_REFRESH_TOKEN_ENCRYPTION_KEY: process.env.GOOGLE_REFRESH_TOKEN_ENCRYPTION_KEY,

    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
};

export default env;
