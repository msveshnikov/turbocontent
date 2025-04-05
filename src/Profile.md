    useEffect(() => { ... }, [user, setUser]);
    ```
    - **Purpose:** Fetches the user's profile data from the backend API (`/api/profile`) when the component mounts or if the `user` context is initially `null` (e.g., on page refresh).
    - **Dependencies:** `user`, `setUser`.
    - **Logic:**
        - Checks if `user` is `null`. If so, sets `isLoading` to `true` and makes a `GET` request to `/api/profile` with an authorization token from `localStorage`.
        - If the response is successful (status `200 OK`), it parses the JSON response and updates the `user` context using `setUser`.
        - If there's an error during fetching or the response is not ok, it logs an error to the console.
        - Finally, sets `isLoading` to `false`.

2.  **Fetch Generated Content**:

    ```javascript
    useEffect(() => { ... }, [toast, user]);
    ```

    - **Purpose:** Fetches the user's generated content history from the backend API
      (`/api/profile/content`).
    - **Dependencies:** `toast`, `user`.
    - **Logic:**
        - Sets `contentLoading` to `true`.
        - Makes a `GET` request to `/api/profile/content` with an authorization token.
        - If the response is successful, parses the JSON data, sorts it by `createdAt` in descending
          order (newest first), and sets both `contentList` and `filteredContentList` with the
          fetched data.
        - If the response is not successful or an error occurs, displays an error toast using
          `useToast`.
        - Finally, sets `contentLoading` to `false`.
        - This effect only runs if `user` is truthy, ensuring a token is available for
          authorization.

3.  **Filter Content Based on Search Query**:
    ```javascript
    useEffect(() => { ... }, [searchQuery, contentList]);
    ```
    - **Purpose:** Filters the `contentList` based on the `searchQuery`.
    - **Dependencies:** `searchQuery`, `contentList`.
    - **Logic:**
        - Converts the `searchQuery` to lowercase.
        - Filters `contentList` to include content items where:
            - `topic`, `platform`, `goal`, or `tone` includes the `searchQuery` (case-insensitive).
            - Or, any item in `contentOptions` array has `text` that includes the `searchQuery`
              (case-insensitive).
        - Updates `filteredContentList` with the filtered results.

### Functions

1.  **`handleBasicChange(field, value)`**:

    ```javascript
    const handleBasicChange = (field, value) => { ... };
    ```

    - **Purpose:** Updates a specific field in the `user` state.
    - **Parameters:**
        - `field`: String, the name of the user profile field to update (e.g., 'firstName',
          'lastName').
        - `value`: Any, the new value for the specified field.
    - **Return Value:** None.
    - **Logic:** Uses the `setUser` function to update the `user` state, merging the new field and
      value with the existing user data.

2.  **`handleSubmit(e)`**:

    ```javascript
    const handleSubmit = async (e) => { ... };
    ```

    - **Purpose:** Handles the submission of the profile update form.
    - **Parameters:**
        - `e`: Event object (form submit event).
    - **Return Value:** None.
    - **Logic:**
        - Prevents default form submission behavior.
        - Sets `isLoading` to `true`.
        - Makes a `PUT` request to `/api/profile` with the updated `firstName` and `lastName` (and
          potentially other fields in the future) in the request body, along with an authorization
          token.
        - If the response is successful, parses the JSON response (which should be the updated user
          data), updates the `user` context using `setUser`, and displays a success toast.
        - If the response is not successful or an error occurs, displays an error toast with the
          error message from the server or a generic error message.
        - Finally, sets `isLoading` to `false`.

3.  **`handleDeleteContent(contentId)`**:

    ```javascript
    const handleDeleteContent = async (contentId) => { ... };
    ```

    - **Purpose:** Handles the deletion of a generated content item.
    - **Parameters:**
        - `contentId`: String, the `_id` of the content item to delete.
    - **Return Value:** None.
    - **Logic:**
        - Shows a confirmation dialog to the user before proceeding with deletion.
        - If the user confirms:
            - Optimistically updates the UI by removing the content item from `contentList`
              immediately.
            - Makes a `DELETE` request to `/api/profile/content/${contentId}` with an authorization
              token.
            - If the response is successful, displays a success toast.
            - If the response is not successful or an error occurs:
                - Reverts the UI update by restoring the original `contentList`.
                - Displays an error toast with the error message from the server or a generic error
                  message.

4.  **`toggleContentExpansion(contentId)`**:
    ```javascript
    const toggleContentExpansion = (contentId) => { ... };
    ```
    - **Purpose:** Toggles the expansion state of a content item's details in the UI.
    - **Parameters:**
        - `contentId`: String, the `_id` of the content item to toggle expansion for.
    - **Return Value:** None.
    - **Logic:** Updates the `expandedContentId` state. If the clicked `contentId` is already
      expanded (`expandedContentId === contentId`), it collapses it by setting `expandedContentId`
      to `null`. Otherwise, it expands the clicked content item by setting `expandedContentId` to
      the given `contentId`.

### Rendering Logic

The `Profile` component renders the following sections:

1.  **Loading State:** If `!user && isLoading` is true, it renders a centered `Spinner` indicating
    that the profile is loading.
2.  **Not Logged In State:** If `!user && !isLoading` is true, it renders a message indicating that
    the user needs to log in to view their profile. In a real application, this might redirect to a
    login page.
3.  **Profile Page (Main Content):** If `user` is truthy, it renders the main profile content within
    a `Container` and `VStack`:
    - **Profile Information Card:** Displays user's basic information and subscription status in a
      `Card`.
        - **Subscription Section:** Shows the user's subscription status (Premium/Free) with a badge
          and a link to upgrade or manage subscription. The links are currently commented out and
          would need to be configured with actual Stripe URLs in environment variables
          (`VITE_STRIPE_PREMIUM_LINK`, `VITE_STRIPE_PORTAL_LINK`).
        - **Basic Information Form:** A form to update the user's first and last name. The email is
          displayed but is read-only. Form submission is handled by `handleSubmit`.
    - **Generated Content Card:** Displays the user's generated content history in a `Card`.
        - **Search Input:** An `InputGroup` with a `Search2Icon` to allow users to search their
          content history. Search functionality is implemented using the `searchQuery` state and the
          filtering `useEffect` hook.
        - **Content Loading/Empty/List States:**
            - If `contentLoading` is true, displays a loading spinner and message.
            - If `filteredContentList` is empty but `contentList` is also empty, displays "You
              haven't generated any content yet."
            - If `filteredContentList` is empty and `contentList` is not empty, displays "No content
              matches your search."
            - If `filteredContentList` has content, renders a `Table` to display the content
              history.
        - **Content Table:**
            - Displays content information in rows: Topic, Platform, Goal, Tone, Created date
              (formatted using `formatDistanceToNow`), and Actions.
            - **Actions Column:** Includes `IconButton`s for:
                - **View Details (ViewIcon):** Toggles the expansion of content details using
                  `toggleContentExpansion`.
                - **Delete Content (DeleteIcon):** Deletes the content item using
                  `handleDeleteContent`.
            - **Collapsible Content Details Row:** When a content item is expanded, a `Collapse`
              component is rendered below the main row, showing detailed information about the
              generated content options (Text, Image, Hashtags, Alt Text) in a `Card` within the
              collapsed area.

## Helper Function Description: `getPlatformColorScheme`
