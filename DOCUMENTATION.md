# Turbocontent Project Documentation

## 1. Project Overview

**Tagline:** Instantly Generate Engaging Social Media Content.

**Description:** Turbocontent is a SaaS platform designed to empower users to effortlessly create
compelling and platform-optimized social media content. By simply inputting a topic, defining a
goal, selecting a target platform, and specifying the desired tone, users can instantly generate
multiple social media post options. Each generated post includes visually appealing images, tailored
text, relevant hashtags, and descriptive alt text.

**Target Audience:**

- Social Media Managers
- Small Businesses
- Marketing Agencies
- Influencers

**Core Functionality:**

- **Content Generation:** AI-powered generation of social media posts based on user-defined topics,
  goals, platforms, and tones.
- **Platform Optimization:** Content tailored for Instagram, Facebook, Twitter, LinkedIn, and
  Pinterest.
- **Visual Content Integration:** Automatic inclusion of relevant and engaging images.
- **Hashtag Recommendation:** Generation of relevant hashtags to increase discoverability.
- **Accessibility and SEO:** Implementation of descriptive alt text for images.
- **User Management:** Secure user accounts, profiles, and subscription management.
- **Admin Panel:** Administrative interface for system management and user oversight.
- **Feedback System:** Mechanism for users to provide feedback on the platform.

**Value Proposition:**

Turbocontent dramatically reduces the time, effort, and cost associated with creating consistent,
engaging, and platform-optimized social media content. It empowers users to maintain a strong online
presence, amplify their brand message, and achieve their social media marketing goals efficiently
and effectively.

## 2. Project Architecture

Turbocontent follows a modular architecture, clearly separating concerns into client-side,
server-side, and public assets.

**2.1. Root Files:**

- **Configuration & Deployment:**
    - `.prettierrc`: Code formatting configuration for consistent styling.
    - `copy.cmd`: Windows command script for exporting MongoDB data.
    - `deploy.cmd`: Windows command script for deployment (details not specified but likely involves
      deployment processes).
    - `kill.cmd`: Windows command script to terminate Node.js processes.
- **Docker Configurations:**
    - `Dockerfile`: Defines the Docker image for the application, including dependencies and build
      steps.
    - `docker-compose.yml`: Orchestrates the Docker containers for the application and MongoDB
      database.
    - `.dockerignore`: Specifies files and directories to exclude from the Docker image.
- **Core Application Files:**
    - `index.html`: Main HTML entry point for the client-side application.
    - `package.json`: Defines client-side dependencies and scripts (using Vite).
    - `vite.config.js`: Configuration file for Vite, the front-end build tool.
- **API/DB Utilities:**
    - `rest.http`: File for testing REST API endpoints (likely using a REST client extension).
    - `playground-1.mongodb.js`: MongoDB script for database initialization or data manipulation
      (e.g., setting admin user).

**2.2. Client (`src/`):** (React-based)

The client-side application is built using React and Chakra UI, focusing on a dynamic and
interactive user experience.

- **Core Layout & Navigation:**
    - `App.jsx`: Root component of the React application, sets up routing and overall application
      structure.
    - `Navbar.jsx`: Component for the top navigation bar, providing access to key sections of the
      application.
    - `BottomNavigationBar.jsx`: Component for bottom navigation, likely optimized for mobile
      devices, offering quick access to main features.
    - `main.jsx`: Entry point for the React application, rendering the `App` component into the
      `index.html`.
- **Main Pages:**
    - `Landing.jsx`: Landing page of the application, designed to attract and inform new users.
    - `Docs.jsx`: Page for application documentation and FAQs.
    - `Content.jsx`: Core page for content generation, where users input parameters and view
      generated content.
- **User Management & Profile:**
    - `Login.jsx`: Login page for existing users.
    - `SignUp.jsx`: Sign-up page for new user registration.
    - `Forgot.jsx`: Page for password recovery (forgot password functionality).
    - `Reset.jsx`: Page for resetting password after using forgot password.
    - `Profile.jsx`: User profile page for managing personal information, preferences, and
      potentially saved content.
- **Interaction & Administration:**
    - `Feedback.jsx`: Page for users to submit feedback about the application.
    - `Admin.jsx`: Admin dashboard, accessible to administrators, for managing users, system
      settings, and other administrative tasks.
- **Informational Content:**
    - `Privacy.jsx`: Privacy policy page.
    - `Terms.jsx`: Terms of service page.

