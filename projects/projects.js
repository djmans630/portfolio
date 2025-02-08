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

// let arc = d3.arc().innerRadius(0).outerRadius(50)({
//   startAngle: 0,
//   endAngle: 2 * Math.PI,
// });
// d3.select('svg').append('path').attr('d', arc).attr('fill', 'red');

let data = [1, 2];
let total = 0;
for (let d of data) {
  total += d;
}

let angle = 0;
let arcData = [];
for (let d of data) {
    let endAngle = angle + (d / total) * 2 * Math.PI;
    arcData.push({ startAngle: angle, endAngle });
    angle = endAngle;
  }

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let arcs = arcData.map((d) => arcGenerator(d));

let colors = ['gold', 'purple'];
let svg = d3.select('svg');
arcs.forEach((arc, idx) => {
    svg.append('path')
      .attr('d', arc)
      .attr('fill', colors[idx])
      .attr('transform', 'translate(60, 60)'); // Centering the pie chart
  });

let sliceGenerator = d3.pie();
let arcDataNew = sliceGenerator(data);
let arcsNew = arcDataNew.map((d) => arcGenerator(d));

arcsNew.forEach((arc, idx) => {
  svg.append('path')
    .attr('d', arc)
    .attr('fill', colors[idx])
    .attr('transform', 'translate(0, 0)');
});

loadProjects();