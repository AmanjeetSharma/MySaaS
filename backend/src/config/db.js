import mongoose from "mongoose";
import chalk from "chalk";
import env from "./env.config.js";
import dns from "dns";
import logger from "./logger.js";

// if (env.NODE_ENV === "development") {
//     dns.setServers(["1.1.1.1", "8.8.8.8"]);
// }


const connectDB = async () => {
    try {
        const connection = await mongoose.connect(`${env.MONGO_URI}/${env.DB_NAME}`);
        console.log(`${chalk.yellowBright("--> MongoDB Connected")} | HOST: ${chalk.gray(connection.connection.host)}`);
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
