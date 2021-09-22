import {
  createEl,
  loadScript,
  getHelixEnv,
  fetchBlogArticleIndex,
  createOptimizedPicture,
} from '../../scripts/scripts.js';

const BRAND_IMG = '<img loading="lazy" alt="Adobe" src="/blocks/gnav/adobe-logo.svg">';
const SEARCH_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" focusable="false">
<path d="M14 2A8 8 0 0 0 7.4 14.5L2.4 19.4a1.5 1.5 0 0 0 2.1 2.1L9.5 16.6A8 8 0 1 0 14 2Zm0 14.1A6.1 6.1 0 1 1 20.1 10 6.1 6.1 0 0 1 14 16.1Z"></path>
</svg>`;
const IS_OPEN = 'is-Open';

function closeMenu() {
  const openItem = document.querySelector(`.gnav .${IS_OPEN}`);
  if (openItem) {
    openItem.classList.remove(IS_OPEN);
    document.removeEventListener('click', closeMenu);
  }
}

function scrollClose() {
  let scrolled;
  if (!scrolled) {
    scrolled = true;
    closeMenu();
    document.removeEventListener('scroll', scrollClose);
  }
}

function toggleMenu(e, el) {
  e.stopPropagation();
  if (el.classList.contains(IS_OPEN)) {
    el.classList.remove(IS_OPEN);
    document.removeEventListener('click', closeMenu);
    document.removeEventListener('scroll', scrollClose);
  } else {
    closeMenu();
    el.classList.add(IS_OPEN);
    document.addEventListener('click', closeMenu);
    if (!el.classList.contains('gnav-search')) {
      document.addEventListener('scroll', scrollClose, { passive: true });
    }
  }
}

function decorateEmail(email) {
  const MAX_CHAR = 12;
  const emailParts = email.split('@');
  const username = emailParts[0].length <= MAX_CHAR ? emailParts[0] : `${emailParts[0].slice(0, MAX_CHAR)}…`;
  const domainArr = emailParts[1].split('.');
  const tld = domainArr.pop();
  let domain = domainArr.join('.');
  domain = domain.length <= MAX_CHAR ? domain : `${domain.slice(0, MAX_CHAR)}…`;
  return `${username}@${domain}.${tld}`;
}

async function decorateProfileMenu(blockEl, profileEl, imsProfile, ioProfile) {
  const { displayName, email } = imsProfile;
  const displayEmail = decorateEmail(email);
  const { user, sections } = ioProfile;
  const { avatar } = user;
  const avatarImg = createEl({ tag: 'img', className: 'gnav-profile-img', attributes: { src: avatar } });
  const accountLink = blockEl.querySelector('div > div > p:nth-child(2) a');

  const profileButton = createEl({
    tag: 'button',
    className: 'gnav-profile-button',
    html: avatarImg,
    attributes: { 'arial-label': displayName },
  });
  profileButton.addEventListener('click', (e) => {
    toggleMenu(e, profileEl);
  });

  const profileMenu = createEl({ tag: 'div', className: 'gnav-profile-menu' });
  const profileHeader = createEl({ tag: 'a', className: 'gnav-profile-header' });
  const profileDetails = createEl({ tag: 'div', className: 'gnav-profile-details' });
  const profileActions = createEl({ tag: 'ul', className: 'gnav-profile-actions' });

  profileHeader.href = accountLink.href;
  profileHeader.setAttribute('aria-label', accountLink.textContent);

  const profileImg = avatarImg.cloneNode(true);
  const profileName = createEl({ tag: 'p', className: 'gnav-profile-name', html: displayName });
  const profileEmail = createEl({ tag: 'p', className: 'gnav-profile-email', html: displayEmail });
  const accountText = blockEl.querySelector('div > div > p:nth-child(2) a').innerHTML;
  const profileViewAccount = createEl({ tag: 'p', className: 'gnav-profile-account', html: accountText });
  profileDetails.append(profileName, profileEmail, profileViewAccount);

  if (sections.manage.items.team?.id) {
    const teamLink = blockEl.querySelector('div > div > p:nth-child(3) a');
    const manageTeam = createEl({ tag: 'li', html: teamLink, className: 'gnav-profile-action' });
    profileActions.append(manageTeam);
  }

  if (sections.manage.items.enterprise?.id) {
    const manageLink = blockEl.querySelector('div > div > p:nth-child(4) a');
    const manageEnt = createEl({ tag: 'li', html: manageLink, className: 'gnav-profile-action' });
    profileActions.append(manageEnt);
  }

  const signOutLink = blockEl.querySelector('div > div > p:nth-child(5) a');
  signOutLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.adobeIMS.signOut();
  });
  const signOut = createEl({ tag: 'li', html: signOutLink, className: 'gnav-profile-action' });
  profileActions.append(signOut);

  profileHeader.append(profileImg, profileDetails);
  profileMenu.append(profileHeader, profileActions);
  profileEl.append(profileButton, profileMenu);
}

function decorateSignIn(blockEl, profileEl) {
  const signIn = blockEl.querySelector('a');
  signIn.classList.add('gnav-signin');
  profileEl.append(signIn);
  profileEl.addEventListener('click', (e) => {
    e.preventDefault();
    window.adobeIMS.signIn();
  });
}

async function imsReady(blockEl, profileEl) {
  const accessToken = window.adobeIMS.getAccessToken();
  if (accessToken) {
    const ioResp = await fetch('https://cc-collab-stage.adobe.io/profile', {
      headers: new Headers({ Authorization: `Bearer ${accessToken.token}` }),
    });
    if (ioResp.status === 200) {
      const imsProfile = await window.adobeIMS.getProfile();
      const ioProfile = await ioResp.json();
      decorateProfileMenu(blockEl, profileEl, imsProfile, ioProfile);
    } else {
      decorateSignIn(blockEl, profileEl);
    }
  } else {
    decorateSignIn(blockEl, profileEl);
  }
}

function decorateProfile(blockEl) {
  const profileEl = createEl({ tag: 'div', className: 'gnav-profile' });
  const env = getHelixEnv().name === 'prod' ? 'prod' : 'stg1';
  const envSuffix = env === 'prod' ? '' : '-stg1';

  window.adobeid = {
    client_id: 'bizweb',
    scope: 'AdobeID,openid,gnav',
    locale: 'en_US',
    environment: env,
    useLocalStorage: false,
    onReady: () => { imsReady(blockEl, profileEl); },
  };
  loadScript(`https://auth${envSuffix}.services.adobe.com/imslib/imslib.min.js`);

  return profileEl;
}

