// =============================
// Configuration
// =============================

const CONTEXT_CHARS = 60; // Characters to show around search matches
const QUALITY_SCORE_THRESHOLD = 0.88; // Filter out results with worse scores (0 = perfect, 1 = worst)

const fuseOptions = {
  shouldSort: true,
  includeMatches: true,
  includeScore: true,
  threshold: 0.2,
  // Threshold controls fuzzy matching strictness:
  // - 0.0 = exact match only
  // - 0.2 = very strict (our setting - allows minor typos)
  // - 0.6 = default (more lenient)
  // - 1.0 = match anything
  ignoreLocation: true, // Don't care WHERE in the text the match appears
  minMatchCharLength: 4, // Require at least 4 consecutive characters
  keys: ["title", "contents", "tags", "categories"],
};

// =============================
// Utility Functions
// =============================

const show = (elem) => {
  elem.style.display = "block";
};

const hide = (elem) => {
  elem.style.display = "none";
};

const getUrlParam = (name) => {
  return decodeURIComponent(
    (location.search.split(`${name}=`)[1] || "").split("&")[0]
  ).replace(/\+/g, " ");
};

// =============================
// Search Execution
// =============================

const executeSearch = (searchQuery) => {
  const loadingIndicator = document.querySelector(".search-loading");
  const searchResults = document.getElementById("search-results");

  show(loadingIndicator);

  fetch("/index.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((pages) => {
      const fuse = new Fuse(pages, fuseOptions);
      const results = fuse.search(searchQuery);

      // Filter out low-quality matches
      // In Fuse.js: lower score = better match (0 = perfect, 1 = worst)
      const filteredResults = results.filter((result) => {
        return result.score <= QUALITY_SCORE_THRESHOLD;
      });

      if (filteredResults.length > 0) {
        populateResults(filteredResults, searchQuery);
      } else {
        searchResults.innerHTML =
          '<p class="search-results-empty">No matches found</p>';
      }

      hide(loadingIndicator);
    })
    .catch((error) => {
      console.error("Search error:", error);
      searchResults.innerHTML =
        '<p class="search-results-empty">An error occurred while searching. Please try again.</p>';
      hide(loadingIndicator);
    });
};

// =============================
// Results Population
// =============================

const populateResults = (results, searchQuery) => {
  const searchResults = document.getElementById("search-results");
  const templateDefinition = document.getElementById("search-result-template").innerHTML;

  // Deduplicate results by permalink (in case same page matches multiple fields)
  const uniqueResults = deduplicateByPermalink(results);

  // Build all HTML at once (avoiding DOM manipulation in loop)
  const allResultsHtml = uniqueResults
    .map((result, index) => createResultHtml(result, index, searchQuery, templateDefinition))
    .join('');

  // Update DOM once
  searchResults.innerHTML = allResultsHtml;

  // Apply mark.js highlighting to all results after DOM update
  uniqueResults.forEach((result, index) => {
    const resultElement = document.getElementById(`summary-${index}`);
    if (resultElement) {
      const marker = new Mark(resultElement);
      marker.mark(searchQuery);
    }
  });
};

const deduplicateByPermalink = (results) => {
  const seen = new Set();
  return results.filter((result) => {
    if (seen.has(result.item.permalink)) {
      return false;
    }
    seen.add(result.item.permalink);
    return true;
  });
};

const createResultHtml = (result, index, searchQuery, templateDefinition) => {
  const { title, contents, tags, categories, permalink } = result.item;

  const snippet = createSnippet(result, searchQuery, contents);
  const tagsHtml = createTagsHtml(tags);

  return render(templateDefinition, {
    key: index,
    title,
    link: permalink,
    tags: tagsHtml,
    categories,
    snippet,
  });
};

const createSnippet = (result, searchQuery, contents) => {
  const matchKey = getMatchKey(result);

  // If match is in title or tags, show beginning of content
  if (matchKey === "title" || matchKey === "tags") {
    return createDefaultSnippet(contents);
  }

  // For content matches, show context around the actual search term
  if (matchKey === "contents") {
    return createContextualSnippet(searchQuery, contents);
  }

  // Fallback
  return createDefaultSnippet(contents);
};

