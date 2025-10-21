// Helpers
var show = function (elem) {
  elem.style.display = "block";
};
var hide = function (elem) {
  elem.style.display = "none";
};

var summaryInclude = 60;
var fuseOptions = {
  shouldSort: true,
  includeMatches: true,
  includeScore: true,
  threshold: 0.2,
  // Lower values = stricter matching (0.0 = exact match only)
  // Higher values = more fuzzy matching (1.0 = match anything)
  // 0.2 is quite strict - allows minor typos but not "vector" matching "version"
  ignoreLocation: true,
  minMatchCharLength: 4,
  // Require at least 4 consecutive characters to match
  keys: ["title", "contents", "tags", "categories"],
};

// =============================
// Search
// =============================

var inputBox = document.getElementById("search-query");
if (inputBox !== null) {
  var searchQuery = param("s");
  if (searchQuery) {
    inputBox.value = searchQuery || "";
    executeSearch(searchQuery, false);
  } else {
    document.getElementById("search-results").innerHTML =
      '<p class="search-results-empty">Please enter a word or phrase above, or see <a href="/tags/">all tags</a>.</p>';
  }
}

function executeSearch(searchQuery) {
  show(document.querySelector(".search-loading"));

  fetch("/index.json").then(function (response) {
    if (response.status !== 200) {
      console.log(
        "Looks like there was a problem. Status Code: " + response.status,
      );
      return;
    }
    // Examine the text in the response
    response
      .json()
      .then(function (pages) {
        var fuse = new Fuse(pages, fuseOptions);
        var result = fuse.search(searchQuery);

        // Filter out low-quality matches (higher score = worse match in Fuse.js)
        // Only keep results with score <= 0.88 to avoid false positives
        var qualityThreshold = 0.88;
        var filteredResults = result.filter(function(r) {
          return r.score <= qualityThreshold;
        });

        if (filteredResults.length > 0) {
          populateResults(filteredResults);
        } else {
          document.getElementById("search-results").innerHTML =
            '<p class=\"search-results-empty\">No matches found</p>';
        }
        hide(document.querySelector(".search-loading"));
      })
      .catch(function (err) {
        console.log("Fetch Error :-S", err);
      });
  });
}

function populateResults(results) {
  var searchQuery = document.getElementById("search-query").value;
  var searchResults = document.getElementById("search-results");

  // pull template from hugo template definition
  var templateDefinition = document.getElementById(
    "search-result-template",
  ).innerHTML;

  // Deduplicate results by permalink to show only one result per page
  var seenPermalinks = {};
  var uniqueResults = [];
  results.forEach(function (value) {
    if (!seenPermalinks[value.item.permalink]) {
      seenPermalinks[value.item.permalink] = true;
      uniqueResults.push(value);
    }
  });

  uniqueResults.forEach(function (value, key) {
    var contents = value.item.contents;
    var title = value.item.title;
    var snippet = "";
    var snippetHighlights = [];

    snippetHighlights.push(searchQuery);

    // Find the first match location using Fuse's match data
    var firstMatch = null;
    var matchKey = null;

    if (value.matches && value.matches.length > 0) {
      // Sort matches by key priority: title > contents > tags
      var keyPriority = { title: 0, contents: 1, tags: 2, categories: 3 };
      value.matches.sort(function(a, b) {
        var aPriority = keyPriority[a.key] !== undefined ? keyPriority[a.key] : 999;
        var bPriority = keyPriority[b.key] !== undefined ? keyPriority[b.key] : 999;
        return aPriority - bPriority;
      });

      firstMatch = value.matches[0];
      matchKey = firstMatch.key;
    }

    // Create context-aware snippet based on where the match was found
    if (matchKey === "title") {
      // Match in title - show beginning of content as context
      snippet = contents.substring(0, summaryInclude * 3).trim() + "&hellip;";
    } else if (matchKey === "contents") {
      // Match in contents - find actual occurrence of search term
      // (Fuse indices may be fuzzy matches, so we look for exact match)
      var searchLower = searchQuery.toLowerCase();
      var contentsLower = contents.toLowerCase();
      var actualMatchIndex = contentsLower.indexOf(searchLower);

      if (actualMatchIndex >= 0) {
        // Found exact match - show context around it
        var contextBefore = summaryInclude * 2;
        var contextAfter = summaryInclude * 2;
        var contextStart = Math.max(0, actualMatchIndex - contextBefore);
        var contextEnd = Math.min(contents.length, actualMatchIndex + searchQuery.length + contextAfter);

        // Try to start at word boundary if not at the beginning
        if (contextStart > 0) {
          var wordStart = contents.lastIndexOf(' ', contextStart);
          if (wordStart > 0 && actualMatchIndex - wordStart < contextBefore + 50) {
            contextStart = wordStart + 1;
          }
        }

        // Try to end at word boundary if not at the end
        if (contextEnd < contents.length) {
          var wordEnd = contents.indexOf(' ', contextEnd);
          if (wordEnd > 0 && wordEnd - actualMatchIndex < contextAfter + 50) {
            contextEnd = wordEnd;
          }
        }

        snippet = (contextStart > 0 ? "&hellip;" : "") +
                  contents.substring(contextStart, contextEnd).trim() +
                  (contextEnd < contents.length ? "&hellip;" : "");
      } else {
        // No exact match found - show beginning of content
        snippet = contents.substring(0, summaryInclude * 3).trim() + "&hellip;";
      }
    } else if (matchKey === "tags") {
      // Match in tags - show beginning of content
      snippet = contents.substring(0, summaryInclude * 3).trim() + "&hellip;";
    } else {
      // Fallback to beginning of content
      snippet = contents.substring(0, summaryInclude * 3).trim() + "&hellip;";
    }

    //replace values
    var tags = "";
    if (value.item.tags) {
      value.item.tags.forEach(function (element) {
        tags =
          tags + "<a href='/tags/" + element + "'>" + "#" + element + "</a> ";
      });
    }

    var output = render(templateDefinition, {
      key: key,
      title: title,
      link: value.item.permalink,
      tags: tags,
      categories: value.item.categories,
      snippet: snippet,
    });
    searchResults.innerHTML += output;

    // Apply mark.js highlighting to the entire result div
    snippetHighlights.forEach(function (snipvalue, snipkey) {
      var instance = new Mark(document.getElementById("summary-" + key));
      instance.mark(snipvalue);
    });
  });
}

function param(name) {
  return decodeURIComponent(
    (location.search.split(name + "=")[1] || "").split("&")[0],
  ).replace(/\+/g, " ");
}

function render(templateString, data) {
  var conditionalMatches, conditionalPattern, copy;
  conditionalPattern = /\$\{\s*isset ([a-zA-Z]*) \s*\}(.*)\$\{\s*end\s*}/g;
  //since loop below depends on re.lastInxdex, we use a copy to capture any manipulations whilst inside the loop
  copy = templateString;
  while (
    (conditionalMatches = conditionalPattern.exec(templateString)) !== null
  ) {
    if (data[conditionalMatches[1]]) {
      //valid key, remove conditionals, leave contents.
      copy = copy.replace(conditionalMatches[0], conditionalMatches[2]);
    } else {
      //not valid, remove entire section
      copy = copy.replace(conditionalMatches[0], "");
    }
  }
  templateString = copy;
  //now any conditionals removed we can do simple substitution
  var key, find, re;
  for (key in data) {
    find = "\\$\\{\\s*" + key + "\\s*\\}";
    re = new RegExp(find, "g");
    templateString = templateString.replace(re, data[key]);
  }
  return templateString;
}
