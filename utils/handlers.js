import { botUsername } from '../config/config.js';
import { cloneRepo } from './github/github.js';
import { checkovRunner, sonarQubeRunner } from './runners.js';

export async function handlePullRequestOpened({ octokit, payload }) {
  console.log(`Received a pull request event for #${payload.pull_request.number}`);
  const prNumber = payload.pull_request.number;
  const repoOwner = payload.repository.owner.login;
  const repoName = payload.repository.name;
  const branch = payload.pull_request.head.ref;

  try {
    // Add Bot as the reviewer
    await addBotAsReviewer(octokit, repoOwner, repoName, prNumber);

    // Clone the repository
    await cloneRepo(repoOwner, repoName, branch);

    // Checkov Runner
    await checkovRunner(
      octokit,
      repoOwner,
      repoName,
      prNumber,
    );

    // Uncomment and implement if needed
    // SonarQube Runner
    // await sonarQubeRunner(
    //   octokit,
    //   repoOwner,
    //   repoName,
    //   prNumber,
    // );
  } catch (error) {
    console.error('Error processing pull request:', error.message);
  }
}

export async function addBotAsReviewer(octokit, repoOwner, repoName, prNumber) {
  try {
    const response = await octokit.rest.pulls.requestReviewers({
      owner: repoOwner,
      repo: repoName,
      pull_number: prNumber,
      reviewers: [botUsername]
    });
    if (response.status === 200 || response.status === 201) {
      console.log(`Bot ${botUsername} added as a reviewer to PR #${prNumber}`);
    } else {
      console.error('Failed to add bot as a reviewer:', response.data.message);
    }
  } catch (error) {
    console.error('Error adding bot as a reviewer:', error.message);
  }
}

