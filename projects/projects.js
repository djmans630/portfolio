import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let projects = [];  
let query = '';  
let selectedIndex = -1;  

async function loadProjects() {
    projects = await fetchJSON('../lib/projects.json');
    console.log("Projects loaded:", projects);
    const projectsContainer = document.querySelector('.projects');
    const projectsTitle = document.querySelector('.projects-title');

    const projectCount = projects.length;
    projectsTitle.textContent = `${projectCount} Projects`; // Show count

    renderProjects(projects, projectsContainer, 'h2');

    // ✅ Corrected rolling data grouping
    let rolledData = d3.rollups(
        projects,
        (v) => v.length,
        (d) => d.year.toString()
    );

    let data = rolledData.map(([year, count]) => ({
        value: count,
        label: year
    }));

    renderPieChart(projects);
}

// ✅ Render Pie Chart with Correct Transformations
function renderPieChart(filteredProjects) {
    console.log("Rendering pie chart with data:", filteredProjects);
    console.log("Projects Passed to Pie Chart:", filteredProjects);
    let rolledData = d3.rollups(
        filteredProjects,
        (v) => v.length,
        (d) => d.year.toString()
    );

    console.log("Rolled Data:", rolledData);

    let data = rolledData.map(([year, count]) => ({
        value: count,
        label: year
    }));

    const newSVG = d3.select('#projects-pie-plot');
    newSVG.selectAll('*').remove(); // ✅ Ensure everything is cleared before re-rendering

    const newLegend = d3.select('.legend').html('');

    if (data.length === 0) {
        newSVG.append('text')
            .attr('x', 0)
            .attr('y', 0)
            .attr('text-anchor', 'middle')
            .text('No data to display');

        newLegend.append('li').text('No projects found');
        return; 
    }

    const colors = d3.scaleOrdinal(d3.schemeTableau10);
    const newSliceGenerator = d3.pie().value(d => d.value);
    const newArcData = newSliceGenerator(data);
    const newArcGenerator = d3.arc().innerRadius(0).outerRadius(120); // ✅ Fixed radius issue

    // ✅ Append pie slices correctly
    newArcData.forEach((d, idx) => {
        newSVG.append('path')
            .attr('d', newArcGenerator(d))
            .attr('fill', colors(idx))
            .attr('transform', 'translate(0, 0)') 
            .attr('class', selectedIndex === idx ? 'selected' : '')  
            .on('click', () => {
                selectedIndex = selectedIndex === idx ? -1 : idx;  
                updateSelection(); // ✅ Ensure filtering is triggered
            });
    });

    // ✅ Append legend items correctly
    data.forEach((d, idx) => {
        newLegend.append('li')
            .attr('class', 'legend-item') 
            .html(`
                <span class="swatch" style="background-color:${colors(idx)}; width: 1em; height: 1em; display: inline-block; border-radius: 3px;"></span>
                ${d.label} <em>(${d.value})</em>
            `)
            .on('click', () => {
                selectedIndex = selectedIndex === idx ? -1 : idx;
                updateSelection(); 
            });
    });

    console.log("Legend element content:", document.querySelector('.legend').innerHTML);
}

async function updateSelection() {
    let svg = d3.select('#projects-pie-plot');
    let legend = d3.select('.legend');

    // Update selected styles for pie slices and legend items
    svg.selectAll('path').attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''));
    legend.selectAll('li').attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''));

    if (selectedIndex === -1) {
        renderProjects(projects, document.querySelector('.projects'), 'h2'); // Show all projects
        return;
    }

    // ✅ Correctly retrieve the selected year from the pie chart data
    let selectedYear = d3.selectAll('.legend-item')
        .filter((_, idx) => idx === selectedIndex)
        .data()[0]?.label; // Get the year label safely

    if (!selectedYear) {
        console.error("Error: Selected year not found.");
        return;
    }

    console.log(`Filtering for year: ${selectedYear}`); // Debugging log

    // ✅ Ensure filtering matches the correct project year
    let filteredProjects = projects.filter(p => p.year.toString() === selectedYear);

    // ✅ Render only projects from the selected year
    renderProjects(filteredProjects, document.querySelector('.projects'), 'h2');
}

// ✅ Fix search bar behavior
document.querySelector('.searchBar').addEventListener('input', (event) => {
    query = event.target.value.toLowerCase();

    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query);
    });

    console.log("Filtered projects:", filteredProjects); // Debugging

    renderProjects(filteredProjects, document.querySelector('.projects'), 'h2');

    // ✅ Only update pie chart if results exist
    if (filteredProjects.length > 0) {
        renderPieChart(filteredProjects);
    } else {
        console.log("No projects found, keeping pie chart.");
    }
});

loadProjects();
