import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm"; // ✅ Import D3.js module

let data = []; // ✅ Store CSV data
let commits = []; // ✅ Store processed commit data

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
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
});