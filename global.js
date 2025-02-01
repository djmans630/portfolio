console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
  { url: '/portfolio/', title: 'Home' },
  { url: '/portfolio/projects', title: 'Projects' },
  { url: '/portfolio/contact', title: 'Contact' },
  { url: '/portfolio/resume/', title: 'Resume' },
  { url: "https://github.com/djmans630", title: 'Profile' }
];

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
    let a = document.createElement('a');
    a.href = p.url;
    a.textContent = p.title;
    nav.append(a);

    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add('current');
    }
    
    if (a.host !== location.host){
        a.target = "_blank";
    }
}

document.body.insertAdjacentHTML(
    'afterbegin',
    `
      <label class="color-scheme">
      Theme:
        <select>
            <option value='light dark'>Automatic</option>
            <option value='light'>Light</option>
            <option value='dark'>Dark</option>
        </select>
    </label>`
);

let select = document.querySelector('.color-scheme select');

if ("colorScheme" in localStorage) {
    document.documentElement.style.setProperty('color-scheme', localStorage.colorScheme);
    select.value = localStorage.colorScheme;
}

select.addEventListener('input', function (event) {
    console.log('color scheme changed to', event.target.value);
    document.documentElement.style.setProperty('color-scheme', event.target.value);
    localStorage.colorScheme = event.target.value;
});

export async function fetchJSON(url) {
  try {
      // Fetch the JSON file from the given URL
      const response = await fetch(url);
      console.log(response);
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } 
  catch (error) {
      console.error('Error fetching or parsing JSON data:', error);
  }
}

window.fetchJSON = fetchJSON;

export function renderProjects(project, containerElement, headingLevel = 'h2') {
  if (!(containerElement instanceof HTMLElement)) {
    console.error('Invalid container element provided.');
    return;
  }
  const validHeadings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    if (!validHeadings.includes(headingLevel)) {
        console.warn(`Invalid heading level "${headingLevel}". Defaulting to "h2".`);
        headingLevel = 'h2';
    }
  containerElement.innerHTML = '';
  project.forEach(proj => {
    const article = document.createElement('article');
    article.innerHTML = `
      <${headingLevel}>${proj.title}</${headingLevel}>
      <img src="${proj.image}" alt="${proj.title}">
      <p>${proj.description}</p>
    `;
    containerElement.appendChild(article);
  });
}