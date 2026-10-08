# Deeniyat Maktab Client

Standalone React, Vite, and Redux Toolkit frontend.

```sh
npm install
npm run dev
npm run build
```

Configure `.env` before development or production builds:

- `VITE_API_URL`: public API origin used by the production client, without an
  `/api` suffix. Set this to the backend origin for deployment.
- `VITE_API_PROXY_TARGET`: backend origin used by the Vite development proxy.

Vite exposes `VITE_*` values to browsers. Do not store secret tokens in this
file. The API currently does not require a token.
