# Documentation for `src\Content.jsx`

## Overview

The `Content.jsx` file defines the `Content` React component, which is a core feature of the
application. This component provides a user interface for generating social media content based on
user-defined criteria such as topic, goal, platform, and tone. It leverages Chakra UI for styling
and communicates with a backend API (defined by `API_URL` in `src\App.jsx`) to generate the content.
The component handles user input, sends requests to the API, displays loading states, handles
errors, and presents the generated content options to the user.

**Project Role:**

Within the project structure, `Content.jsx` resides in the `src` directory, indicating it's a
frontend component. It's likely a central part of the user interface for content generation. It
interacts with the backend API defined in the `server` directory, specifically the
`/api/generate-content` endpoint, to fulfill its content generation functionality.

## Component: `Content`

### Description

The `Content` component is a functional React component responsible for:

1.  **User Input:** Providing form fields for users to specify:
    - **Topic:** The subject of the social media content.
    - **Goal:** The objective of the content (e.g., engagement, promotion).
    - **Platform:** The social media platform for which the content is intended.
    - **Tone:** The desired style or attitude of the content (e.g., witty, informative).
2.  **API Interaction:** Sending a POST request to the `/api/generate-content` endpoint with the
    user-provided input as JSON data.
3.  **Loading State:** Displaying a loading spinner while waiting for the API response.
4.  **Error Handling:** Displaying error messages to the user if the API request fails or returns an
    unexpected response.
5.  **Content Display:** Presenting the generated content options in a grid format, including:
    - Generated text content.
    - Placeholder images (using `via.placeholder.com`).
    - Optional hashtags and alt text (if provided in the API response).

### Functionality and State

The component utilizes React's `useState` hook to manage its internal state:

- **`topic` (string):** Stores the user-inputted topic for content generation. Initialized as an
  empty string (`''`).
- **`goal` (string):** Stores the selected goal for the content. Initialized as an empty string
  (`''`).
- **`platform` (string):** Stores the selected platform for the content. Initialized as an empty
  string (`''`).
- **`tone` (string):** Stores the selected tone for the content. Initialized as an empty string
  (`''`).
- **`generatedContent` (array):** Stores an array of generated content objects received from the
  API. Initialized as an empty array (`[]`). Each object in the array is expected to have properties
  like `text`, `image`, and optionally `hashtags`, `altText`.
- **`loading` (boolean):** Indicates whether the component is currently waiting for an API response.
  Used to display a loading spinner and disable the submit button. Initialized as `false`.
- **`error` (string):** Stores any error message to be displayed to the user. Initialized as an
  empty string (`''`).

### `handleGenerateContent` Function

This asynchronous function is triggered when the "Generate Content" button is clicked. It is
responsible for:

1.  **Initialization:**

    - Sets `loading` to `true` to indicate that content generation is in progress.
    - Clears any previous `error` messages by setting `error` to `''`.
    - Clears any previously `generatedContent` by setting `generatedContent` to `[]`.

2.  **API Request:**

    - Uses `fetch` to send a POST request to the `/api/generate-content` endpoint (constructed using
      `API_URL`).
    - The request body is a JSON string containing the current values of `topic`, `goal`,
      `platform`, and `tone` from the component's state.
    - Sets the `Content-Type` header to `application/json`.

3.  **Response Handling:**

    - **Error Handling (HTTP Status):** Checks if the `response.ok` property is true. If not, it
      means the HTTP request failed.
        - Sets an `error` message based on the `response.statusText`.
        - Throws a new `Error` object to be caught in the `catch` block.
    - **Successful Response:** If `response.ok` is true, it parses the response body as JSON using
      `response.json()`.
    - **Data Processing:**
        - **Array Response:** Checks if the parsed `data` is an array. If so, it maps over the array
          to:
            - Create a new array of content objects.
            - For each item, it adds a `image` property with a placeholder image URL from
              `via.placeholder.com`, dynamically creating different placeholder images for each
              option.
            - Updates the `generatedContent` state with this processed array.
        - **Non-Array Response (Error Case):** If `data` is not an array, it assumes an unexpected
          response format from the API.
            - Sets `generatedContent` to an array containing a single error object with a generic
              error message, a placeholder image, and error hashtags.
            - Sets an `error` message indicating an unexpected API response format.

4.  **Error Handling (Catch Block):**

    - Catches any errors that occurred during the API request or response processing (including the
      `Error` thrown when `response.ok` is false).
    - Logs the error to the console using `console.error`.
    - If the `error` object is falsy (which should generally not happen in the intended error
      handling flow, but acts as a safety net), sets a generic error message.

5.  **Finally Block:**
    - Sets `loading` to `false` regardless of whether the API request was successful or failed,
      ensuring the loading state is turned off.

### Parameters

The `Content` component itself does not accept any props (parameters) from its parent component.

### Return Value

The `Content` component returns JSX that defines the UI structure:

- A `Box` component from Chakra UI serving as the main container, providing padding, shadow, border,
  and background styling.
- A `Heading` for the component title "Generate Social Media Content".
- An `Alert` component to display error messages if `error` state is not empty.
- A `VStack` to vertically stack the form elements.
    - `FormControl` and associated `FormLabel`, `Input`, and `Select` components for each input
      field (Topic, Goal, Platform, Tone). These are controlled components, bound to the component's
      state.
    - A `Button` to trigger the `handleGenerateContent` function. It includes `isLoading` and
      `loadingText` props to visually indicate loading state and a `Spinner` component during
      loading.
- A conditional rendering section that displays the generated content if `generatedContent` array
  has items:
    - A `Box` container for the generated content section.
    - A `Heading` for "Generated Content Options".
    - A `Grid` to layout the generated content options in a responsive grid.
        - `GridItem` components are mapped from the `generatedContent` array. Each `GridItem`
          displays:
            - An `Image` component to show the placeholder image, with a fallback image in case of
              loading issues.
            - `Text` components to display "Option" number, the generated `text`, and optionally
              `hashtags` and `altText`.

### Usage Example

To use the `Content` component, you would typically include it within another React component,
likely in `App.jsx` or another page component within the application.