function decorateCard(hit) {
  const {
    title, description, image, category,
  } = hit;
  const path = hit.path.split('.')[0];
  const picture = createOptimizedPicture(image, title, false, [{ width: '750' }]);
  const pictureTag = picture.outerHTML;
  const html = `<div class="article-card-image">${pictureTag}</div>
    <div class="article-card-body">
      <p class="article-card-category">${category}</p>
      <h3>${title}</h3>
      <p>${description}</p>
    </div>`;
  return createEl({
    tag: 'a', className: 'article-card', html, attributes: { href: path },
  });
}

function highlightTextElements(terms, elements) {
  elements.forEach((e) => {
    const matches = [];
    const txt = e.textContent;
    terms.forEach((term) => {
      const offset = txt.toLowerCase().indexOf(term);
      if (offset >= 0) {
        matches.push({ offset, term });
      }
    });
    matches.sort((a, b) => a.offset - b.offset);
    let markedUp = '';
    if (!matches.length) markedUp = txt;
    else {
      markedUp = txt.substr(0, matches[0].offset);
      matches.forEach((hit, i) => {
        markedUp += `<mark class="gnav-search-highlight">${txt.substr(hit.offset, hit.term.length)}</mark>`;
        if (matches.length - 1 === i) {
          markedUp += txt.substr(hit.offset + hit.term.length);
        } else {
          markedUp += txt.substring(hit.offset + hit.term.length, matches[i + 1].offset);
        }
      });
      e.innerHTML = markedUp;
    }
  });
}

