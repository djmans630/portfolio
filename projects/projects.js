import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm"

async function loadProjects() {
    const projects = await fetchJSON('../lib/projects.json');
    const projectsContainer = document.querySelector('.projects');
    const projectsTitle = document.querySelector('.projects-title');
    const projectText = projects.length === 1 ? 'project' : 'projects';
    projectsTitle.textContent = `${projects.length} ${projectText}`;
    renderProjects(projects, projectsContainer, 'h2');

    let rolledData = d3.rollups(
        projects,
        (v) => v.length,  // Count number of projects per year
        (d) => d.year      // Group by year
    );

    let data = rolledData.map(([year, count]) => ({
        value: count,
        label: year
    }));
    generatePieChart(data);
}

// let arc = d3.arc().innerRadius(0).outerRadius(50)({
//   startAngle: 0,
//   endAngle: 2 * Math.PI,
// });
// d3.select('svg').append('path').attr('d', arc).attr('fill', 'red');
function generatePieChart(data) {
    //let total = 0;
    let colors = d3.scaleOrdinal(d3.schemeTableau10);
    // for (let d of data) {
    //   total += d;
    // }

    // let angle = 0;
    // let arcData = [];
    // for (let d of data) {
    //     let endAngle = angle + (d / total) * 2 * Math.PI;
    //     arcData.push({ startAngle: angle, endAngle });
    //     angle = endAngle;
    //   }
    let svg = d3.select('#projects-pie-plot').html('');
    let sliceGenerator = d3.pie().value(d => d.value);
    let arcDataNew = sliceGenerator(data);
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    // let arcs = arcData.map((d) => arcGenerator(d));

    // arcs.forEach((arc, idx) => {
    //     svg.append('path')
    //       .attr('d', arc)
    //       .attr('fill', colors(idx))
    //       .attr('transform', 'translate(60, 60)');
    //   });

    // let arcsNew = arcDataNew.map((d) => arcGenerator(d));

    arcDataNew.forEach((d, idx) => {
        svg.append('path')
            .attr('d', arcGenerator(d))
            .attr('fill', colors(idx))
            .attr('transform', 'translate(0, 0)'); // Centering properly
    });

    let legend = d3.select('.legend').html('');

    data.forEach((d, idx) => {
        legend.append('li')
            .attr('style', `--color:${colors(idx)}`)
            .attr('class', 'legend-item')
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
}

loadProjects();