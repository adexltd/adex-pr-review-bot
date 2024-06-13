import dotenv from 'dotenv';

dotenv.config()

// Environment Variables
export const appId = process.env.APP_ID;
export const webhookSecret = process.env.WEBHOOK_SECRET;
export const privateKey = process.env.PRIVATE_KEY;
export const botUsername = process.env.BOT_USERNAME;