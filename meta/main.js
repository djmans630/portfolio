import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm"; // ✅ Import D3.js module

let data = []; // ✅ Store CSV data
let commits = []; // ✅ Store processed commit data

const width = 1000;
const height = 600;

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
        url: 'https://github.com/vis-society/lab-7/commit/' + commit,
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

function displayStats() {
  processCommits(); // ✅ Ensure commit data is processed

  const dl = d3.select('#stats').append('dl').attr('class', 'stats');

  // ✅ Total LOC
  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  // ✅ Total Commits
  dl.append('dt').text('Commits');
  dl.append('dd').text(commits.length);

  // ✅ Number of Files
  let numFiles = new Set(data.map(d => d.file)).size;
  dl.append('dt').text('Files');
  dl.append('dd').text(numFiles);

  // ✅ Maximum Depth
  let maxDepth = d3.max(data, d => d.depth);
  dl.append('dt').text('Max Depth');
  dl.append('dd').text(maxDepth);

  // ✅ Longest Line Length
  let longestLine = d3.max(data, d => d.length);
  dl.append('dt').text('Longest Line');
  dl.append('dd').text(longestLine);

  // ✅ Maximum File Length
  let maxFileLength = d3.max(
    d3.rollups(data, (v) => d3.max(v, (d) => d.line), (d) => d.file),
    (d) => d[1]
  );
  dl.append('dt').text('Max File Length');
  dl.append('dd').text(maxFileLength);

  // ✅ Average File Length
  let avgFileLength = d3.mean(
    d3.rollups(data, (v) => d3.max(v, (d) => d.line), (d) => d.file),
    (d) => d[1]
  );
  dl.append('dt').text('Avg File Length');
  dl.append('dd').text(avgFileLength.toFixed(2));

  // ✅ Average Depth
  let avgDepth = d3.mean(data, (d) => d.depth);
  dl.append('dt').text('Avg Depth');
  dl.append('dd').text(avgDepth.toFixed(2));

  // ✅ Time of Day Most Work Done
  let timeOfDay = d3.rollups(
    data,
    (v) => v.length,
    (d) => Math.floor(d.datetime.getHours() / 6) // Buckets: 0-6, 6-12, 12-18, 18-24
  );
  let mostWorkPeriod = d3.greatest(timeOfDay, (d) => d[1])?.[0];
  let periodLabels = ['Night', 'Morning', 'Afternoon', 'Evening'];
  dl.append('dt').text('Most Work Done (Time)');
  dl.append('dd').text(periodLabels[mostWorkPeriod]);
}

function createScatterplot() {
  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  const xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, width])
    .nice();

  const yScale = d3
    .scaleLinear()
    .domain([0, 24])
    .range([height, 0]);

  // ✅ Add gridlines BEFORE the axes
  const gridlines = svg
    .append('g')
    .attr('class', 'gridlines');

  gridlines.call(
    d3.axisLeft(yScale)
      .tickSize(-width)  // ✅ Extend grid lines across the whole width
      .tickFormat('')    // ✅ Hide labels
  );

  // ✅ Add X and Y axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale).tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

  svg.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxis);

  svg.append('g')
    .call(yAxis);

  // ✅ Add dots AFTER the gridlines and axes
  const dots = svg.append('g').attr('class', 'dots');

  dots
  .selectAll('circle')
  .data(commits)
  .join('circle')
  .attr('cx', (d) => xScale(d.datetime))
  .attr('cy', (d) => yScale(d.hourFrac))
  .attr('r', 5)
  .attr('fill', 'steelblue')
  .on('mouseenter', (event, commit) => {
    updateTooltipContent(commit); // ✅ Fills tooltip with data
  })
  .on('mouseleave', () => {
    updateTooltipContent(null); // ✅ Clears tooltip when not hovering
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


document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
});
