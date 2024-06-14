export async function getChangedFiles(octokit, repoOwner, repoName, prNumber) {
    try {
        const response = await octokit.rest.pulls.listFiles({
            owner: repoOwner,
            repo: repoName,
            pull_number: prNumber
        });
        return response.data;
    } catch (error) {
        console.error('Error getting changed files:', error.message);
        return [];
    }
}

export async function getFileContent(octokit, repoOwner, repoName, filePath) {
    try {
        const response = await octokit.rest.repos.getContent({
            owner: repoOwner,
            repo: repoName,
            path: filePath
        });
        const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
        return content;
    } catch (error) {
        console.error(`Error getting file content for ${filePath}:`, error.message);
        return null;
    }
}
