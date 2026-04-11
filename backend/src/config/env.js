// Load environment variables from .env file for better security and configuration management
const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGO_URI: process.env.MONGO_URI,
    DB_NAME: process.env.DB_NAME,
    PORT: process.env.PORT || 3000,



};

export default env;