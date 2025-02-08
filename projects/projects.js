import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm"

async function loadProjects() {
    const projects = await fetchJSON('../lib/projects.json');
    const projectsContainer = document.querySelector('.projects');
    const projectsTitle = document.querySelector('.projects-title');
    const projectText = projects.length === 1 ? 'project' : 'projects';
    projectsTitle.textContent = `${projects.length} ${projectText}`;
    renderProjects(projects, projectsContainer, 'h2');
    renderPieChart(projects);

    let rolledData = d3.rollups(
        projects,
        (v) => v.length,  // Count number of projects per year
        (d) => d.year      // Group by year
    );

    let data = rolledData.map(([year, count]) => ({
        value: count,
        label: year
    }));
    renderPieChart(data);
}

// let arc = d3.arc().innerRadius(0).outerRadius(50)({
//   startAngle: 0,
//   endAngle: 2 * Math.PI,
// });
// d3.select('svg').append('path').attr('d', arc).attr('fill', 'red');
function renderPieChart(data) {
    let newRolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year
    );

    let newData = newRolledData.map(([year, count]) => ({
        value: count,
        label: year
    }));

    let newSVG = d3.select('#projects-pie-plot').html('');
    newSVG.selectAll('path').remove();
    let newLegend = d3.select('.legend').html('');
    let colors = d3.scaleOrdinal(d3.schemeTableau10);
    let newSliceGenerator = d3.pie().value(d => d.value);
    let newArcData = newSliceGenerator(newData);
    let newArcGenerator = d3.arc().innerRadius(0).outerRadius(50);

    newArcData.forEach((d, idx) => {
        newSVG.append('path')
            .attr('d', newArcGenerator(d))
            .attr('fill', colors(idx))
            .attr('transform', 'translate(0, 0)'); 
    });

    newData.forEach((d, idx) => {
        newLegend.append('li')
            .attr('style', `background-color: ${colors(idx)}`)
            .attr('class', 'legend-item')
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
}

document.querySelector('.searchBar').addEventListener('input', (event) => {
    query = event.target.value.toLowerCase(); 

    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query);
    });

    renderProjects(filteredProjects, document.querySelector('.projects'), 'h2');
    renderPieChart(filteredProjects); 
});

loadProjects();