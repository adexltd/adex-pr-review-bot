export async function getChangedFiles(octokit, repoOwner, repoName, prNumber) {
  try {
    const response = await octokit.rest.pulls.listFiles({
      owner: repoOwner,
      repo: repoName,
      pull_number: prNumber,
    });
    return response.data;
  } catch (error) {
    console.error('Error getting changed files:', error.message);
    return [];
  }
}

/**
 * Get the content of a file in a repository.
 * @param {Octokit} octokit - Authenticated Octokit instance.
 * @param {string} repoOwner - Owner of the repository.
 * @param {string} repoName - Name of the repository.
 * @param {string} path - Path of the file in the repository.
 * @param {string} ref - Git reference (branch or commit SHA).
 * @returns {Promise<string>} - File content.
 */
export async function getFileContent(octokit, repoOwner, repoName, path, ref) {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: repoOwner,
      repo: repoName,
      path: path,
      ref: ref,
    });

    // Decode Base64 content if the file is not binary
    if (data.encoding === 'base64') {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    } else {
      return data.content;
    }
  } catch (error) {
    console.error(`Error fetching content for file ${path}:`, error.message);
    return '';
  }
}
