import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm"; // ✅ Import D3.js module

let data = []; // ✅ Store CSV data
let commits = []; // ✅ Store processed commit data

const width = 1000;
const height = 600;

let xScale, yScale; // ✅ Global variables
let brushSelection = null; // ✅ Declare globally

function displayStats() {
  processCommits(); // ✅ Ensure commit data is processed

  const dl = d3.select("#stats").append("dl").attr("class", "stats");

  // ✅ Total LOC
  dl.append("dt").html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append("dd").text(data.length);

  // ✅ Total Commits
  dl.append("dt").text("Commits");
  dl.append("dd").text(commits.length);

  // ✅ Number of Files
  let numFiles = new Set(data.map((d) => d.file)).size;
  dl.append("dt").text("Files");
  dl.append("dd").text(numFiles);

  // ✅ Maximum Depth
  let maxDepth = d3.max(data, (d) => d.depth);
  dl.append("dt").text("Max Depth");
  dl.append("dd").text(maxDepth);

  // ✅ Longest Line Length
  let longestLine = d3.max(data, (d) => d.length);
  dl.append("dt").text("Longest Line");
  dl.append("dd").text(longestLine);

  // ✅ Maximum File Length
  let maxFileLength = d3.max(
    d3.rollups(data, (v) => d3.max(v, (d) => d.line), (d) => d.file),
    (d) => d[1]
  );
  dl.append("dt").text("Max File Length");
  dl.append("dd").text(maxFileLength);

  // ✅ Average File Length
  let avgFileLength = d3.mean(
    d3.rollups(data, (v) => d3.max(v, (d) => d.line), (d) => d.file),
    (d) => d[1]
  );
  dl.append("dt").text("Avg File Length");
  dl.append("dd").text(avgFileLength.toFixed(2));

  // ✅ Average Depth
  let avgDepth = d3.mean(data, (d) => d.depth);
  dl.append("dt").text("Avg Depth");
  dl.append("dd").text(avgDepth.toFixed(2));

  // ✅ Time of Day Most Work Done
  let timeOfDay = d3.rollups(
    data,
    (v) => v.length,
    (d) => Math.floor(d.datetime.getHours() / 6) // Buckets: 0-6, 6-12, 12-18, 18-24
  );
  let mostWorkPeriod = d3.greatest(timeOfDay, (d) => d[1])?.[0];
  let periodLabels = ["Night", "Morning", "Afternoon", "Evening"];
  dl.append("dt").text("Most Work Done (Time)");
  dl.append("dd").text(periodLabels[mostWorkPeriod]);
}


async function loadData() {
  data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line),
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  displayStats(); // ✅ Display stats after loading data
  createScatterplot(); // ✅ Call scatterplot function
}

function processCommits() {
  commits = d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let ret = {
        id: commit,
        url: `https://github.com/vis-society/lab-7/commit/${commit}`,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(ret, 'lines', {
        value: lines,
        configurable: false,
        writable: false,
        enumerable: false,
      });

      return ret;
    });
}

function createScatterplot() {
  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  xScale = d3.scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, width])
    .nice();

  yScale = d3.scaleLinear()
    .domain([0, 24])
    .range([height, 0]);

  // ✅ Add X and Y axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale).tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

  svg.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxis);

  svg.append('g')
    .attr('transform', `translate(0, 0)`)
    .call(yAxis);

  // ✅ Add dots
  svg.selectAll('circle')
    .data(commits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => Math.sqrt(d.totalLines) + 2) // ✅ Proportional radius
    .attr('fill', 'steelblue')
    .style('fill-opacity', 0.7)
    .on('mouseenter', function (event, commit) {
      d3.select(event.currentTarget).style('fill-opacity', 1);
      updateTooltipContent(commit);
      updateTooltipPosition(event);
      updateTooltipVisibility(true);
    })
    .on('mousemove', (event) => {
      updateTooltipPosition(event);
    })
    .on('mouseleave', function () {
      d3.select(event.currentTarget).style('fill-opacity', 0.7);
      updateTooltipContent(null);
      updateTooltipVisibility(false);
    });

  // ✅ Add brushing functionality
  const brush = d3.brush()
    .extent([[0, 0], [width, height]])
    .on("start brush end", brushed);

  svg.append("g")
    .attr("class", "brush")
    .call(brush);
}

function brushed(event) {
  brushSelection = event.selection; // ✅ Store brush selection globally

  console.log("Brush selection:", brushSelection); // ✅ Debugging output

  updateSelection(); // ✅ Call updateSelection() when brushing occurs
}

function updateSelection() {
  if (!brushSelection) {
    d3.selectAll('circle').classed('selected', false);
    updateSelectionCount();
    updateLanguageBreakdown();
    return;
  }

  const [[x0, y0], [x1, y1]] = brushSelection;

  const selectedCommits = commits.filter((d) => {
    const cx = xScale(d.datetime);
    const cy = yScale(d.hourFrac);
    return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
  });

  d3.selectAll('circle')
    .classed('selected', (d) => selectedCommits.some(c => c.id === d.id)); // ✅ Fix selection logic

  updateSelectionCount(selectedCommits);
  updateLanguageBreakdown(selectedCommits);
}

function updateSelectionCount(selectedCommits = []) {
  const countElement = document.getElementById('selection-count');

  countElement.textContent = selectedCommits.length
    ? `${selectedCommits.length} commits selected`
    : "No commits selected";
}

function updateLanguageBreakdown(selectedCommits = []) {
  const container = document.getElementById('language-breakdown');

  if (selectedCommits.length === 0) {
    container.innerHTML = "<p>No selection made</p>";
    return;
  }

  const lines = selectedCommits.flatMap((d) => d.lines);

  const breakdown = d3.rollup(
    lines,
    (v) => v.length,
    (d) => d.type
  );

  container.innerHTML = '';

  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format('.1~%')(proportion);

    container.innerHTML += `
        <dt>${language}</dt>
        <dd>${count} lines (${formatted})</dd>
    `;
  }
}

function isCommitSelected(commit) {
  if (!brushSelection) return false;

  const [[x0, y0], [x1, y1]] = brushSelection;
  const x = xScale(commit.datetime);
  const y = yScale(commit.hourFrac);

  return x0 <= x && x <= x1 && y0 <= y && y <= y1;
}

function updateTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const time = document.getElementById('commit-time');
  const author = document.getElementById('commit-author');
  const lines = document.getElementById('commit-lines');

  if (!commit) {
    link.textContent = "";
    date.textContent = "";
    time.textContent = "";
    author.textContent = "";
    lines.textContent = "";
    return;
  }

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.date;
  time.textContent = commit.time;
  author.textContent = commit.author;
  lines.textContent = commit.totalLines;
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.classList.toggle('visible', isVisible);
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  if (!tooltip) return;

  const tooltipWidth = tooltip.offsetWidth;
  const tooltipHeight = tooltip.offsetHeight;

  let x = event.clientX + 10;
  let y = event.clientY + 10;

  if (x + tooltipWidth > window.innerWidth) x = event.clientX - tooltipWidth - 10;
  if (y + tooltipHeight > window.innerHeight) y = event.clientY - tooltipHeight - 10;

  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
});
