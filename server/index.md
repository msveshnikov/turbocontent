# Documentation for `server/index.js`

## Overview

`server/index.js` is the main entry point for the backend server application. It is built using
Node.js and Express.js, and serves as the core logic for handling API requests, managing data, and
interacting with the frontend application. This file sets up the Express server, configures
middleware for various functionalities like CORS, request logging, rate limiting, and
authentication, defines API routes for user and admin functionalities, connects to a MongoDB
database, and starts the server. It also handles error logging and serves static files for the
frontend application.

This file is crucial for the application's backend as it orchestrates various components to provide
a functional API and server-side logic. It interacts with database models defined in
`server/models`, middleware in `server/middleware`, and route handlers in `server/user.js` and
`server/admin.js`. It leverages the `gemini.js` module to integrate with the Gemini AI model for
content generation.

## Modules and Imports

The file imports and utilizes the following modules:

- **`express` from `'express'`**: The core framework for building the web server and defining
  routes.
- **`cors` from `'cors'`**: Middleware to enable Cross-Origin Resource Sharing, allowing requests
  from different domains (like the frontend running on a different port).
- **`fs` from `'fs'`**: Node.js file system module, used here to read HTML files for serving the
  frontend application.
- **`promBundle` from `'express-prom-bundle'`**: Middleware for collecting and exposing application
  metrics in Prometheus format, useful for monitoring server performance.
- **`dotenv` from `'dotenv'`**: Loads environment variables from a `.env` file into `process.env`,
  used for configuration like ports and database URIs.
- **`rateLimit` from `'express-rate-limit'`**: Middleware to limit the number of requests from a
  single IP address within a given time window, protecting against abuse and DDoS attacks.
- **`mongoose` from `'mongoose'`**: MongoDB object modeling tool, used to connect to and interact
  with the MongoDB database.
- **`morgan` from `'morgan'`**: HTTP request logger middleware for logging request details during
  development.
- **`compression` from `'compression'`**: Middleware to compress response bodies, improving
  performance by reducing data transfer size.
- **`dirname` and `join` from `'path'`**: Node.js path utilities for working with file and directory
  paths, ensuring path compatibility across different operating systems.
- **`fileURLToPath` from `'url'`**: Utility to convert a file URL to a file path, necessary when
  using ES modules in Node.js to get the current directory.
- **`Feedback` from `'./models/Feedback.js'`**: Mongoose model for the `Feedback` collection,
  representing user feedback data.
- **`Content` from `'./models/Content.js'`**: Mongoose model for the `Content` collection,
  representing generated and saved content data.
- **`userRoutes` from `'./user.js'`**: Imported function that defines and applies user-related API
  routes to the Express app.
- **`adminRoutes` from `'./admin.js'`**: Imported function that defines and applies admin-related
  API routes to the Express app.
- **`authenticateTokenOptional`, `authenticateToken` from `'./middleware/auth.js'`**: Middleware
  functions for JWT-based authentication. `authenticateToken` requires a valid token, while
  `authenticateTokenOptional` verifies a token if present but doesn't require it.
- **`getTextGemini` from `'./gemini.js'`**: Function to interact with the Gemini AI model for text
  generation.

## Middleware Configuration

The application uses several middleware functions to enhance its functionality and security:

- **`app.set('trust proxy', 1)`**: Configures Express to trust the first proxy in front of the
  server. This is important for rate limiting and getting the correct client IP address when behind
  a proxy like in production environments.
- **`express.json({ limit: '15mb' })`**: Parses incoming requests with JSON payloads. The `limit`
  option sets the maximum request body size to 15MB, useful for handling potentially large content
  generation requests.
- **`metricsMiddleware (promBundle)`**: Configures and applies the `express-prom-bundle` middleware.
    - `includeMethod: true`, `includePath: true`, `includeStatusCode: true`: Includes HTTP method,
      path, and status code in the metrics.
    - `customLabels: { model: 'No' }`: Sets a default custom label 'model' to 'No'.
    - `transformLabels`: A function to dynamically modify labels based on the request body. It
      extracts the `model` from the request body if present, otherwise defaults to 'No'. This allows
      tracking metrics based on the AI model used in requests.
