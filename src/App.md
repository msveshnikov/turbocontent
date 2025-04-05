# Documentation for `src\App.jsx`

## Overview

The `App.jsx` file serves as the main entry point for the React frontend of the application. It is
responsible for setting up the application's core structure, including:

- **Routing:** Defines all the client-side routes using `react-router-dom`, mapping URLs to
  different components and pages.
- **Theming:** Implements a custom theme using Chakra UI to ensure consistent styling across the
  application.
- **Context Management:** Provides a `UserContext` to manage and share user authentication state
  throughout the application.
- **Layout:** Sets up the basic page layout with a `Navbar` at the top, content within a
  `Container`, and a `BottomNavigationBar` at the bottom for mobile navigation.
- **Lazy Loading:** Implements lazy loading for certain components like `Admin`, `Feedback`, and
  `Docs` to improve initial loading performance.
- **Google OAuth Integration:** Configures Google OAuth for user authentication.
- **API URL Configuration:** Defines the API endpoint based on the environment (development or
  production).

This file is crucial for bootstrapping the application and orchestrating the user interface and
navigation. It acts as the central hub connecting various components and features of the frontend.

## Imports

The file imports various modules and components, which can be categorized as follows:

**Chakra UI Components:**

- `ChakraProvider`: Provides the Chakra UI theming context to the application, making Chakra UI
  components and styles available.
- `Box`: A fundamental layout component for creating boxes and applying styles.
- `Container`: A component for creating responsive containers to constrain content width.
- `VStack`: A component for vertically stacking elements with consistent spacing.
- `extendTheme`: A function to customize the default Chakra UI theme.

**React Router DOM:**

- `BrowserRouter as Router`: Enables client-side routing using browser history API.
- `Routes`: A container for defining individual `Route` components.
- `Route`: Used to define a specific route path and the component to render when that path is
  matched.
- `Navigate`: Used to programmatically redirect to a different route.

**React Core:**

- `lazy`: A function to enable lazy loading of components, improving initial load time.
- `Suspense`: A component to handle loading states when lazy-loaded components are being fetched.
- `createContext`: A function to create a React context for sharing state across components.
- `useEffect`: A React Hook for performing side effects in functional components, used here for user
  authentication check on app load.
- `useState`: A React Hook for managing component-level state, used here for the `user` state.

**External Libraries:**

- `GoogleOAuthProvider` from `@react-oauth/google`: Provides the context for Google OAuth
  authentication.

**Internal Components (from `./` directory):**

- `Landing`: Component for the landing page.
- `Navbar`: Component for the application's navigation bar.
- `Terms`: Component for the Terms of Service page.
- `Privacy`: Component for the Privacy Policy page.
- `Login`: Component for the login page.
- `SignUp`: Component for the signup page.
- `Forgot`: Component for the forgot password page.
- `Reset`: Component for the reset password page.
- `Profile`: Component for the user profile page.
- `BottomNavigationBar`: Component for the bottom navigation bar, likely for mobile views.
- `Content`: Component for displaying general content (purpose needs further context from other
  files).
- `Admin`: Component for the admin dashboard (lazy-loaded).
- `Feedback`: Component for the feedback page (lazy-loaded).
- `Docs`: Component for the documentation section (lazy-loaded).

## Constants and Contexts

### `API_URL`
