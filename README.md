# Deeniyat Maktab Portal

The portal is split into two independently deployable applications:

- [`client/`](./client/): React, Vite, and Redux Toolkit frontend.
- [`server/`](./server/): Express API and the existing SQLite database.

Use Node.js 22.13 or later for the server's built-in `node:sqlite` module.

## Develop locally

Run each app in a separate terminal:

```sh
cd server
npm install
npm run dev
```

```sh
cd client
npm install
npm run dev
```

The client runs on `http://localhost:5173` and proxies `/api` requests to the
server at `http://localhost:3001`.

## Deploy separately

Build the client from `client/` using `npm install` and `npm run build`. Deploy
the generated `client/dist/` files to a static hosting provider with SPA
fallback enabled. Set `VITE_API_URL` to the public server origin at build time.

Deploy `server/` as a Node.js application using `npm install` and `npm start`.
Configure `CLIENT_URL` to the deployed client origin, and configure
`DATABASE_PATH` to a persistent writable SQLite location. The host must support
Node.js 22.13 or later and persistent disk storage.

## Environment and credentials

Each application has a local `.env` and a committed `.env.example`. Local
`.env` files are ignored by Git. The frontend's `VITE_*` variables are embedded
in the public client bundle; never put secrets or private tokens there.

This application currently does not use API-token authentication, so no token
is required. If the API is exposed publicly, add an authentication mechanism
before deployment.