- **`cors()`**: Enables CORS for all routes, allowing cross-origin requests. In a production setup,
  you might want to configure this more restrictively to only allow specific origins.
- **`express.static(join(__dirname, '../dist'))`**: Serves static files from the `../dist`
  directory. This is likely where the bundled frontend application is located after building (e.g.,
  using Vite).
- **`morgan('dev')`**: Logs HTTP requests in 'dev' format to the console. Useful for development
  logging.
- **`compression()`**: Enables Gzip compression for responses, reducing bandwidth usage and
  improving page load times for clients.
- **`limiter (rateLimit)`**: Configures and applies the `express-rate-limit` middleware.
    - `windowMs: 15 * 60 * 1000`: Sets the time window for rate limiting to 15 minutes.
    - `max: 130`: Sets the maximum number of requests allowed within the window to 130.
    - Applied to `/api/` routes only in production (`process.env.NODE_ENV === 'production'`). This
      rate limit is applied to protect API endpoints from excessive requests in production.

## Routes

The application defines the following routes:

- **User Routes (`userRoutes(app)`)**: Mounts user-related routes (defined in `user.js`) onto the
  Express application instance (`app`). These routes likely handle user authentication, profile
  management, and other user-specific functionalities.
- **Admin Routes (`adminRoutes(app)`)**: Mounts admin-related routes (defined in `admin.js`) onto
  the Express application instance (`app`). These routes likely handle administrative tasks such as
  user management, content moderation, or system configuration, and are typically protected with
  admin-level authentication.

- **`POST /api/feedback`**:

    - **Authentication:** `authenticateTokenOptional` - Optional JWT authentication. If a valid
      token is provided, the user's ID is associated with the feedback.
    - **Request Body:**
        ```json
        {
            "message": "User feedback message",
            "type": "Suggestion" // or "Bug Report", "General Feedback", etc.
        }
        ```
    - **Description:** Endpoint to submit user feedback. It saves the feedback message, type, and
      optionally the user ID if authenticated into the `Feedback` collection in the database.
    - **Request Parameters:**
        - `message` (String, required): The feedback message provided by the user.
        - `type` (String, required): The type of feedback (e.g., "Suggestion", "Bug Report").
    - **Returns:**
        - **201 Created:** On successful feedback submission, returns the saved feedback object in
          JSON format.
        ```json
        {
            "userId": "optionalUserId",
            "message": "User feedback message",
            "type": "Suggestion",
            "createdAt": "timestamp",
            "_id": "feedbackObjectId",
            "__v": 0
        }
        ```
        - **500 Internal Server Error:** If feedback submission fails, returns an error message in
          JSON format.
        ```json
        {
            "error": "Failed to submit feedback",
            "details": "Error details"
        }
        ```
    - **Usage Example:**
        ```bash
        curl -X POST -H "Content-Type: application/json" -d '{"message": "This is a great feature!", "type": "Suggestion"}' http://localhost:3000/api/feedback
        ```

