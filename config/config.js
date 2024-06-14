import dotenv from 'dotenv';

dotenv.config();

// Environment Variables
export const appId = process.env.APP_ID;
export const webhookSecret = process.env.WEBHOOK_SECRET;
export const privateKey = process.env.PRIVATE_KEY;
export const botUsername = process.env.BOT_USERNAME;
export const openAiApiKey = process.env.OPENAI_API_KEY;
export const claudeApiKey = process.env.CLAUDE_API_KEY;
// AWS
export const awsAccessKey = process.env.AWS_ACCESS_KEY;
export const awsSecretKey = process.env.AWS_SECRET_KEY;
export const awsSessionToken = process.env.AWS_SESSION_TOKEN;
