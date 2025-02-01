import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';
async function loadLatestProjects() {
    const projects = await fetchJSON('./lib/projects.json');
    const latestProjects = projects.slice(0, 3);
    const projectsContainer = document.querySelector('.projects');
    renderProjects(latestProjects, projectsContainer, 'h2');    
}

async function loadGitHubStats() {
    const githubData = await fetchGitHubData('djmans630');
    const profileStats = document.querySelector('#profile-stats');
    if (profileStats) {
        profileStats.innerHTML = `
              <dl>
                <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
                <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
                <dt>Followers:</dt><dd>${githubData.followers}</dd>
                <dt>Following:</dt><dd>${githubData.following}</dd>
              </dl>
          `;
      }
}

loadLatestProjects();
loadGitHubStats();