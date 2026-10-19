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

5. Run the tests (uses Node's built-in [test runner](https://nodejs.org/api/test.html), no extra dependency):

```bash
npm test
```

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
    ├── circuit-breaker.js      # Generic circuit breaker used to protect calls to the external API
    ├── enums.js                # Custom enums (For now, just circuit breaker states)
    ├── errorHandler.js         # Generic error handler for the whole app, here we can verify the type of error and act appropriately
    ├── errors.js               # Custom errors (ExternalServiceError)
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

### 3. Improve Resilience

`POST /addEvent` is protected by a custom circuit breaker (`utils/circuit-breaker.js`)

- **Detecting failures:** while `CLOSED`, the time of each failure is kept in a 30s sliding window. A third failure inside the window opens up the circuit. Only 5xx responses, network errors and timeouts (5s, via `AbortSignal.timeout`) count. A 4xx means the client sent a bad request, not that the service is down.
- **Reducing load (backoff):** while `OPEN`, requests are rejected immediately without calling the external API. The wait before the next test request starts at 1s, doubles after each failed test request (1s and 2s for this challenge, we don't want to wait longer).
- **Recovering:** once the wait is over, the circuit goes `HALF_OPEN` and lets **one** test request through. Other requests are still rejected while it runs. If it succeeds, the circuit closes and the wait resets to 1s; if it fails, the circuit opens again with a longer wait.
- **Error responses** (mapped in `app.setErrorHandler`, so services and repositories don't deal with HTTP status codes):

| Situation                                        | Status | Response                                                     |
| ------------------------------------------------ | ------ | ------------------------------------------------------------ |
| Circuit open (rejected without calling the API)  | `503`  | `Retry-After` header + `{ error, message, retryAfter }`      |
| External API failed (5xx, network, timeout)      | `502`  | `{ error, message }`                                         |

Other decisions:

- **Bug fix:** the repository used to return the external API's body regardless of the status code, so a `503` from the API reached clients as a `200` with `{ success: false }`. It now throws an `ExternalServiceError` for non-2xx responses.
- **The breaker wraps the repository call** (`eventRepository.addEvent`), since it protects one external dependency; the service is unchanged. The breaker instance is created in `app.js` and injected into the repository, like the other dependencies.
- **No automatic per-request retries:** retrying a failed request straight away sends more traffic to a service that is already overloaded. Here the backoff is the growing wait, and the "retry" is the single test request in `HALF_OPEN`.

> **Limitation:** the circuit state lives in the memory of one process. If the app runs on several instances, each one needs its own circuit breaker.
