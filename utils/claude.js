import AnthropicBedrock from '@anthropic-ai/bedrock-sdk';
import { awsAccessKey, awsSecretKey, awsSessionToken } from '../config/config.js';

const prompt = `
You are a highly skilled software developer with expertise in reviewing code quality and best practices. Your task is to carefully analyze the provided code and provide a detailed evaluation.

If the code is well-written, maintainable, and follows industry standards, please commend it and highlight its strengths. Mention aspects such as readability, modularity, efficiency, error handling, and adherence to coding conventions.

However, if you identify any issues or areas for improvement in the code, please provide constructive feedback. Point out any potential bugs, performance bottlenecks, security vulnerabilities, or violations of coding standards. Suggest ways to refactor or optimize the code to enhance its quality, maintainability, and performance.

Your analysis should be thorough, objective, and actionable. Use clear language and bullet points to support your observations and recommendations. Remember to strike a balance between identifying areas for improvement and acknowledging the positive aspects of the code.
Keep in Mind: The bullet points should be less then 5.
`;

const client = new AnthropicBedrock({
  // Authenticate by either providing the keys below or use the default AWS credential providers, such as
  // using ~/.aws/credentials or the "AWS_SECRET_ACCESS_KEY" and "AWS_ACCESS_KEY_ID" environment variables.
  awsAccessKey: awsAccessKey,
  awsSecretKey: awsSecretKey,

  // Temporary credentials can be used with awsSessionToken.
  // Read more at https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_temp.html.
  awsSessionToken: awsSessionToken,

  // awsRegion changes the aws region to which the request is made. By default, we read AWS_REGION,
  // and if that's not present, we default to us-east-1. Note that we do not read ~/.aws/config for the region.
  awsRegion: 'us-east-1',
});

export async function analyzeFileWithClaude(fileContent) {
  const message = await client.messages.create({
    model: 'anthropic.claude-3-sonnet-20240229-v1:0',
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: `${prompt}
        \n\n this is the code ${fileContent}
        Please begin your analysis:`,
      },
    ],
  });
  return message.content[0].text;
}
