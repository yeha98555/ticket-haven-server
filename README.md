![CICD Status](https://github.com/yeha98555/ticket-haven-server/actions/workflows/render.yml/badge.svg)

# Ticket Haven Server
A server for managing concert tickets.

## Prerequisites
Before running this project, you must have the following installed:

- Node.js (v16.18.0 or later)
- Yarn (v3.5.0 or later)

## Installation
1. Clone this repository to your local machine.
2. Run `yarn` in the project directory to install all required dependencies.
3. Create a `.env` file at the root directory of the project and add the necessary environment variables. See the `.env.sample` file for reference.
4. Run `yarn start` or `yarn dev` to start the application.

## NPM scripts
Available development scripts:

- `yarn dev`： Start the development server.
- `yarn build`：Build the production version
- `yarn start`：Start the production server.
- `yarn lint`：Run ESLint for syntax checking.
- `yarn format`: Run Prettier to format code.
- `yarn prepare`: Install Husky.

## Tech Stack
Technologies used in this project

- Express: a popular web framework for Node.js, used for building scalable and robust web applications.
- Mongoose: an Object Data Modeling (ODM) library for MongoDB and Node.js.
- TypeScript: A strongly-typed JavaScript extension, making the development process more reliable and maintainable.
- ESLint: A static analysis tool for maintaining code quality.
- Prettier: an opinionated code formatter that automatically formats code to make it more consistent and easier to read.
- Husky: A tool for managing Git hooks.
- Swagger: a set of open-source tools for designing, building, documenting, and consuming RESTful web services.

## Project structure
```javascript
.
├── .git                     // Folder for Git version control system
├── .github                  // Folder for GitHub Actions
├── .vscode                  // Visual Studio Code configuration folder
├── node_modules             // Node.js module folder, storing all dependencies
├── src                      // Source code folder
│   ├── connections          // Folder for connection
│   ├── controllers          // Folder for handling incoming requests and sending responses back to the client
│   ├── middleware           // Folder for modifing the request or response objects before or after they reach the controller.
│   ├── models               // Folder for defining the structure of the data that will be stored in the database
│   ├── routes               // Folder for defining the endpoints for the API and mapping them to the corresponding controller functions
│   ├── service              // Folder for encapsulating the business logic of the application and interact with the models and controllers
│   ├── app.ts               // the main application file that sets up the Express app, defines middleware, and registers the routes
│   └── environment.d.ts     // File that provides type definitions for environment variables used in the project.
├── tsconfig.json            // TypeScript configuration file
├── .commitlintrc.json       // CommitLint configuration file, used for checking the format of Git commit messages
├── .env.sample              // .env template file, storing sample environment variables
├── .eslintignore            // ESLint ignore configuration, specifying files that don't need syntax checking
├── .eslintrc.json           // ESLint configuration file, used for setting syntax checking rules
├── .gitignore               // Git ignore configuration, specifying files that don't need version control
├── .prettierignore          // Prettier ignore configuration, specifying files that don't need code formatting
├── .prettierrc              // Prettier configuration file, used for setting code formatting rules
├── README.md                // Project description file
├── package.json             // Project configuration file, containing project information, scripts, and dependencies
└── yarn.lock                // Yarn lock file, ensuring consistent dependency versions
```

## Specifications

### Commit Message Guidelines
follow [the rules provided by Coolizz](https://github.com/CoolizzLuo/ticket-haven-platform#commit-message-guidelines).