const getMatchKey = (result) => {
  if (!result.matches || result.matches.length === 0) {
    return null;
  }

  // Sort matches by priority: title > contents > tags > categories
  const keyPriority = { title: 0, contents: 1, tags: 2, categories: 3 };
  const sortedMatches = [...result.matches].sort((a, b) => {
    const aPriority = keyPriority[a.key] ?? 999;
    const bPriority = keyPriority[b.key] ?? 999;
    return aPriority - bPriority;
  });

  return sortedMatches[0].key;
};

const createDefaultSnippet = (contents) => {
  const length = CONTEXT_CHARS * 3;
  return contents.substring(0, length).trim() + "&hellip;";
};

const createContextualSnippet = (searchQuery, contents) => {
  // Find exact match (Fuse indices can be fuzzy, so we search manually)
  const searchLower = searchQuery.toLowerCase();
  const contentsLower = contents.toLowerCase();
  const matchIndex = contentsLower.indexOf(searchLower);

  if (matchIndex === -1) {
    return createDefaultSnippet(contents);
  }

  // Calculate context window around the match
  const contextBefore = CONTEXT_CHARS * 2;
  const contextAfter = CONTEXT_CHARS * 2;
  let contextStart = Math.max(0, matchIndex - contextBefore);
  let contextEnd = Math.min(
    contents.length,
    matchIndex + searchQuery.length + contextAfter
  );

  // Align to word boundaries for better readability
  contextStart = findWordBoundaryStart(contents, contextStart, matchIndex, contextBefore);
  contextEnd = findWordBoundaryEnd(contents, contextEnd, matchIndex, contextAfter);

  // Build snippet with ellipsis indicators
  const prefix = contextStart > 0 ? "&hellip;" : "";
  const suffix = contextEnd < contents.length ? "&hellip;" : "";
  const snippet = contents.substring(contextStart, contextEnd).trim();

  return prefix + snippet + suffix;
};

const findWordBoundaryStart = (text, start, matchIndex, maxDistance) => {
  if (start === 0) return 0;

  const wordStart = text.lastIndexOf(" ", start);
  if (wordStart > 0 && matchIndex - wordStart < maxDistance + 50) {
    return wordStart + 1;
  }
  return start;
};

const findWordBoundaryEnd = (text, end, matchIndex, maxDistance) => {
  if (end === text.length) return end;

  const wordEnd = text.indexOf(" ", end);
  if (wordEnd > 0 && wordEnd - matchIndex < maxDistance + 50) {
    return wordEnd;
  }
  return end;
};

const createTagsHtml = (tags) => {
  if (!tags || tags.length === 0) return "";

  return tags
    .map((tag) => `<a href='/tags/${tag}'>#${tag}</a>`)
    .join(" ");
};

// =============================
// Template Rendering
// =============================

/**
 * Simple template renderer that supports:
 * - Variable substitution: ${variable}
 * - Conditional blocks: ${ isset variable }...content...${ end }
 */
const render = (templateString, data) => {
  // Handle conditional blocks first: ${ isset key }content${ end }
  const conditionalPattern = /\$\{\s*isset ([a-zA-Z]*) \s*\}(.*)\$\{\s*end\s*}/g;
  let result = templateString;
  let match;

  // Use a copy since we're modifying during iteration
  const template = templateString;
  while ((match = conditionalPattern.exec(template)) !== null) {
    const [fullMatch, key, content] = match;
    // If data has this key and it's truthy, keep content; otherwise remove block
    const replacement = data[key] ? content : "";
    result = result.replace(fullMatch, replacement);
  }

  // Now do simple variable substitution: ${key}
  Object.keys(data).forEach((key) => {
    const pattern = new RegExp(`\\$\\{\\s*${key}\\s*\\}`, "g");
    result = result.replace(pattern, data[key]);
  });

  return result;
};

// =============================
// Search Initialization
// =============================

const initializeSearch = () => {
  const inputBox = document.getElementById("search-query");
  if (!inputBox) return;

  const searchQuery = getUrlParam("s");

  if (searchQuery) {
    inputBox.value = searchQuery;
    executeSearch(searchQuery);
  } else {
    document.getElementById("search-results").innerHTML =
      '<p class="search-results-empty">Please enter a word or phrase above, or see <a href="/tags/">all tags</a>.</p>';
  }
};

// Run on page load
initializeSearch();