- **`POST /api/generate-content`**:

    - **Authentication:** No authentication required.
    - **Request Body:**
        ```json
        {
            "topic": "Social Media Marketing",
            "goal": "Increase brand awareness",
            "platform": "Twitter",
            "tone": "Professional",
            "model": "gemini-2.0-flash-thinking-exp-01-21" // Optional, defaults to 'gemini-2.0-flash-thinking-exp-01-21'
        }
        ```
    - **Description:** Endpoint to generate social media content using the Gemini AI model. It takes
      topic, goal, platform, and tone as input and returns an array of content options.
    - **Request Parameters:**
        - `topic` (String, required): The topic for the social media post.
        - `goal` (String, required): The objective of the social media post.
        - `platform` (String, required): The target social media platform (e.g., "Twitter",
          "Instagram", "LinkedIn").
        - `tone` (String, required): The desired tone of the content (e.g., "Professional",
          "Casual", "Humorous").
        - `model` (String, optional): The specific Gemini model to use for content generation.
          Defaults to `'gemini-2.0-flash-thinking-exp-01-21'`.
    - **Returns:**
        - **200 OK:** On successful content generation, returns an array of content options in JSON
          format. Each option is an object with `text`, `hashtags`, and `altText` keys.
        ```json
        [
            {
                "text": "Engaging social media post text option 1...",
                "hashtags": "#SocialMedia #Marketing #BrandAwareness",
                "altText": "Description for image related to post option 1"
            },
            {
                "text": "Engaging social media post text option 2...",
                "hashtags": "#SMM #DigitalMarketing #BrandBuilding",
                "altText": "Description for image related to post option 2"
            }
        ]
        ```
        - **400 Bad Request:** If any required parameters (`topic`, `goal`, `platform`, `tone`) are
          missing.
        ```json
        {
            "error": "Missing required parameters: topic, goal, platform, and tone are required."
        }
        ```
        - **500 Internal Server Error:** If AI content generation fails or JSON parsing fails.
          Returns an error message in JSON format with details.
        ```json
        {
            "error": "AI content generation failed",
            "details": "Error details from Gemini API"
        }
        ```
    - **Usage Example:**
        ```bash
        curl -X POST -H "Content-Type: application/json" -d '{"topic": "Web Development", "goal": "Promote our web development services", "platform": "LinkedIn", "tone": "Expert"}' http://localhost:3000/api/generate-content
        ```

- **`POST /api/save-content`**:

    - **Authentication:** `authenticateToken` - JWT authentication is required. Only authenticated
      users can save content.
    - **Request Body:**
        ```json
        {
            "topic": "Social Media Marketing",
            "goal": "Increase brand awareness",
            "platform": "Twitter",
            "tone": "Professional",
            "contentOptions": [
                { "text": "...", "hashtags": "...", "altText": "..." },
                { "text": "...", "hashtags": "...", "altText": "..." }
            ],
            "model": "gemini-2.0-flash-thinking-exp-01-21",
            "isPrivate": false // Optional, defaults to false
        }
        ```
    - **Description:** Endpoint to save generated content to the database for a logged-in user.
    - **Request Parameters:**
        - `topic` (String, required): The topic of the content.
        - `goal` (String, required): The goal of the content.
        - `platform` (String, required): The target platform.
        - `tone` (String, required): The tone of the content.
        - `contentOptions` (Array, required): An array of content options generated by the AI.
        - `model` (String, required): The AI model used to generate the content.
        - `isPrivate` (Boolean, optional): Indicates if the content should be private to the user.
          Defaults to `false`.
    - **Returns:**
        - **201 Created:** On successful content saving, returns the saved content object in JSON
          format.
        ```json
        {
            "userId": "userId",
            "topic": "Social Media Marketing",
            "goal": "Increase brand awareness",
            "platform": "Twitter",
            "tone": "Professional",
            "contentOptions": [ ... ],
            "model": "gemini-2.0-flash-thinking-exp-01-21",
            "isPrivate": false,
            "_id": "contentObjectId",
            "createdAt": "timestamp",
            "updatedAt": "timestamp",
            "__v": 0
        }
        ```
        - **400 Bad Request:** If any required parameters (`topic`, `goal`, `platform`, `tone`,
          `contentOptions`) are missing.
        ```json
        {
            "error": "Missing required parameters: topic, goal, platform, tone, and contentOptions are required."
        }
        ```
        - **500 Internal Server Error:** If content saving fails. Returns an error message in JSON
          format with details.
        ```json
        {
            "error": "Failed to save content",
            "details": "Error details"
        }
        ```
    - **Usage Example:**
        ```bash
        curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN" -d '{"topic": "Web Development", "goal": "Promote our services", "platform": "LinkedIn", "tone": "Expert", "contentOptions": [{"text": "...", "hashtags": "...", "altText": "..."}, {"text": "...", "hashtags": "...", "altText": "..."}], "model": "gemini-2.0-flash-thinking-exp-01-21"}' http://localhost:3000/api/save-content
        ```

- **`GET /`**:

    - **Authentication:** No authentication required.
    - **Description:** Serves the `landing.html` file located in the `../dist` directory. This is
      likely the landing page of the application.
    - **Returns:**
        - **200 OK:** Returns the HTML content of `landing.html`.

