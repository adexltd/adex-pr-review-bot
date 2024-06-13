import { Octokit } from 'octokit';
import fs from 'fs';
import { CHECKOV_DIRECTORY } from '../constants/constants.js';
import { exec } from 'child_process';

/**
Helper function to get an authenticated Octokit instance
@param installationId 
*/
export async function getOctokit(octokit, installationId) {
  const installationAuth = await octokit.auth({
    type: 'installation',
    installationId,
  });

  const octokitWithAuth = new Octokit({
    auth: installationAuth.token,
  });
  return octokitWithAuth;
}

/**
 * Helper functions for the Checkov runner and action.
 * @param  owner
 * @param  repo
 * @param  branch
 * @returns
 */
export async function cloneRepo(owner, repo, branch) {
  const repoUrl = `https://github.com/${owner}/${repo}.git`;
  if (fs.existsSync(CHECKOV_DIRECTORY)) {
    console.log(`Removing existing directory: ${CHECKOV_DIRECTORY}`);
    fs.rmSync(CHECKOV_DIRECTORY, { recursive: true, force: true });
  }
  console.log(`Cloning repository branch '${branch}' into directory '${CHECKOV_DIRECTORY}'`);
  return new Promise((resolve, reject) => {
    exec(
      `git clone --branch ${branch} ${repoUrl} ${CHECKOV_DIRECTORY}`,
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      }
    );
  });
}

/**
 * Post comments on a pull request.
 * @param octokit
 * @param owner
 * @param  repo
 * @param  prNumber
 * @param  issues
 * @param  errors
 */
export async function postCommentsOnPR(octokit, owner, repo, prNumber, issues, errors) {
  let comment;

  if (!issues.length && !errors) {
    comment = 'No issues found by Checkov.';
  } else {
    comment = '**Checkov Scan Result**\n\n';
    if (issues.length) {
      issues.forEach((issue) => {
        comment += `
**Check**: ${issue.check}
**Resource**: ${issue.resource || 'N/A'}
**File**: ${issue.file}
**Calling File**: ${issue.calling_file || 'N/A'}
**Severity**: ${issue.severity}
**Code**: ${issue.code}
**Message**: ${issue.message}
**More Details**: ${issue.details}
**Guide**: ${issue.guide || 'N/A'}

Please address this issue.
`;
      });
    }
    if (errors) {
      comment += `\n\n**Checkov Errors**\n\n\`\`\`\n${errors}\n\`\`\``;
    }
  }

  try {
    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body: comment,
    });
    console.log('Successfully posted comment.');
  } catch (error) {
    console.error(`Failed to post comment: ${error}`);
  }
}
