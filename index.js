import express from 'express';
import dotenv from 'dotenv';
import { App } from 'octokit';
import { createNodeMiddleware } from '@octokit/webhooks';
import jiraRoutes from './router/jira.js';

// Initialize Express app
const app = express();

// Load environment variables from .env file
dotenv.config();

// Assign environment variables to local variables
const appId = process.env.APP_ID;
const webhookSecret = process.env.WEBHOOK_SECRET;
const privateKey = process.env.PRIVATE_KEY;

// Create an instance of the Octokit App class
const octokitApp = new App({
  appId: appId,
  privateKey: privateKey,
  webhooks: {
    secret: webhookSecret,
  },
});

// Define message for new PRs
const messageForNewPRs =
  'Thanks for opening a new PR! Please follow our contributing guidelines to make your PR easier to review.';

// Event handler for pull_request.opened event
async function handlePullRequestOpened({ octokit, payload }) {
  console.log(`Received a pull request event for #${payload.pull_request.number}`);

  try {
    await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', {
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      issue_number: payload.pull_request.number,
      body: messageForNewPRs,
      headers: {
        'x-github-api-version': '2022-11-28',
      },
    });
  } catch (error) {
    if (error.response) {
      console.error(
        `Error! Status: ${error.response.status}. Message: ${error.response.data.message}`
      );
    }
    console.error(error);
  }
}

// Add event handler for pull_request.opened event
octokitApp.webhooks.on('pull_request.opened', handlePullRequestOpened);

// Log errors
octokitApp.webhooks.onError((error) => {
  if (error.name === 'AggregateError') {
    console.error(`Error processing request: ${error.event}`);
  } else {
    console.error(error);
  }
});

// Set up middleware for handling incoming webhook events
const middleware = createNodeMiddleware(octokitApp.webhooks, { path: '/api/webhook' });

// Use middleware to handle webhook events
app.use('/api/webhook', middleware);

// Routes
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Use the router defined in the routes.js file
app.use('/jira', jiraRoutes);

// Define port
const port = process.env.PORT || 3000;

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
