import mongoose from "mongoose";
import chalk from "chalk";
import env from "./env.js";
import dns from "dns";

if (env.NODE_ENV === "development") {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
    console.log();
}


const connectDB = async () => {
    try {
        const conn = await mongoose.connect(`${env.MONGO_URI}/${env.DB_NAME}`);
        console.log(`${chalk.yellowBright("--> MongoDB Connected")} | HOST: ${chalk.gray(conn.connection.host)}`);
    } catch (error) {
        console.error(chalk.bgRedBright("--> MongoDB Connection Error: "), error.message);
        process.exit(1);
    }
};

export default connectDB;
