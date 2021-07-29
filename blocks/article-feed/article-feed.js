/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* global */
/* eslint-disable import/named, import/extensions */

import {
  readBlockConfig,
  getOptimizedImageURL,
  fetchBlogArticleIndex,
} from '../../scripts/scripts.js';

function isCardOnPage(article) {
  const path = article.path.split('.')[0];
  /* using recommended and featured articles */
  return !!document.querySelector(`.featured-article a.featured-article-card[href="${path}"], .recommended-articles a.article-card[href="${path}"]`);
}

async function filterArticles(config, locale) {
  if (!window.blogIndex) {
    window.blogIndex = await fetchBlogArticleIndex(locale);
  }
  const index = window.blogIndex;

  const result = [];

  /* filter posts by category, tag and author */
  const filters = {};
  Object.keys(config).forEach((key) => {
    const filterNames = ['tag', 'author', 'category'];
    if (filterNames.includes(key)) {
      const vals = config[key];
      let v = vals;
      if (!Array.isArray(vals)) {
        v = [vals];
      }
      // eslint-disable-next-line no-console
      console.log(v);
      filters[key] = v.map((e) => e.toLowerCase().trim());
    }
  });

  /* filter and ignore if already in result */
  const feed = index.data.filter((article) => {
    const matchedAll = Object.keys(filters).every((key) => {
      const matchedFilter = filters[key].some((val) => (article[key]
        && article[key].toLowerCase().includes(val)));
      return matchedFilter;
    });
    return (matchedAll && !result.includes(article) && !isCardOnPage(article));
  });
  return (feed);
}

async function decorateArticleFeed(articleFeedEl, config, offset = 0) {
  const articles = await filterArticles(config);

  let articleCards = articleFeedEl.querySelector('.article-cards');
  if (!articleCards) {
    articleCards = document.createElement('div');
    articleCards.className = 'article-cards';
    articleFeedEl.appendChild(articleCards);
  }
  const limit = 12;
  const pageEnd = offset + limit;
  const max = pageEnd > articles.length ? articles.length : pageEnd;
  for (let i = offset; i < max; i += 1) {
    const article = articles[i];
    const {
      title, description, image, category,
    } = article;

    const path = article.path.split('.')[0];

    const imagePath = image.split('?')[0].split('_')[1];
    const imageSrc = getOptimizedImageURL(`./media_${imagePath}?format=webply&optimize=medium&width=750`);
    const pictureTag = `<picture><img src="${imageSrc}"></picture>`;
    const card = document.createElement('a');
    card.className = 'article-card';
    card.href = path;
    card.innerHTML = `<div class="article-card-image">
          ${pictureTag}
        </div>
        <div class="article-card-body">
        <p class="article-card-category">${category}</p>
        <h3>${title}</h3>
          <p>${description}</p>
        </div>`;
    articleCards.append(card);
  }
  if (articles.length > pageEnd) {
    const loadMore = document.createElement('a');
    loadMore.className = 'load-more button secondary';
    loadMore.href = '#';
    loadMore.innerHTML = 'Load more articles';
    articleFeedEl.append(loadMore);
    loadMore.addEventListener('click', (event) => {
      event.preventDefault();
      loadMore.remove();
      decorateArticleFeed(articleFeedEl, config, pageEnd);
    });
  }
}

export default function decorate(block) {
  const config = readBlockConfig(block);
  block.innerHTML = '';
  decorateArticleFeed(block, config);
}