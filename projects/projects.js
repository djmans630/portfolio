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

let data = [
    { value: 1, label: 'apples' },
    { value: 2, label: 'oranges' },
    { value: 3, label: 'mangos' },
    { value: 4, label: 'pears' },
    { value: 5, label: 'limes' },
    { value: 5, label: 'cherries' },
  ];
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
let svg = d3.select('svg');
let sliceGenerator = d3.pie().value((d) => d.value);
let arcDataNew = sliceGenerator(data);
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
// let arcs = arcData.map((d) => arcGenerator(d));

// arcs.forEach((arc, idx) => {
//     svg.append('path')
//       .attr('d', arc)
//       .attr('fill', colors(idx))
//       .attr('transform', 'translate(60, 60)'); // Centering the pie chart
//   });

// let arcsNew = arcDataNew.map((d) => arcGenerator(d));

arcDataNew.forEach((d, idx) => {
  svg.append('path')
    .attr('d', arcGenerator(d))
    .attr('fill', colors(idx))
    .attr('transform', 'translate(0, 0)');
});

let legend = d3.select('.legend');
data.forEach((d, idx) => {
    legend.append('li')
          .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
          .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
})

loadProjects();