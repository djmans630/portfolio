import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm"

async function loadProjects() {
    const projects = await fetchJSON('../lib/projects.json');
    const projectsContainer = document.querySelector('.projects');
    const projectsTitle = document.querySelector('.projects-title');
    const projectText = projects.length === 1 ? 'project' : 'projects';
    projectsTitle.textContent = `${projects.length} ${projectText}`;
    renderProjects(projects, projectsContainer, 'h2');
}

let arc = d3.arc().innerRadius(0).outerRadius(50)({
  startAngle: 0,
  endAngle: 2 * Math.PI,
});
d3.select('svg').append('path').attr('d', arc).attr('fill', 'red');

loadProjects();