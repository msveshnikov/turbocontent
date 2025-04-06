# Documentation for `server/search.js`

## Overview

The `search.js` file, located in the `server` directory, is responsible for handling web search
functionalities within the application. It provides functions to:

- **Fetch search results** from Bing based on a user query.
- **Extract content** from web pages linked in the search results.
- **Process and limit** the extracted content to a manageable size.

This file is likely used by other server-side components (e.g., API endpoints in `index.js` or
`gemini.js`) to provide search-related features to the frontend application. It leverages libraries
like `cheerio` for HTML parsing and `node-fetch` (implicitly via global `fetch` in Node.js
environments) for making HTTP requests.

## Constants

### `MAX_SEARCH_RESULT_LENGTH`
