![CICD Status](https://github.com/yeha98555/ticket-haven-server/actions/workflows/render.yml/badge.svg)

# Ticket Haven Server
A server for managing concert tickets.

## Prerequisites
Before running this project, you must have the following installed:

- Node.js (v16.18.0 or later)
- Yarn (v3.5.0 or later)
- Docker (v23.0.1 or later, if development with docker env)

## Installation
### Local environment:

1. Clone this repository to your local machine.
2. Run `yarn` in the project directory to install all required dependencies.
3. Create a `.env` file at the root directory of the project and add the necessary environment variables. Refer to the `.env.sample` file for guidance.
4. Run `yarn start` or `yarn dev` to start the application.

### Docker environment:

1. Clone this repository to your local machine.
2. Create a `.env` file at the root directory of the project and add the necessary environment variables. Refer to the `.env.sample` file for guidance.
3. Run `make up file=prod` or `make up file=dev` to start the application.

## NPM scripts
Available development scripts:

- `yarn dev`： Start the development server.
- `yarn build`：Build the production version
- `yarn start`：Start the production server.
- `yarn lint`：Run ESLint for syntax checking.
- `yarn format`: Run Prettier to format code.
- `yarn prepare`: Install Husky.
- `yarn test`: Run Jest for automated tests.

## Make scripts
If you want to use Docker environment for development, you can use the following command:

- `make up file=dev/prod`: Start the Docker environment using the `dev.yml` or `prod.yml` configuration file, depending on the value of the `file` parameter.
- `make down file=dev/prod`: Stop and remove the Docker environment using the `dev.yml` or `prod.yml` configuration file, depending on the value of the `file` parameter.
- `make restart file=dev/prod`: Stop and remove the current Docker environment before starting a new one using the `dev.yml` or `prod.yml` configuration file, depending on the value of the `file` parameter.
- `make shell`: Enter a running Docker container with an interactive terminal session.

If you want to switch from using a Docker environment to a local environment, you may need to remove the `node_modules` directory with the  `sudo rm -rf node_modules` command and then run `yarn install` to install the dependencies locally. This is necessary because the Docker environment and the local environment may have different configurations and dependencies, and therefore the dependencies installed in one environment may not be compatible with the other environment.


## Tech Stack
Technologies used in this project

- Express: A popular web framework for Node.js, used for building scalable and robust web applications.
- Mongoose: An Object Data Modeling (ODM) library for MongoDB and Node.js.
- TypeScript: A strongly-typed JavaScript extension, making the development process more reliable and maintainable.
- Jest: A JavaScript testing framework for building automated tests with a focus on simplicity and ease of use.
- SuperTest: A library for testing HTTP servers in JavaScript, providing a high-level API for making HTTP requests to your app and making assertions about the response.
- ESLint: A static analysis tool for maintaining code quality.
- Prettier: An opinionated code formatter that automatically formats code to make it more consistent and easier to read.
- Husky: A tool for managing Git hooks.
- Swagger: A set of open-source tools for designing, building, documenting, and consuming RESTful web services.

## Project structure
```javascript
.
├── .git                     // Folder for Git version control system
├── .github                  // Folder for GitHub Actions
├── .vscode                  // Visual Studio Code configuration folder
├── __tests__                // Folder for tests
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
├── jest.config.js           // Project configuration file, used by Jest testing framework for JavaScript projects
├── dev.yml                  // Docker Compose file, defining the development environment for a project
├── prod.yml                 // Docker Compose file, defining the production environment for a project
├── Makefile                 // File defining the make command for the execution of Docker Compose commands
├── README.md                // Project description file
├── package.json             // Project configuration file, containing project information, scripts, and dependencies
└── yarn.lock                // Yarn lock file, ensuring consistent dependency versions
```

## Specifications

### Commit Message Guidelines
follow [the rules provided by Coolizz](https://github.com/CoolizzLuo/ticket-haven-platform#commit-message-guidelines).
