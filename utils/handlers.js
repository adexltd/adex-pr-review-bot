import { cloneRepo } from './helpers.js';
import { checkovRunner, sonarQubeRunner } from './runners.js';

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

  // Clone the repository
  await cloneRepo(repoOwner, repoName, branch);

  // Checkov Runner
  await checkovRunner(
    octokit,
    repoOwner,
    repoName,
    prNumber,
  )
  // SonarQube Runner
  await sonarQubeRunner(
    octokit,
    repoOwner,
    repoName,
    prNumber,
  )

}
