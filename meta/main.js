import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm"; // ✅ Import D3.js module

let data = []; // ✅ Store CSV data
let commits = []; // ✅ Store processed commit data

const width = 1000;
const height = 600;

let xScale, yScale; // ✅ Global variables
let brushSelection = null; // ✅ Declare globally

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

function updateTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const time = document.getElementById('commit-time');
  const author = document.getElementById('commit-author');
  const lines = document.getElementById('commit-lines');

  if (!commit) return; // Prevent errors if no commit is selected

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.date;
  time.textContent = commit.time;
  author.textContent = commit.author;
  lines.textContent = commit.totalLines;
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  if (isVisible) {
    tooltip.classList.add('visible'); // ✅ Show tooltip
  } else {
    tooltip.classList.remove('visible'); // ✅ Hide tooltip
  }
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');

  if (!tooltip) return; // ✅ Avoids errors if tooltip doesn't exist

  const tooltipWidth = tooltip.offsetWidth;
  const tooltipHeight = tooltip.offsetHeight;

  let x = event.clientX + 10; // ✅ Moves tooltip slightly right
  let y = event.clientY + 10; // ✅ Moves tooltip slightly below cursor

  // ✅ Prevent tooltip from going off the right edge
  if (x + tooltipWidth > window.innerWidth) {
    x = event.clientX - tooltipWidth - 10; // Move tooltip left if too close to right
  }

  // ✅ Prevent tooltip from going off the bottom edge
  if (y + tooltipHeight > window.innerHeight) {
    y = event.clientY - tooltipHeight - 10; // Move tooltip above cursor if too low
  }

  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
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

  const brush = d3.brush()
    .extent([[0, 0], [width, height]])
    .on("start brush end", brushed);

  svg.append("g").attr("class", "brush").call(brush);
}

function brushed(event) {
  brushSelection = event.selection; // ✅ Now properly updates globally

  updateSelection(); // ✅ Call updateSelection() when brushing occurs
}

function updateSelection() {
  if (!brushSelection) {
    d3.selectAll('circle').classed('selected', false);
    updateSelectionCount([]);
    updateLanguageBreakdown([]);
    return;
  }

  const selectedCommits = commits.filter(isCommitSelected);

  d3.selectAll('circle')
    .classed('selected', (d) => isCommitSelected(d));

  updateSelectionCount(selectedCommits);
  updateLanguageBreakdown(selectedCommits);
}

function updateSelectionCount(selectedCommits) {
  const countElement = document.getElementById('selection-count');

  countElement.textContent = selectedCommits.length
    ? `${selectedCommits.length} commits selected`
    : "No commits selected";
}

function updateLanguageBreakdown(selectedCommits) {
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

  container.innerHTML = ''; // ✅ Clear before adding new stats

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

  const x = xScale(commit.datetime); // ✅ Use datetime for X
  const y = yScale(commit.hourFrac); // ✅ Use hourFrac for Y

  return x0 <= x && x <= x1 && y0 <= y && y <= y1;
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
});
