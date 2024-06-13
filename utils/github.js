import { CHECKOV_DIRECTORY } from '../constants/constants.js';
import { postCommentsOnPR, cloneRepo} from './helpers.js';
import { parseCheckovReport, runCheckov } from './scanner/checkov.js';

/** 
When this event handler is called, it will log the event to the console.
Then, it will use GitHub's REST API to add a comment to the pull request that triggered the event.
@param octokit
@param payload
*/
export async function handlePullRequestOpened({ octokit, payload }) {
  console.log(`Received a pull request event for #${payload.pull_request.number}`);
  const prNumber = payload.pull_request.number;
  const repoOwner = payload.repository.owner.login;
  const repoName = payload.repository.name;
  const branch = payload.pull_request.head.ref;
  try {
    // Clone the repository
    await cloneRepo(repoOwner, repoName, branch);
    const { stdout, stderr } = runCheckov(CHECKOV_DIRECTORY);
    const issues = parseCheckovReport(stdout);

    // Post comments on the PR
    await postCommentsOnPR(octokit, repoOwner, repoName, prNumber, issues, stderr);
  } catch (error) {
    if (error.response) {
      console.error(
        `Error! Status: ${error.response.status}. Message: ${error.response.data.message}`
      );
    }
    console.error(error);
  }
}
