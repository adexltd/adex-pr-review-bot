// Function to run the SonarQube scanner
export function runSonarScanner() {
    const command = [
      'sonar-scanner',
      '-X',
      `-Dsonar.projectKey=${SONAR_PROJECTKEY}`,
      `-Dsonar.projectVersion=${PROJ_VERSION}`,
      `-Dsonar.host.url=${SONAR_HOST_URL}`,
      `-Dsonar.login=${SONAR_TOKEN}`
    ];
    const result = spawnSync(command.join(' '), { shell: true, stdio: 'inherit' });
    
    if (result.status === 0) {
      console.log("SonarQube scan completed successfully.");
    } else {
      console.log("SonarQube scan failed.");
    }
  }


  // Function to fetch the SonarQube quality gate result
export async function fetchSonarQubeResults() {
    const qualityGateUrl = `${SONAR_HOST_URL}/api/qualitygates/project_status?projectKey=${SONAR_PROJECTKEY}`;
    const authHeader = 'Basic ' + base64.encode(`${SONAR_TOKEN}:`);
    const headers = { 'Authorization': authHeader };
    try {
      const response = await axios.get(qualityGateUrl, { headers });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch SonarQube results: ${error}`);
      return null;
    }
  }

  // Function to parse the SonarQube results and create a comment
export function parseSonarQubeResults(results) {
    if (!results) {
      return "No SonarQube results found.";
    }
  
    const status = results.projectStatus.status;
    const conditions = results.projectStatus.conditions;
  
    let comment = `**SonarQube Quality Gate Result: ${status}**\n\n`;
  
    conditions.forEach(condition => {
      const conditionStatus = condition.status === 'OK' ? '✅' : '💣';
      comment += `${conditionStatus} **MetricKey**: ${condition.metricKey}\n`;
      comment += `   - **Status**: ${condition.status}\n`;
      comment += `   - **Comparator**: ${condition.comparator}\n`;
      comment += `   - **ErrorThreshold**: ${condition.errorThreshold}\n`;
      comment += `   - **ActualValue**: ${condition.actualValue}\n\n`;
    });
  
    return comment;
  }
  