**2.3. Server (`server/`):** (Node.js/Express)

The server-side application is built using Node.js and Express, responsible for handling API
requests, business logic, data persistence, and potentially AI integrations.

- **Entry Point & Core Logic:**
    - `index.js`: Main entry point for the server application, sets up the Express server,
      middleware, and routes.
    - `utils.js`: Utility functions used across the server application (e.g., helper functions,
      common logic).
    - `gemini.js`: Module likely responsible for integrating with Google Gemini or another AI
      service for content generation.
- **Authentication & User Routes:**
    - `user.js`: Defines routes related to user management (registration, login, profile updates,
      etc.).
    - `middleware/auth.js`: Middleware for authentication and authorization, ensuring secure access
      to protected routes.
- **Administration Routes:**
    - `admin.js`: Defines routes for administrative functionalities, accessible only to admin users.
- **Supporting Services:**
    - `search.js`: Potentially related to image search or content search functionality, might
      interact with an image service API.
- **Data Models (Mongoose):**
    - `models/Feedback.js`: Mongoose model for the Feedback data schema in MongoDB.
    - `models/User.js`: Mongoose model for the User data schema in MongoDB.
    - `models/Content.js`: Mongoose model for the generated Content data schema in MongoDB.
- **Server Dependencies:**
    - `package.json`: Defines server-side dependencies and scripts.

**2.4. Public (`public/`):**

Contains static assets served directly to the client.

- `ads.txt`: For programmatic advertising authorization.
- `landing.html`: Potentially a static fallback or alternative landing page.
- `robots.txt`: Instructions for web crawlers.
- `styles.css`: Global or legacy CSS styles, potentially for the landing page or overall styling.
- `image.png`: Likely the image referenced in the `README.md`.

**2.5. Docs (`docs/`):**

Contains documentation related files.

- `app_description.txt`, `short_description.txt`, `subtitle.txt`, `title.txt`: Text snippets for app
  descriptions and metadata.
- `keywords.txt`: Keywords for SEO purposes.
- `landing_page_copy.html`: HTML content for the landing page.
- `privacy_policy.html`: HTML content for the privacy policy.
- `release_notes.txt`: Information about releases and updates.
- `social_media_content.json`: Example or template for social media content.

## 3. Module Interactions

**3.1. Client-Server Interaction:**

The React client application (`src/`) interacts with the Node.js/Express server (`server/`) through
RESTful APIs.

- **Content Generation Flow:**
    1.  User interacts with `Content.jsx` to input topic, goal, platform, and tone.
    2.  `Content.jsx` sends an API request to the server (likely to an endpoint handled by
        `server/index.js` or `server/gemini.js`).
    3.  The server (potentially using `server/gemini.js` for AI processing and `server/search.js`
        for image retrieval) generates content.
    4.  The server responds with generated content data (text, image URLs, hashtags, alt text).
    5.  `Content.jsx` displays the generated content to the user in a preview.
- **User Authentication Flow:**
    1.  User interacts with `Login.jsx` or `SignUp.jsx`.
    2.  These components send API requests to the server (endpoints in `server/user.js`).
    3.  The server authenticates or registers the user (using `middleware/auth.js` for
        authentication logic and potentially interacting with the `User` model).
    4.  Upon successful authentication, the server sends back a JWT (JSON Web Token).
    5.  The client stores the JWT (e.g., in local storage or cookies) and includes it in subsequent
        requests for authorized actions.
- **Admin Panel Interaction:**
    1.  Admin user accesses `Admin.jsx`.
    2.  `Admin.jsx` makes API requests to server endpoints defined in `server/admin.js`.
    3.  The server, after verifying admin privileges (using `middleware/auth.js`), processes the
        requests and interacts with data models (e.g., `User`, `Feedback`).
    4.  The server sends data back to `Admin.jsx` for display and management.
- **Feedback Submission:**
    1.  User submits feedback through `Feedback.jsx`.
    2.  `Feedback.jsx` sends an API request to the server (likely to an endpoint in
        `server/index.js` or `server/admin.js`).
    3.  The server receives the feedback, validates it, and saves it to the database using the
        `Feedback` model.

**3.2. Internal Server Module Interactions:**

- `index.js` acts as the central controller, routing requests to appropriate handlers in `user.js`,
  `admin.js`, and potentially `gemini.js`.
