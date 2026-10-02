# Deeniyat Maktab API

Standalone Express API backed by the existing SQLite database in this folder.

## Requirements

- Node.js 22.13 or later (`node:sqlite` is built into Node)
- npm

## Run

```sh
npm install
npm run dev
```

The API listens on `http://localhost:3001` by default. Set `PORT` in `.env` to
change the port.

## Environment

Copy `.env.example` to `.env` and configure:

- `PORT`: HTTP port for this API.
- `DATABASE_PATH`: SQLite file path, relative to this folder unless absolute.
- `CLIENT_URL`: allowed frontend origin; multiple origins can be comma-separated.

The current app has no API-token authentication. Do not add a fake token;
configure authentication before making this API public if required.

## Database

`database.db` is the original application database. Back it up before deploying
or pointing `DATABASE_PATH` at another file. Production deployments must use
persistent writable storage for the SQLite database.

`GET /api/health` returns the API health status.
