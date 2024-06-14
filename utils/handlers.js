import { botUsername } from '../config/config.js';
import { analyzeFileWithClaude } from './claude.js';
import { getChangedFiles, getFileContent } from './github/file.js';
import { cloneRepo } from './github/github.js';
import { checkovRunner, sonarQubeRunner } from './runners.js';
import { analyzeFileWithChatGPT, postCommentOnFile } from './utils.js';

export async function handlePullRequestOpened({ octokit, payload }) {
  console.log(`Received a pull request event for #${payload.pull_request.number}`);
  const prNumber = payload.pull_request.number;
  const repoOwner = payload.repository.owner.login;
  const repoName = payload.repository.name;
  const branch = payload.pull_request.head.ref;

  try {
    // Add Bot as the reviewer
    await addBotAsReviewer(octokit, repoOwner, repoName, prNumber);

    // Get changed files
    const changedFiles = await getChangedFiles(octokit, repoOwner, repoName, prNumber);
    const filesToScan = changedFiles;
    // console.log({ changedFiles });

    // Check whether changed file exist or not
    if (filesToScan.length === 0) {
      console.warn('No Changes found');
      return;
    }

    // Fetch the latest commit SHA
    const commitId = payload.pull_request.head.sha;

    // Scan and comment on each file
    for (const file of filesToScan) {
      console.log('Scanning File', file.filename);
      // Get file content
      const fileContent = await getFileContent(octokit, repoOwner, repoName, file.filename, branch);
      // const analysis = 'Nice code';
      const analysis = await analyzeFileWithClaude(fileContent);
      await postCommentOnFile(octokit, repoOwner, repoName, prNumber, file, analysis, commitId);
    }
    Clone the repository
    await cloneRepo(repoOwner, repoName, branch);

    // Checkov Runner
    await checkovRunner(octokit, repoOwner, repoName, prNumber);

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
      reviewers: [botUsername],
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

async function postCommentOnFilse(octokit, repoOwner, repoName, prNumber, file, comment, commitId) {
  try {
    // Fetch the pull request diff
    const diff = await octokit.rest.pulls.get({
      owner: repoOwner,
      repo: repoName,
      pull_number: prNumber,
    });
    console.log({ diff: diff.data });
    if (!diff.data || !diff.data.files) {
      throw new Error(`No diff data found for PR #${prNumber}`);
    }

    const fileDiff = diff.data.files.find((f) => f.filename === file.filename);
    if (!fileDiff) {
      console.error(`File ${file.filename} not found in the pull request diff.`);
      return;
    }

    const diffHunk = fileDiff.patch;
    const lineNumber = getLineNumberFromDiff(diffHunk);

    const response = await octokit.rest.pulls.createReviewComment({
      owner: repoOwner,
      repo: repoName,
      pull_number: prNumber,
      commit_id: commitId,
      path: file.filename,
      body: comment,
      line: lineNumber,
      side: 'RIGHT',
    });
    console.log(`Commented on ${file.filename}: ${response.data.html_url}`);
  } catch (error) {
    console.error(`Failed to comment on ${file.filename}: ${error.message}`);
  }
}
// Helper function to extract the correct line number from the diff hunk
function getLineNumberFromDiff(diffHunk) {
  const lines = diffHunk.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('+') && !lines[i].startsWith('+++')) {
      return i + 1;
    }
  }
  return 1; // Default to the first line if no added lines are found
}

async function getPullRequestDiff(octokit, repoOwner, repoName, prNumber) {
  const response = await octokit.rest.pulls.get({
    owner: repoOwner,
    repo: repoName,
    pull_number: prNumber,
    mediaType: {
      format: 'diff',
    },
  });
  return response.data;
}
