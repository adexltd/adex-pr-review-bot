import { exec } from 'child_process';

export async function runCheckov(directory) {
  console.log(`Running Checkov in directory: ${directory}`);
  return new Promise((resolve, reject) => {
    exec(
      `checkov -d ${directory} --download-external-modules all --quiet --compact`,
      (error, stdout, stderr) => {
        if (error) {
          reject(stderr);
        } else {
          resolve({ stdout, stderr });
        }
      }
    );
  });
}

export function parseCheckovReport(report) {
  const lines = report.split('\n');
  const issues = [];
  let currentIssue = null;

  lines.forEach((line) => {
    if (line.startsWith('Check:')) {
      if (currentIssue) issues.push(currentIssue);
      currentIssue = { check: line.trim() };
    } else if (line.startsWith('File:')) {
      currentIssue.file = line.trim();
    } else if (line.startsWith('Severity:')) {
      currentIssue.severity = line.trim();
    } else if (line.startsWith('Code:')) {
      currentIssue.code = line.trim();
    } else if (line.startsWith('Message:')) {
      currentIssue.message = line.trim();
    } else if (line.startsWith('More details:')) {
      currentIssue.details = line.trim();
    } else if (line.startsWith('FAILED for resource:')) {
      currentIssue.resource = line.trim();
    } else if (line.startsWith('Calling File:')) {
      currentIssue.calling_file = line.trim();
    } else if (line.startsWith('Guide:')) {
      currentIssue.guide = line.trim();
    }
  });

  if (currentIssue) issues.push(currentIssue);

  return issues;
}