- `gemini.js` (or similar AI module) is invoked by `index.js` when content generation is requested.
  It interacts with AI services and returns generated content.
- `search.js` might be used by `gemini.js` or other modules to fetch relevant images from an image
  service API.
- `utils.js` provides helper functions to various server modules.
- `middleware/auth.js` is used by `user.js`, `admin.js`, and potentially other modules to protect
  routes and verify user authentication and authorization.
- Data models (`models/User.js`, `models/Content.js`, `models/Feedback.js`) are used by various
  server modules to interact with the MongoDB database.

## 4. Features

- **AI-Powered Content Generation:** Leverages AI to generate social media content.
- **Multi-Platform Support:** Generates content optimized for Instagram, Facebook, Twitter,
  LinkedIn, and Pinterest.
- **Tone Customization:** Allows users to select the desired tone for generated content (e.g.,
  witty, informative, inspiring).
- **Goal-Oriented Content:** Users can specify the goal of their content (e.g., engagement,
  promotion).
- **Image Integration:** Automatically includes relevant images with generated posts.
- **Hashtag Generation:** Suggests relevant hashtags to increase reach.
- **Alt Text for Accessibility:** Generates descriptive alt text for images for accessibility and
  SEO.
- **User Accounts and Profiles:** Secure user registration, login, and profile management.
- **Admin Dashboard:** Administrative interface for managing users and system settings.
- **User Feedback System:** Built-in feedback mechanism for users to report issues and suggest
  improvements.
- **Responsive Design:** Ensures optimal viewing and functionality across different devices (mobile,
  tablet, desktop).
- **Real-time Preview:** Provides a live preview of generated content as users modify inputs.
- **Customization Options:** Offers granular controls for refining generated content.
- **Content Library (Future):** Likely to include features for saving and organizing generated
  content in the future.
- **Direct Social Media Scheduling & Publishing (Future):** Planned feature for direct posting to
  social media platforms.
- **Performance Analytics (Future):** Future development to include analytics dashboards for content
  performance tracking.

## 5. Installation Guide

To install and run Turbocontent locally for development, follow these steps:

**Prerequisites:**

- **Node.js and npm/bun:** Ensure Node.js and either npm or bun (as indicated in `Dockerfile` and
  `package.json`) are installed on your system. Bun is recommended for faster performance as per the
  project setup.
- **Docker and Docker Compose:** Docker and Docker Compose are required for containerization and
  running the MongoDB database.
- **Environment Variables:** You will need to set up environment variables for API keys, database
  connection, and other configurations. Refer to the `docker-compose.yml` file for the list of
  required environment variables (e.g., `OPENAI_KEY`, `MONGODB_URI`, `JWT_SECRET`). You can create a
  `.env` file in the root directory to store these variables or set them directly in your shell
  environment.

**Steps:**

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd turbocontent
    ```

2.  **Install client-side dependencies:**

    ```bash
    bun install  # Or npm install if you prefer npm
    ```

3.  **Install server-side dependencies:**

    ```bash
    cd server
    bun install  # Or npm install if you prefer npm
    cd ..
    ```

4.  **Set up environment variables:**

    - Create a `.env` file in the root directory.
    - Add the necessary environment variables as defined in `docker-compose.yml`. For development,
      you can use placeholder values for API keys, but for full functionality, you'll need to obtain
      and configure the actual keys (e.g., OpenAI API key if used, Unsplash API key, Google API
      keys, etc.).
    - Example `.env` file:
        ```env
        OPENAI_KEY=your_openai_api_key
        DEEPSEEK_KEY=your_deepseek_api_key
        GOOGLE_KEY=your_google_api_key
        CLAUDE_KEY=your_claude_api_key
        GROK_KEY=your_grok_api_key
        UNSPLASH_API_KEY=your_unsplash_api_key
        GOOGLE_CLIENT_ID=your_google_client_id
        GA_API_SECRET=your_ga_api_secret
        MONGODB_URI=mongodb://localhost:27017/turbocontent
        STRIPE_KEY=your_stripe_api_key
        STRIPE_WH_SECRET=your_stripe_webhook_secret
        JWT_SECRET=your_jwt_secret
        EMAIL=your_email_address
        FROM_EMAIL=your_from_email_address
        EMAIL_PASSWORD=your_email_password
        FRONTEND_URL=http://localhost:5173 # Vite dev server default port
        ```

5.  **Run Docker Compose to start MongoDB:**

    ```bash
    docker-compose up -d mongodb
    ```

6.  **Start the development servers:**

    - Open two terminal windows.
    - **Terminal 1 (Client):**
        ```bash
        bun run dev  # Or npm run dev
        ```
        This will start the Vite development server for the React client, usually at
        `http://localhost:5173`.
    - **Terminal 2 (Server):**
        ```bash
        cd server
        bun index.js  # Or node index.js if using npm
        cd ..
        ```
        This will start the Node.js/Express server, usually at `http://localhost:3000`.

