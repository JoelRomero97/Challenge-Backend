# Backend Challenge

A [NodeJS](https://nodejs.org) + [Fastify](https://fastify.dev/) API for viewing and scheduling events. External dependencies (`http://event.com/*`) are mocked using [MSW](https://mswjs.io/).

## Prerequisites

- [nvm](https://github.com/nvm-sh/nvm) (Node Version Manager) — used to install the NodeJS version pinned in `.nvmrc`.

## Getting Started

1. Install the correct NodeJS version (read from `.nvmrc`):

```bash
nvm install
```

2. Install dependencies:

```bash
npm i
```

3. Create your local environment file from the template (for the purposes of this challenge, the .env.example file contains the correct values to use, in a prod environment these will be set in the secrets section of the server):

```bash
cp .env.example .env
```

4. Run the project:

```bash
npm start
```

The API is available at `http://localhost:3000` (or `PORT` you set in `.env`).

## Environment Variables

Configuration is read from environment variables, so no environment-specific values or secrets are hardcoded. Locally they're loaded from `.env` using Node's built-in `--env-file` flag, so no additional dependency (`dotenv`) is needed.

`.env` is ignored by `.gitignore`. `.env.example` is committed as the template and should be synced whenever a new variable is added.

| Variable    | Required | Default | Description                                                      |
| ----------- | -------- | ------- | ---------------------------------------------------------------- |
| `PORT`      | Yes      | —       | Port the Fastify server listens on                               |
| `EVENT_API` | Yes      | —       | Base URL of the external Event API                               |
| `LOG_LEVEL` | No       | `info`  | Log level (`error`, `warn`, `debug`, `trace`, `info`)   |

All variables are read and validated in `config/index.js`. If a required variable is missing or invalid, the app fails at startup instead of failing later at runtime.

## API Endpoints

| Method | Path                     | Description                          |
| ------ | ------------------------ | ------------------------------------ |
| GET    | `/getUsers`              | Returns the list of users            |
| GET    | `/getEvents`             | Returns the list of events           |
| GET    | `/getEventsByUserId/:id` | Returns the events planned for a user |
| POST   | `/addEvent`              | Adds/schedules a new event           |

Example `POST /addEvent` request:

```bash
curl --location --request POST 'http://localhost:3000/addEvent' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "joel",
    "userId": "3"
}'
```

## Folder Structure

```
.
├── .env.example                # Template for the env variables (copy to `.env`)
├── .nvmrc                      # NodeJS version (used by `nvm install`)
├── package.json                # List of dependencies and scripts
├── DevTask.md                  # Challenge description and tasks
├── index.js                    # Entry point: starts the mock and fastify servers
├── app.js                      # Builds the Fastify instance and wires up the different layers (routes, services and repositories)
├── config/
│   └── index.js                # Loads and validates environment variables (fails at startup if invalid)
├── routes/                     # Definition of endpoints
│   ├── user.routes.js
│   └── event.routes.js
├── services/                   # Business logic
│   ├── user.service.js
│   └── event.service.js
├── repositories/               # Data access, calls the external API (no business logic)
│   ├── user.repository.js
│   └── event.repository.js
├── mock-server/
│   ├── index.js                # MSW server mocking the external API
│   └── mocks/
│       └── user.json           # Static mock data
└── utils/
    └── logger.js               # Simple console-based logger
```

## Architecture

The code is split into three layers. Each one only talks to the layer directly below it:

```
routes -> services -> repositories -> external API
```

- **Routes** (`routes/`) are [Fastify plugins](https://fastify.dev/docs/latest/Reference/Plugins/). They read the request (params, body, etc.), call a **service** and return the result.
- **Services** (`services/`) hold the business logic, like generating the event `id`, combining a user with their events, etc.
- **Repositories** (`repositories/`) fetch data from the external API and return it.

Dependencies are passed in through factory functions (`createEventService({ eventRepository, userRepository })`) and wired together in `app.js`, then handed to each route plugin through its register options. This makes every layer easy to unit test by passing in mocks.

`app.js` only builds the app and `index.js` starts it. This follows Fastify's recommendation of separating the app from the server, so tests can build the app and use [`app.inject()`](https://fastify.dev/docs/latest/Guides/Testing/) without opening a real port.

## Dev Tasks Decisions

### 1. Configure and document the repository

- Env variables are configured to avoid duplication in strings which can lead to errors (typos).
- Layered architecture was implemented making this codebase more modular and easier to test, read and maintain. The use of factory functions and dependency injection in `app.js` allows for easy mocking of dependencies during testing.

### 2. Improve Performance

- Improved by simply using `Promise.all` instead of waiting inside the loop for every single event to be retrieved, this decision was made because the nature of `Promise.all` makes the promises to run concurrently, making it way faster.

> **Note:** This can be changed to a `Promise.allSettled` instead if we want to implement retries or, if we want to return all the events we can, regardless of some of them failing.