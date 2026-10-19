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

3. Run the project:

```bash
npm start
```

The API is available at `http://localhost:3000`.

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
├── .nvmrc                  # NodeJS version (used by `nvm install`)
├── package.json            # List of dependencies and scripts
├── DevTask.md              # Challenge description and tasks
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
