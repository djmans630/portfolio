import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let projects = [];  
let query = '';  
let selectedIndex = -1;  

async function loadProjects() {
    projects = await fetchJSON('../lib/projects.json');

    const projectsContainer = document.querySelector('.projects');
    const projectsTitle = document.querySelector('.projects-title');

    const projectCount = projects.length; // Calculate project count
    projectsTitle.textContent = `${projectCount} Projects`; // Update the title dynamically

    renderProjects(projects, projectsContainer, 'h2');

    let rolledData = d3.rollups(
        projects,
        (v) => v.length,
        (d) => d.year
    );

    let data = rolledData.map(([year, count]) => ({
        value: count,
        label: year.toString()
    }));

    renderPieChart(data);
}

// ✅ Step 2: Render Pie Chart
function renderPieChart(data) {
    const newSVG = d3.select('#projects-pie-plot');
    newSVG.selectAll('path').remove(); 
    const newLegend = d3.select('.legend').html('');

    const colors = d3.scaleOrdinal(d3.schemeTableau10);
    const newSliceGenerator = d3.pie().value(d => d.value);
    const newArcData = newSliceGenerator(data);
    const newArcGenerator = d3.arc().innerRadius(0).outerRadius(80);

    // Append pie slices
    newArcData.forEach((d, idx) => {
        newSVG.append('path')
            .attr('d', newArcGenerator(d))
            .attr('fill', colors(idx))
            .attr('transform', 'translate(0, 0)') 
            .attr('class', selectedIndex === idx ? 'selected' : '')  
            .on('click', () => {
                selectedIndex = selectedIndex === idx ? -1 : idx;  
                updateSelection(); 
            });
    });

    // Append legend items
    data.forEach((d, idx) => {
        newLegend.append('li')
            .attr('class', 'legend-item') // Add a class for styling
            .html(`
                <span class="swatch" style="background-color:${colors(idx)};"></span>
                ${d.label} <em>(${d.value})</em>
            `)
            .on('click', () => {
                selectedIndex = selectedIndex === idx ? -1 : idx;
                updateSelection(); 
            });
    });
}


function updateSelection() {
    let svg = d3.select('#projects-pie-plot');
    let legend = d3.select('.legend');

    // ✅ Update pie slices and legend items
    svg.selectAll('path').attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''));
    legend.selectAll('li').attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''));

    // ✅ Filter projects based on selection
    if (selectedIndex === -1) {
        renderProjects(projects, document.querySelector('.projects'), 'h2');
    } else {
        let selectedYear = d3.select('.legend .selected').text().trim().split(" ")[0]; 
        let filteredProjects = projects.filter(p => p.year === selectedYear);  
        renderProjects(filteredProjects, document.querySelector('.projects'), 'h2');
    }
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
