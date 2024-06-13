import dotenv from 'dotenv';
import { App } from 'octokit';
import { createNodeMiddleware } from '@octokit/webhooks';
import express from 'express';
import { handlePullRequestOpened } from './utils/handlers.js';

dotenv.config();

const app = express();
const appId = process.env.APP_ID;
const webhookSecret = process.env.WEBHOOK_SECRET;
const privateKey = process.env.PRIVATE_KEY;
const port = 9000;
const host = 'localhost';
const path = '/webhook';
const localWebhookUrl = `http://${host}:${port}${path}`;

// This creates a new instance of the Octokit App class.
const octo_app = new App({
  appId: appId,
  privateKey: privateKey,
  webhooks: {
    secret: webhookSecret,
  },
});

// This sets up a webhook event listener. When your app receives a webhook event from GitHub with a `X-GitHub-Event` header value of `pull_request` and an `action` payload value of `opened`, it calls the `handlePullRequestOpened` event handler that is defined above.
octo_app.webhooks.on('pull_request.opened', handlePullRequestOpened);
// octo_app.webhooks.on('pull_request.reopened', handlePullRequestOpened);

// This logs any errors that occur.
octo_app.webhooks.onError((error) => {
  if (error.name === 'AggregateError') {
    console.error(`Error processing request: ${error.event}`);
  } else {
    console.error(error);
  }
});

app.use(createNodeMiddleware(octo_app.webhooks, { path }));
// app.get('/', (req, res) => {
//   res.json('hello');
// });
// This creates a Node.js server that listens for incoming HTTP requests (including webhook payloads from GitHub) on the specified port. When the server receives a request, it executes the `middleware` function that you defined earlier. Once the server is running, it logs messages to the console to indicate that it is listening.
app.listen(port, () => {
  console.log(`Server is listening for events at: ${localWebhookUrl}`);
  console.log('Press Ctrl + C to quit.');
});
