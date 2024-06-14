export function parseRepositoryFromComment(commentBody) {
  const repoRegex = /(https:\/\/github\.com\/([^\/]+)\/([^\/]+))[\|\]]/;
  const match = commentBody.match(repoRegex);
  return match ? { url: match[1], username: match[2], repoName: match[3] } : null;
}

export async function findValueAndTriggerActivity(obj, key, substring, activity, octokit) {
  const value = findValueByKey(obj, key);
  if (value && typeof value === 'string' && value.includes(substring)) {
    const repoInfo = parseRepositoryFromComment(value);
    if (repoInfo) {
      await activity(octokit, repoInfo.username, repoInfo.repoName);
    } else {
      console.log('URL does not match expected GitHub format');
    }
  }
}

function handleRequestError(error) {
  if (error.response) {
    console.error(
      `Error! Status: ${error.response.status}. Message: ${error.response.data.message}`
    );
  } else {
    console.error(error);
  }
}