7.  **Access the application:**
    - Open your browser and navigate to the client URL (e.g., `http://localhost:5173`).

**Note:**

- For production deployment, refer to the `Dockerfile` and `docker-compose.yml` for building and
  running the application in a containerized environment. The `deploy.cmd` script might contain
  deployment-specific commands, but further details are needed to understand the exact deployment
  process.
- The `copy.cmd` script is for exporting MongoDB data; it's likely used for backups or data
  migration.
- The `kill.cmd` script is a utility for stopping Node.js processes, useful during development.

## 6. Usage Instructions

1.  **Access Turbocontent:** Open the application in your web browser (e.g., `http://localhost:5173`
    in development, or the deployed URL).
2.  **Sign Up/Log In:** If you are a new user, sign up for an account. If you have an existing
    account, log in.
3.  **Navigate to Content Generation:** Go to the "Content" page (likely accessible through the
    navigation bar).
4.  **Input Content Parameters:**
    - **Topic:** Enter the topic you want to create social media content about.
    - **Goal:** Select your content goal (e.g., engagement, promotion, information).
    - **Platform:** Choose the target social media platform (Instagram, Facebook, Twitter, LinkedIn,
      Pinterest).
    - **Tone:** Select the desired tone (witty, informative, inspiring, etc.).
5.  **Generate Content:** Click the "Generate" button (or similar).
6.  **Review Generated Content:** Turbocontent will generate multiple post options. Review the text,
    images, and hashtags for each option in the preview area.
7.  **Customize Content (Optional):**
    - Use the provided customization tools to refine the generated content. This might include
      editing text directly, adjusting tone intensity, or modifying hashtag selection.
8.  **Select and Use Content:** Choose the best content option for your needs. You can then copy the
    text, download the image, and use the hashtags for posting on your chosen social media platform.
9.  **Save Content (Future Feature):** In future versions, you might be able to save generated
    content within your profile for later use.

## 7. Technical Considerations

- **Front-End Focus:** React and Chakra UI are used for a dynamic and user-friendly interface, with
  Vite for optimized development and build processes.
- **Modular and Reusable Components:** The React application is structured with modular components
  for maintainability and scalability.
- **Scalable Backend & API Design:** Node.js/Express backend is designed for scalability with
  RESTful APIs, containerization (Docker), and separate routes for different functionalities.
- **Performance Optimization:** Front-end performance is prioritized through code splitting, asset
  optimization, and browser caching. Backend performance is optimized through efficient queries and
  AI interactions, with potential caching mechanisms.
- **Security:** Security best practices are implemented on both client and server, including secure
  authentication, input validation, rate limiting, protection against web vulnerabilities, and
  dependency vulnerability scanning.
- **Error Handling & Logging:** Robust error handling and centralized logging are implemented for
  monitoring, debugging, and issue tracking.

## 8. Potential Features & Future Enhancements

- **Integrated Drag-and-Drop Content Calendar & Visual Planner**
- **Direct Social Media Platform API Scheduling & Publishing**
- **Comprehensive Performance Analytics Dashboard & Reporting**
- **Advanced Brand Kit Management & Dynamic Branding**
- **AI-Powered Advanced Tone, Style, and Persona Customization & Learning**
- **A/B Testing & Intelligent Content Variation Generation & Optimization**
- **Intelligent Content Repurposing & Cross-Platform Adaptation Engine**

## 9. Conclusion

Turbocontent is a promising project aimed at simplifying social media content creation through
AI-powered generation and platform optimization. Its modular architecture, focus on user experience,
and planned future enhancements position it as a valuable tool for social media managers,
businesses, and individuals looking to enhance their online presence efficiently. This documentation
provides a comprehensive overview of the project's structure, features, and setup, offering a solid
foundation for development, usage, and future contributions.
