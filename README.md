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
├── .env.example            # Template for the env variables (copy to `.env`)
├── .nvmrc                  # NodeJS version (used by `nvm install`)
├── package.json            # List of dependencies and scripts
├── DevTask.md              # Challenge description and tasks
├── config/
│   └── index.js            # Loads and validates environment variables (fails at startup if invalid)
├── mock-server/
│   ├── index.js            # MSW server mocking the external API
│   └── mocks/
│       └── user.json       # Static mock data
├── services/
│   └── index.js            # Fastify app entry point: server setup and all route handlers
└── utils/
    └── logger.js           # Simple console-based logger
```

> **Note:** All routes and their logic currently live in `services/index.js`. This will be refactored into separate layers (routes, services, repositories, etc.) in a further PR.
