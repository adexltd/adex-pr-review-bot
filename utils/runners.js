import { CHECKOV_DIRECTORY } from "../constants/constants.js";
import { parseCheckovReport, runCheckov } from './scanner/checkov.js';
import { postCommentsOnPR, cloneRepo} from './helpers.js';

export async function checkovRunner(
    octokit,
    repoOwner,
    repoName,
    branch,
    prNumber,
){
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
export async function sonarQubeRunner(){

}