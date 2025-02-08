import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let projects = [];  // ✅ Store all projects globally
let query = '';  // ✅ Store search query
let selectedIndex = -1;  // ✅ Store the selected pie slice index (-1 means none selected)

// ✅ Step 1: Load and Process Project Data
async function loadProjects() {
    projects = await fetchJSON('../lib/projects.json'); // ✅ Fetch project data

    renderProjects(projects, document.querySelector('.projects'), 'h2');

    // ✅ Group projects by year and count them
    let rolledData = d3.rollups(
        projects,
        (v) => v.length,  
        (d) => d.year     
    );

    let data = rolledData.map(([year, count]) => ({
        value: count,
        label: year.toString()  // ✅ Ensure year is treated as a string
    }));

    renderPieChart(data); // ✅ Render pie chart with processed data
}

// ✅ Step 2: Render Pie Chart
function renderPieChart(data) {
    let newSVG = d3.select('#projects-pie-plot');
    newSVG.selectAll('path').remove(); // ✅ Clear previous paths
    let newLegend = d3.select('.legend').html(''); // ✅ Clear previous legend

    let colors = d3.scaleOrdinal(d3.schemeTableau10);
    let newSliceGenerator = d3.pie().value(d => d.value);
    let newArcData = newSliceGenerator(data);
    let newArcGenerator = d3.arc().innerRadius(10).outerRadius(45); // ✅ Increased size for visibility

    // ✅ Append pie slices with interactive click events
    newArcData.forEach((d, idx) => {
        newSVG.append('path')
            .attr('d', newArcGenerator(d))
            .attr('fill', colors(idx))
            .attr('transform', 'translate(0, 0)') // ✅ Center properly
            .attr('class', selectedIndex === idx ? 'selected' : '')  
            .on('click', () => {
                selectedIndex = selectedIndex === idx ? -1 : idx;  
                updateSelection(); 
            });
    });

    // ✅ Append legend items with interactive click events
    data.forEach((d, idx) => {
        newLegend.append('li')
            .attr('class', selectedIndex === idx ? 'selected' : '')
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
            .on('click', () => {
                selectedIndex = selectedIndex === idx ? -1 : idx;
                updateSelection(); 
            });
    });
}

// ✅ Step 3: Update Selection When Clicking a Wedge or Legend Item
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
        let selectedYear = d3.select('.legend .selected').text().trim().split(" ")[0];  // ✅ Get selected year from legend
        let filteredProjects = projects.filter(p => p.year === selectedYear);  // ✅ Filter projects
        renderProjects(filteredProjects, document.querySelector('.projects'), 'h2');
    }
}

// ✅ Step 4: Search Functionality (Triggers Pie Chart Update)
document.querySelector('.searchBar').addEventListener('input', (event) => {
    query = event.target.value.toLowerCase(); // ✅ Normalize query for case-insensitive search

    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query);
    });

    renderProjects(filteredProjects, document.querySelector('.projects'), 'h2');
    renderPieChart(filteredProjects); // ✅ Update pie chart dynamically
});

// ✅ Load Projects When Page Loads
loadProjects();
