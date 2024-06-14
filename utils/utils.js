import { ChatGPTAPI } from 'chatgpt';
import { openAiApiKey } from '../config/config.js';

const chatgpt = new ChatGPTAPI({ apiKey: openAiApiKey });

export async function analyzeFileWithChatGPT(fileContent) {
  try {
    const response = await chatgpt.sendMessage(
      `Please review the following code:\n\n${fileContent}`
    );
    console.log(response.text);
    return response.text;
  } catch (error) {
    console.error('Error analyzing file with ChatGPT:', error.message);
    return 'Error analyzing file with ChatGPT.';
  }
}

export async function postCommentOnFile(
  octokit,
  repoOwner,
  repoName,
  prNumber,
  file,
  comment,
  commitId
) {
  try {
    const response = await octokit.rest.pulls.createReviewComment({
      owner: repoOwner,
      repo: repoName,
      pull_number: prNumber,
      commit_id: commitId,
      path: file.filename,
      body: comment,
      line: 1,
    });
    console.log(`Commented on ${file.filename}: ${response.data.html_url}`);
  } catch (error) {
    console.error(`Failed to comment on ${file.filename}: ${error.message}`);
  }
}
