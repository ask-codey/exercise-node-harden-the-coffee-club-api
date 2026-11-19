# Exercise: Harden the Coffee Club API

Exercise code for the lesson **Exercise: Harden the Coffee Club API** in the Node.js in Depth course on [ask-codey.com](https://www.ask-codey.com).

Bean There Coffee Club's API works: members sign in, read their own record and change their favorite roast. Before it goes online, you'll harden it in `app.js`: helmet's security headers, CORS for the club's own web pages only, a rate limit on sign-in, an allow-list of the fields a member may change, and a check that refuses an operator object in place of an email or password. Tests check every job.

## What's here

- `app.js`: the Express app, `export const app = express()`, with its routes already working. The comment at the top lists the routes and the five jobs to do. For you to finish.
- `data.js`: the club's three roasts and three members, kept in memory, and `resetData()`, which the tests use. Passwords are stored only as bcrypt hashes; each member's test password is in the comment at the top. Ready to use.
- `send-problem.js`: `sendProblem(res, status, detail)`, which sends the course's one error shape, `{ status, title, detail }`, as the lesson *Error Handling and Consistent Error Responses* builds it. Every error answer uses it. Ready to use.
- `auth.js`: `signToken(member)` and the `requireUser` middleware, which reads `Authorization: Bearer <token>`. The secret that signs tokens comes from the environment variable `JWT_SECRET`. Ready to use.
- `server.js`: checks that `JWT_SECRET` is set, then starts the API at `http://localhost:3100`. Ready to use.
- `.env.example`: the settings the API needs, with a placeholder instead of a secret. Copy it to `.env` (below).
- `coffee-club.http`: the requests to try, for VS Code's REST Client extension. Ready to use.
- `app.test.js` and `rate-limit.test.js`: tests that send requests to your app with Supertest and check each answer. The rate limit has a file of its own, so its count of tries starts from zero. You don't need to change these files.
- `package.json` and `package-lock.json`: the project's settings, its scripts (`start`, `dev` and `test`) and its packages at exact versions: Express, helmet, cors, express-rate-limit, bcryptjs and jsonwebtoken, and Supertest for the tests. Ready to use.
- `.gitignore`: keeps `node_modules` and your `.env` out of Git.

## Before you start

In VS Code's terminal, in this folder, install the packages:

```bash
npm install
```

Then make your own `.env` from `.env.example`. On Windows, in PowerShell:

```bash
Copy-Item .env.example .env
```

On macOS, in zsh:

```bash
cp .env.example .env
```

Open `.env` and replace the placeholder after `JWT_SECRET=` with a long random secret. This command prints one:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

`.env` is in `.gitignore`, so your secret stays on your computer. The tests don't need it: they set a secret of their own.

## Run it

```bash
npm start
```

The terminal says `The Coffee Club API is listening on http://localhost:3100` and keeps running. If it says `.env: not found` or `JWT_SECRET isn't set` instead, make your `.env` first (above). Open `coffee-club.http` and click **Send Request** above any request; REST Client shows the answer beside it. Stop the server with **Ctrl+C**.

`npm run dev` starts it with `node --watch`, so it restarts each time you save `app.js`. A restart also starts the rate limit's count again.

## Check your work

```bash
npm test
```

No server needs to be running: the tests hand each request straight to `app`. At first every test fails: that is expected. Each job you finish turns its tests green. A failing test's message says what came back, for example *The answer still says X-Powered-By: Express. helmet takes it away.*

## The rules

- Do every job in `app.js`. Don't change the other files: the tests use them as they are.
- Use the packages already in `package.json`: `helmet`, `cors` and `express-rate-limit`. There's nothing new to install.
- Keep every route answering as it does now. The tests sign Dana in and change her record to check that.
- Allow exactly the two origins in the comment. An origin is matched exactly, so `https://beanthere.example` and `https://www.beanthere.example` are two different origins.
- Put the rate limit on `POST /auth/sign-in` only, not on the whole API.
- Never put a real secret in a file that Git keeps. Your secret lives in `.env` only.

## Tips

- Order matters: `app.use` runs middleware in the order you add it, so add helmet and CORS before the routes.
- `cors` takes an `origin` option, and a list of origins is an allow-list: each origin in the list is answered with its own `Access-Control-Allow-Origin`, and any other gets none.
- `rateLimit` gives you a middleware. Put it between the path and the handler of one route to limit only that route, and give it a `handler`, `(req, res) => sendProblem(res, 429, "…")`, so the 429 has the same shape as every other error.
- Allow-list the fields: copy only `name` and `favoriteRoast` from the body to the member, and only when the body has them. Never copy the whole body.
- `typeof` tells text from an object: `typeof "dana@beanthere.example"` is `"string"`, and `typeof { $gt: "" }` is `"object"`. Check both fields before looking for the member.

## Hand it in

When it works, push your solution to a public repo of your own on GitHub, then paste that repo's address into **Submit your exercise** on the lesson page at [ask-codey.com](https://www.ask-codey.com). That's what completes the lesson. The lesson page shows the Git commands, step by step. Your `.env` stays behind: `.gitignore` keeps it out of the push.
