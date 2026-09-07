import mongoose from "mongoose";
import env from "./env.config.js";
import dns from "dns";
import logger from "./logger.js";

// if (env.NODE_ENV === "development") {
//     dns.setServers(["1.1.1.1", "8.8.8.8"]);
// }


const connectDB = async () => {
    try {
        const connection = await mongoose.connect(`${env.MONGO_URI}/${env.DB_NAME}`);
        logger.info(`MongoDB Connected`);
    } catch (error) {
        logger.fatal(
            {
                err: error,
            },
            "MongoDB Connection failed"
        );
        throw error;
    }
};

export default connectDB;
