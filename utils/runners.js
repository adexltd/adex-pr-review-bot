import { CHECKOV_DIRECTORY } from "../constants/constants.js";
import { parseCheckovReport, runCheckov } from './scanner/checkov.js';
import { postCommentsOnPR } from './helpers.js';
import { fetchSonarQubeResults, parseSonarQubeResults, runSonarScanner } from "./scanner/sonarqube.js";

export async function checkovRunner(
  octokit,
  repoOwner,
  repoName,
  prNumber,
) {
  try {
    const { stdout, stderr } = runCheckov(CHECKOV_DIRECTORY);
    const issues = parseCheckovReport(stdout);

    // Post comments on the PR
    await postCommentsOnPR(octokit, repoOwner, repoName, prNumber, issues, stderr, '');
  } catch (error) {
    if (error.response) {
      console.error(
        `Error! Status: ${error.response.status}. Message: ${error.response.data.message}`
      );
    }
    console.error(error);
  }
}

export async function sonarQubeRunner(
  octokit,
  repoOwner,
  repoName,
  prNumber,
) {
  try {
    // Clone the repository
    runSonarScanner()
    const results = await fetchSonarQubeResults();
    const comment = parseSonarQubeResults(results);

    // Post comments on the PR
    await postCommentsOnPR(octokit, repoOwner, repoName, prNumber, issues = [], stderr = '', comment);
  } catch (error) {
    if (error.response) {
      console.error(
        `Error! Status: ${error.response.status}. Message: ${error.response.data.message}`
      );
    }
    console.error(error);
  }
}