- **`GET *`**:

    - **Authentication:** No authentication required.
    - **Description:** A catch-all route that serves the `index.html` file from the `../dist`
      directory for any other GET requests that don't match specific routes. This is typically used
      to serve the main frontend application (e.g., for single-page applications where routing is
      handled on the client-side).
    - **Returns:**
        - **200 OK:** Returns the HTML content of `index.html`.

- **`404 Not Found Handler`**:
    - **Description:** Middleware that handles any requests that don't match any defined routes. It
      returns a 404 status code with a JSON error message.
    - **Returns:**
        - **404 Not Found:**
        ```json
        {
            "error": "Not found"
        }
        ```

## Functions

- **`generateAIResponse(prompt, model, temperature = 0.7)`**:
    - **Description:** A wrapper function that calls the `getTextGemini` function to generate text
      using the Gemini AI model.
    - **Parameters:**
        - `prompt` (String, required): The prompt text to send to the AI model.
        - `model` (String, required): The name of the Gemini model to use.
        - `temperature` (Number, optional): The temperature parameter for the AI model, controlling
          the randomness of the output. Defaults to `0.7`.
    - **Returns:**
        - `Promise<string>`: A promise that resolves with the text response from the Gemini AI
          model.
    - **Usage Example (Internal):**
        ```javascript
        const aiText = await generateAIResponse('Write a short poem.', 'gemini-pro');
        console.log(aiText);
        ```

## Database Connection

- **`mongoose.connect(process.env.MONGODB_URI, {})`**: Establishes a connection to the MongoDB
  database using the URI provided in the `MONGODB_URI` environment variable. The empty object `{}`
  is for connection options (which are not specified in this code but can be added if needed, e.g.,
  for connection pooling or authentication).

## Server Startup

- **`app.listen(port, () => { ... })`**: Starts the Express server and makes it listen for incoming
  requests on the specified `port`. The `port` is determined by the `PORT` environment variable, or
  defaults to 3000 if `PORT` is not set. A console message is logged when the server starts
  successfully, indicating the port it's running on.

## Error Handling

- **`process.on('uncaughtException', (err, origin) => { ... })`**: Handles uncaught exceptions that
  occur during the execution of the application. It logs the error and its origin to the console.
  This is a global error handler to prevent the server from crashing due to unexpected errors.
- **`process.on('unhandledRejection', (reason, promise) => { ... })`**: Handles unhandled promise
  rejections. It logs the rejection reason and the promise that was rejected to the console. This is
  important for catching errors in asynchronous operations that are not properly handled with
  `.catch()`.

## Environment Variables

The application relies on environment variables for configuration, primarily loaded using `dotenv`.
Key environment variables include:

- **`PORT`**: The port on which the server will listen. Defaults to 3000 if not set.
- **`MONGODB_URI`**: The connection string for the MongoDB database.
- **`NODE_ENV`**: Indicates the environment (e.g., 'production', 'development'). Used to
  conditionally apply rate limiting in production.
- **`GOOGLE_APPLICATION_CREDENTIALS`**: Path to the Google Cloud credentials file, necessary for
  authenticating with the Gemini API. Set programmatically at the end of the file.

## Project Structure Context

`server/index.js` resides within the `server` directory of the project. It is the central backend
file that integrates with other modules within the `server` directory:

- **`server/user.js` and `server/admin.js`**: Define route handlers for user and admin
  functionalities, respectively, which are mounted in `index.js`.
- **`server/models`**: Contains Mongoose models (`Content.js`, `Feedback.js`, `User.js`) used for
  database interactions in `index.js` and other backend modules.
- **`server/middleware/auth.js`**: Provides authentication middleware used in `index.js` to protect
  certain API endpoints.
- **`server/gemini.js`**: Contains the `getTextGemini` function used in `index.js` to interact with
  the Gemini AI model for content generation.
- **`public/landing.html` and `public/index.html`**: Frontend HTML files served by the server,
  located in the `public` directory (but served from `../dist` after frontend build process).
- **`src` directory**: Contains the frontend application code (React components, etc.) which is
  built and its output is served by the `server/index.js` file.

In essence, `server/index.js` acts as the orchestrator, bringing together various backend components
and serving the frontend application to create a complete web application.
