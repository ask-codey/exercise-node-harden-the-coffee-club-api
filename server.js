// Starts the Coffee Club API at http://localhost:3100, using the app in app.js.
// Run it with: npm start (or npm run dev, which restarts it each time you save). Stop it with Ctrl+C.
// npm start reads your settings from .env first (node --env-file=.env), so copy .env.example to .env before the
// first start. Ready to use: you don't need to change this file.
import { app } from "./app.js";

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET isn't set. Copy .env.example to .env, put a long random secret in it, and start again.");
  process.exit(1);
}

const port = 3100;

app.listen(port, () => {
  console.log(`The Coffee Club API is listening on http://localhost:${port}`);
});
