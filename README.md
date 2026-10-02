# Deeniyat Maktab Portal

Responsive student attendance and fee-management portal built with React, Vite,
Redux Toolkit, Express, and SQLite.

## Requirements

- Node.js 22.13 or later (the backend uses Node's built-in `node:sqlite` module)
- npm

## Run locally

```sh
npm install
npm run dev
```

Open the Vite URL printed in the terminal. The development server proxies `/api`
requests to the Express API on port 3001.

## Production

```sh
npm run build
npm start
```

The Express server serves the built React application and its API on port 3001.
Set `PORT` to use another port.

## Database

The API opens the existing `database.db` file in the project root. It retains
the current `students`, `attendance_records`, and `fees_records` tables and
creates any missing tables without replacing existing records. To use another
SQLite file, set `DATABASE_PATH` to its path before starting the server.

CSV imports expect a header row followed by `sr,name,class,mobile` columns.
