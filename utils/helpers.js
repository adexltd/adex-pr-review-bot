import axios from 'axios';
import { messageForNewPRs } from '../constants/constants.js';

const jiraBaseUrl = process.env.JIRA_BASE_URL;
const jiraUsername = process.env.JIRA_USERNAME;
const jiraApiToken = process.env.JIRA_API_TOKEN;

/**
Helper function to get an authenticated Octokit instance
@param installationId 
*/
export async function getOctokit(installationId) {
  const auth = createAppAuth({
    appId: GITHUB_APP_ID,
    privateKey: GITHUB_PRIVATE_KEY,
    installationId,
  });

  const { token } = await auth({ type: 'installation' });
  return new Octokit({ auth: token });
}

/** 
When this event handler is called, it will log the event to the console.
Then, it will use GitHub's REST API to add a comment to the pull request that triggered the event.
@param octokit
@param payload
*/
export async function handlePullRequestOpened({ octokit, payload }) {
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
