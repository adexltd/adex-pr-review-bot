import { getChangedFiles, getFileContent } from "./file";

export async function reviewChanges({ octokit, payload }) {
    const prNumber = payload.pull_request.number;
    const repoOwner = payload.repository.owner.login;
    const repoName = payload.repository.name;

    // Get the list of changed files in the pull request
    const changedFiles = await getChangedFiles(octokit, repoOwner, repoName, prNumber);

    // Filter the list of changed files to include only the ones you want to scan
    const filesToScan = changedFiles.filter(file => /\.(js|ts|tf|yaml|py)$/.test(file.filename));

    // Iterate over each file to scan
    for (const file of filesToScan) {
        const filePath = file.filename;
        const fileContent = await getFileContent(octokit, repoOwner, repoName, filePath);

        // Run checks (e.g., Checkov, SonarQube) on the file content
        const scanResults = runChecks(fileContent);

        // Post comments for each issue found
        for (const issue of scanResults.issues) {
            const comment = `Found issue in file ${filePath}: ${issue.message}.`;
            await octokit.rest.issues.createComment({
                owner: repoOwner,
                repo: repoName,
                issue_number: prNumber,
                body: comment
            });
        }
    }
}
