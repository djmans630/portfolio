import { fetchJSON, renderProjects, fetchGithubData } from './global.js';
async function loadLatestProjects() {
    const projects = await fetchJSON('./lib/projects.json');
    const latestProjects = projects.slice(0, 3);
    const projectsContainer = document.querySelector('.projects');
    renderProjects(latestProjects, projectsContainer, 'h2');    
}

async function loadGitHubStats() {
    const githubData = await fetchGitHubData('djmans630');
    const profileStats = document.querySelector('#profile-stats');
}

loadLatestProjects();
loadGitHubStats();