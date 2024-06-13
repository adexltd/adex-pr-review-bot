import { exec,spawnSync } from 'child_process';

 export function runCheckov(directory) {
  console.log(`Running Checkov in directory: ${directory}`);
  const result = spawnSync('checkov', ['-d', directory, '--download-external-modules', 'all', '--quiet', '--compact']);
  
  if (result.error) {
    console.error(`Failed to run Checkov: ${result.error.message}`);
    return { stdout: '', stderr: result.error.message };
  }

  const stdout = result.stdout.toString();
  const stderr = result.stderr.toString();

  console.log(`Checkov stdout: ${stdout}`);
  console.log(`Checkov stderr: ${stderr}`);
  
  return { stdout, stderr };
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
