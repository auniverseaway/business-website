import { fetchBlogArticleIndex, createOptimizedPicture } from '../../scripts/scripts.js';

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
        markedUp += `<span class="gnav-search-highlight">${txt.substr(hit.offset, hit.term.length)}</span>`;
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

export default async function populateSearchResults(searchTerms, searchResultsEl) {
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

    hits.forEach((e) => {
      const {
        title, description, image, category,
      } = e;
      const path = e.path.split('.')[0];

      const picture = createOptimizedPicture(image, title, false, [{ width: '750' }]);
      const pictureTag = picture.outerHTML;
      const card = document.createElement('a');
      card.className = 'article-card';
      card.href = path;
      card.innerHTML = `<div class="article-card-image">${pictureTag}</div>
        <div class="article-card-body">
          <p class="article-card-category">${category}</p>
          <h3>${title}</h3>
          <p>${description}</p>
        </div>`;
      searchResultsEl.appendChild(card);
    });

    highlightTextElements(terms, searchResultsEl.querySelectorAll('h3, .article-card-category, .article-card-body > p '));
  }
}
