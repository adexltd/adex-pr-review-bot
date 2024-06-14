export async function createGitHubPullRequest(octokit, owner, repo, title, body, head, base) {
  try {
    const response = await octokit.pulls.create({
      owner,
      repo,
      title,
      body,
      head,
      base,
    });

    console.log('Pull request created:', response.data);
  } catch (error) {
    console.error('Error creating pull request:', error.message);
  }
}

export const activity = async (octokit, value) => {
  console.log(`Activity triggered! The value is: ${value}`);

  if (value.includes(KEYWORD)) {
    try {
      console.log(`Creating pull request in repo: ${GITHUB_REPO}`);

      const response = await octokit.pulls.create({
        owner: username, // Replace with the owner of the repository
        repo: repoName, // Replace with the name of the repository
        title: `Triggered by Jira Issue hello 12345566`,
        body: `Pull request automatically triggered by Jira issue I am here`,
        head: 'KAN-1-dev', // Replace with the branch name you want to merge from
        base: 'main', // Replace with the base branch you want to merge into
      });

      console.log('Pull request created:', response.data);
    } catch (error) {
      console.error('Error creating pull request:', error.message);
    }
  }
};
