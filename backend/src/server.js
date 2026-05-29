import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./app.js";
import chalk from "chalk";
import launchPage from "./config/launchPage.js"
import env from "./config/env.config.js";
import { startJobs } from "./jobs/index.js";

dotenv.config({
    path: "./.env"
});

app.get("/", (req, res) => {
    res.send(launchPage('MySaaS'));
});

app.get("/health", (req, res) => {
    res.status(200).json({ status: "Server is healthy!" });
});

connectDB()
    .then(() => {
        app.listen(env.PORT, () => {
            console.log(chalk.yellowBright(`Server is live!`));
            console.log(chalk.magentaBright(`🌐 Server is running on port:`));
            console.log(chalk.cyanBright(`http://localhost:${env.PORT}`));
            console.log(chalk.gray(`-----------------------------------------`));

            if (env.ENABLE_JOBS) {
                startJobs(); // Start background jobs only after server goes live
            }
        });
    })
    .catch((error) => {
        console.log("MongoDB Connection failed: ", error);
    });











//     **B2B FollowUp Management SaaS**

// Running a small business today means juggling conversations, leads, and commitments—often across calls and WhatsApp. Important follow-ups get missed, potential customers slip away, and revenue is lost simply because there’s no simple system to stay on top of it all. Our B2B FollowUp Management SaaS is built to solve exactly this problem.

// This platform is a lightweight, action-driven system designed for small businesses, freelancers, and service providers who manage clients daily. Instead of complex CRM tools, it focuses on what truly matters: helping you remember, track, and act on every important customer interaction.

// At its core, the system revolves around a few powerful modules:

// **Authentication & User Setup:**
// Secure signup and login allow each user to manage their own workspace effortlessly without complicated setup.

// **Customer Management:**
// Store and organize all your clients in one place with essential details like name, phone number, and tags such as lead or client.

// **Notes & Timeline:**
// Maintain a simple interaction history for every customer—what was discussed, what they need, and their current status.

// **Follow-up Reminder System (Core Module):**
// Set reminders for calls, messages, or meetings. The system ensures you never forget a follow-up, with a clear view of today’s and overdue tasks.

// **Dashboard:**
// A clean, focused interface that highlights what needs your attention right now—today’s follow-ups, missed actions, and quick add options.

// **WhatsApp Quick Action Integration:**
// Send pre-written follow-up messages instantly. With one click, open WhatsApp with a ready-to-send message, saving time and effort.

// **Calendar & Meeting Support (Pro Feature):**
// Schedule meetings and optionally sync with Google Calendar to manage appointments and generate meeting links when needed.

// The goal of this SaaS is simple: eliminate missed opportunities by turning every customer interaction into a structured, actionable workflow. It acts as a smart assistant that ensures you follow up on time, respond faster, and ultimately convert more leads into paying customers—without the complexity of traditional CRM systems.
