import { postCommentsOnPR } from './helpers.js';
import { runCheckov } from './scanner/checkov.js';

/** 
When this event handler is called, it will log the event to the console.
Then, it will use GitHub's REST API to add a comment to the pull request that triggered the event.
@param octokit
@param payload
*/
export async function handlePullRequestOpened({ octokit, payload }) {
  console.log(`Received a pull request event for #${payload.pull_request.number}`);

  try {
    // Clone the repository
    await cloneRepo(repoOwner, repoName, branch);
    const { stdout, stderr } = await runCheckov(CHECKOV_DIRECTORY);
    const issues = parseCheckovReport(stdout);

    // Post comments on the PR
    await postCommentsOnPR(octokit, repoOwner, repoName, prNumber, issues, stderr);
    // await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', {
    //   owner: payload.repository.owner.login,
    //   repo: payload.repository.name,
    //   issue_number: payload.pull_request.number,
    //   body: messageForNewPRs,
    //   headers: {
    //     'x-github-api-version': '2022-11-28',
    //   },
    // });
  } catch (error) {
    if (error.response) {
      console.error(
        `Error! Status: ${error.response.status}. Message: ${error.response.data.message}`
      );
    }
    console.error(error);
  }
}
