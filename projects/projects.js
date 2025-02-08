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
async function renderPieChart(filteredProjects) {
    let rolledData = d3.rollups(
        filteredProjects,
        (v) => v.length,
        (d) => d.year
    );

    let data = rolledData.map(([year, count]) => ({
        value: count,
        label: year.toString()
    }));

    const newSVG = d3.select('#projects-pie-plot');
    newSVG.selectAll('path').remove(); 
    const newLegend = d3.select('.legend').html('');

    if (data.length === 0) {
        // ✅ Handle empty dataset
        newSVG.append('text')
            .attr('x', 0)
            .attr('y', 0)
            .attr('text-anchor', 'middle')
            .text('No data to display');

        newLegend.append('li')
            .text('No projects found');
        return; // Exit the function early
    }

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
            .attr('class', 'legend-item') 
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

    // Append legend items
    data.forEach((d, idx) => {
        newLegend.append('li')
            .attr('class', 'legend-item') 
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


async function updateSelection() {
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
    query = event.target.value.toLowerCase(); // Normalize query for case-insensitive search

    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase(); // Search all metadata
        return values.includes(query);
    });

    // Render the filtered projects
    renderProjects(filteredProjects, document.querySelector('.projects'), 'h2');
    
    // Update the pie chart and legend dynamically
    renderPieChart(filteredProjects);
});

loadProjects();