async function populateSearchResults(searchTerms, searchResultsEl) {
  const limit = 12;
  const terms = searchTerms.toLowerCase().split(' ').map((e) => e.trim()).filter((e) => !!e);
  searchResultsEl.innerHTML = '';

  if (terms.length) {
    if (!window.blogIndex) {
      window.blogIndex = await fetchBlogArticleIndex();
    }

    const articles = window.blogIndex.data;

    const hits = [];
    let i = 0;
    for (; i < articles.length; i += 1) {
      const e = articles[i];
      const text = [e.category, e.title, e.teaser].join(' ').toLowerCase();

      if (terms.every((term) => text.includes(term))) {
        if (hits.length === limit) {
          break;
        }
        hits.push(e);
      }
    }

    hits.forEach((hit) => {
      const card = decorateCard(hit);
      searchResultsEl.appendChild(card);
    });

    if (!hits.length) {
      searchResultsEl.classList.add('no-Results');
    } else {
      searchResultsEl.classList.remove('no-Results');
    }

    highlightTextElements(terms, searchResultsEl.querySelectorAll('h3, .article-card-category, .article-card-body > p'));
  }
}

function onSearchInput(value, searchResults, advancedLink) {
  populateSearchResults(value, searchResults);
  if (advancedLink) {
    const href = new URL(advancedLink.href);
    href.searchParams.set('q', value);
    advancedLink.href = href.toString();
  }
}

function decorateSearchBar(label, advancedLink) {
  const searchBar = createEl({ tag: 'aside', className: 'gnav-search-bar' });
  const searchField = createEl({ tag: 'div', className: 'gnav-search-field', html: SEARCH_ICON });
  const searchInput = createEl({ tag: 'input', className: 'gnav-search-input', attributes: { placeholder: label } });
  const searchResults = createEl({ tag: 'div', className: 'gnav-search-results' });

  searchInput.addEventListener('input', (e) => {
    onSearchInput(e.target.value, searchResults, advancedLink);
  });

  searchField.append(searchInput, advancedLink);
  searchBar.append(searchField, searchResults);
  return searchBar;
}

function decorateSearch(el) {
  const label = el.querySelector('p').textContent;
  const advancedLink = el.querySelector('a');

  const searchEl = createEl({ tag: 'div', className: 'gnav-search' });
  const searchBar = decorateSearchBar(label, advancedLink);
  const searchButton = createEl({
    tag: 'button', className: 'gnav-search-button', html: SEARCH_ICON, attributes: { 'aria-label': label },
  });

  searchButton.addEventListener('click', (e) => {
    toggleMenu(e, searchEl);
  });
  searchEl.append(searchButton);
  searchEl.append(searchBar);

  return searchEl;
}

function decorateMenu(navItem, navLink, menu) {
  menu.className = 'gnav-navitem-menu';
  navLink.addEventListener('click', (e) => {
    e.preventDefault();
    toggleMenu(e, navItem);
  });
  return menu;
}

function buildMainNav(navLinks) {
  const mainNav = createEl({ tag: 'div', className: 'gnav-mainnav' });
  navLinks.forEach((navLink, idx) => {
    const navItem = createEl({ tag: 'div', className: 'gnav-navitem' });

    // Reuse the parent for the menu candidate
    const menu = navLink.closest('div');
    menu.querySelector('h2').remove();
    navItem.appendChild(navLink);

    if (menu.childElementCount > 0) {
      const id = `navmenu-${idx}`;
      menu.id = id;
      navItem.classList.add('has-Menu');
      navLink.setAttribute('role', 'button');
      navLink.setAttribute('aria-expanded', false);
      navLink.setAttribute('aria-controls', id);

      const decoratedMenu = decorateMenu(navItem, navLink, menu);
      navItem.appendChild(decoratedMenu);
    }
    mainNav.appendChild(navItem);
  });
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
  const navEl = createEl({ tag: 'nav', className: 'gnav' });

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
  const profileEl = gnavDoc.body.querySelector('.profile');
  if (profileEl) {
    const decoratedProfile = decorateProfile(profileEl);
    navEl.append(decoratedProfile);
  }

  return navEl;
}

async function fetchGnav(url) {
  const resp = await fetch(`${url}.plain.html`);
  const html = await resp.text();
  return html;
}

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
