const BRAND_IMG = '<img loading="lazy" alt="Adobe" src="/blocks/gnav/adobe-logo.svg">';
const SEARCH_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" focusable="false">
<path d="M14 2A8 8 0 0 0 7.4 14.5L2.4 19.4a1.5 1.5 0 0 0 2.1 2.1L9.5 16.6A8 8 0 1 0 14 2Zm0 14.1A6.1 6.1 0 1 1 20.1 10 6.1 6.1 0 0 1 14 16.1Z"></path>
</svg>`;
const IS_OPEN = 'is-Open';

function closeDropdown() {
  const mainNav = document.querySelector('.gnav-mainnav');
  const openItem = mainNav.querySelector(`.${IS_OPEN}`);
  if (openItem) {
    openItem.classList.remove(IS_OPEN);
    document.removeEventListener('click', closeDropdown);
  }
}

function scrollClose() {
  let timer;
  let scrolled;
  
  function debounce(method, delay) {
    clearTimeout(timer);
    if (!scrolled) {
      method();
      scrolled = true;
    }
    timer = setTimeout(() => {
        scrolled = false;
    }, delay);
  }

  document.addEventListener('scroll', () => {
    debounce(closeDropdown, 500);
  }, { passive: true });
}

function decorateProfile(el) {
  return el;
}

function decorateSearch(el) {
  const searchEl = document.createElement('div');
  searchEl.classList.add('gnav-search');

  // Setup the search button
  const searchButton = document.createElement('button');
  searchButton.classList.add('gnav-search');
  searchButton.ariaLabel = el.querySelector('a').textContent;

  searchButton.insertAdjacentHTML('afterbegin', SEARCH_ICON);
  return searchButton;
}

function decorateDropdown(navLinks, wrapper, dropdown, navLink, currentIdx) {
  wrapper.classList.add('has-Dropdown');
  dropdown.classList.add('gnav-navitem-dropdown');
  navLink.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    navLinks.forEach((item, idx) => {
      if (idx !== currentIdx) {
        item.parentElement.classList.remove(IS_OPEN);
      }
    });
    wrapper.classList.toggle(IS_OPEN);
    if (wrapper.classList.contains(IS_OPEN)) {
      document.addEventListener('click', closeDropdown);
    }
  });
  return dropdown;
}

function buildMainNav(navLinks) {
  const mainNav = document.createElement('div');
  mainNav.classList.add('gnav-mainnav');
  navLinks.forEach((navLink, idx) => {
    // Setup the nav item
    const navItem = document.createElement('div');
    navItem.classList.add('gnav-navitem');
  
    // Reuse the parent for the dropdown
    const dropdown = navLink.closest('div');
    dropdown.querySelector('h2').remove();

    // Append the link
    navItem.appendChild(navLink);
  
    // Append any dropdown content
    if (dropdown.childElementCount > 0) {
      // Accessibility
      navLink.setAttribute('role', 'button');
      navLink.setAttribute('aria-haspopup', true);
      navLink.setAttribute('aria-expanded', false);

      const decoratedDropdown = decorateDropdown(navLinks, navItem, dropdown, navLink, idx);
      navItem.appendChild(decoratedDropdown);
    }
    mainNav.appendChild(navItem);
  });
  scrollClose(mainNav);
  return mainNav;
}

function decorateLogo(el) {
  el.classList.add('gnav-logo');
  el.insertAdjacentHTML('afterbegin', BRAND_IMG);
  return el;
}

function decorateGNav(html) {
  // Parse the html
  const parser = new DOMParser();
  const gnavDoc = parser.parseFromString(html, 'text/html');
  
  // Build the nav
  const navEl = document.createElement('nav');
  navEl.classList.add('gnav');

  // The first link is the logo
  const logoEl = gnavDoc.body.querySelector('a');
  const decoratedLogo = decorateLogo(logoEl);
  navEl.append(decoratedLogo);

  // Use H2 as the marker to find the main nav
  const mainLinks = gnavDoc.body.querySelectorAll('h2 > a');
  const mainNav = buildMainNav(mainLinks);
  navEl.append(mainNav);

  // Add search if it exists
  const searchEl = gnavDoc.body.querySelector('.search');
  if (searchEl) {
      const decoratedSearch = decorateSearch(searchEl);
      navEl.append(decoratedSearch);
  }

  // Add profile if it exists
  // const profileEl = gnavDoc.body.querySelector('.profile');
  // if (profileEl) {
  //     const decoratedProfile = decorateProfile(profileEl);
  //     navEl.append(decoratedProfile);
  // }

  return navEl;
};

async function fetchGnav(url) {
  const resp = await fetch(`${url}.plain.html`);
  return await resp.text();
};

export default async function init(blockEl) {
  const url = blockEl.getAttribute('data-gnav-source');
  if (url) {
    const html = await fetchGnav(url);
    if (html) {
      const decoratedGnav = decorateGNav(html);
      blockEl.append(decoratedGnav);
    }
  }
}