// Tests for jobs 1, 2, 4 and 5 in app.js. Run every test with: npm test (run npm install once first).
// Each test sends requests to your app with Supertest and checks the answer: its status code, its headers and its
// JSON body. No server needs to be running, and no port is used. The rate limit (job 3) has its own file,
// rate-limit.test.js, so its count of sign-in tries starts from zero.
// You don't need to change this file.
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "./app.js";
import { resetData, members } from "./data.js";
import { signToken } from "./auth.js";

// The tests sign their own tokens, with a secret that's only for the tests. npm start reads yours from .env.
process.env.JWT_SECRET = "only-for-the-tests";

beforeEach(() => {
  resetData();
});

const dana = () => members.find((m) => m.email === "dana@beanthere.example");
const danasToken = () => `Bearer ${signToken(dana())}`;

test("1) GET /roasts answers 200 with helmet's headers: Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options nosniff and X-Frame-Options SAMEORIGIN", async () => {
  const response = await request(app).get("/roasts");
  assert.equal(response.status, 200, `GET /roasts should still answer 200, but it answered ${response.status}.`);
  assert.equal(response.body.length, 3, "GET /roasts should still answer with the club's 3 roasts.");
  for (const header of ["content-security-policy", "strict-transport-security"]) {
    assert.ok(response.headers[header], `The answer should carry the header ${header}, which helmet adds. It has none.`);
  }
  assert.equal(response.headers["x-content-type-options"], "nosniff",
    "The answer should carry X-Content-Type-Options: nosniff, which helmet adds.");
  assert.equal(response.headers["x-frame-options"], "SAMEORIGIN",
    "The answer should carry X-Frame-Options: SAMEORIGIN, which helmet adds.");
});

test("2) GET /roasts sends no X-Powered-By header", async () => {
  const response = await request(app).get("/roasts");
  assert.equal(response.headers["x-powered-by"], undefined,
    `The answer still says X-Powered-By: ${response.headers["x-powered-by"]}. helmet takes it away.`);
});

test("3) GET /roasts from https://www.beanthere.example gets Access-Control-Allow-Origin: https://www.beanthere.example, and from https://coffee-deals.example gets none", async () => {
  const club = await request(app).get("/roasts").set("Origin", "https://www.beanthere.example");
  assert.equal(club.headers["access-control-allow-origin"], "https://www.beanthere.example",
    `The club's page should be allowed, but Access-Control-Allow-Origin was ${club.headers["access-control-allow-origin"] ?? "missing"}.`);
  const other = await request(app).get("/roasts").set("Origin", "https://coffee-deals.example");
  assert.equal(other.headers["access-control-allow-origin"], undefined,
    `Another site's page should get no Access-Control-Allow-Origin header, but it got ${other.headers["access-control-allow-origin"]}.`);
});

test("4) GET /roasts from https://beanthere.example (no www) gets Access-Control-Allow-Origin: https://beanthere.example", async () => {
  const response = await request(app).get("/roasts").set("Origin", "https://beanthere.example");
  assert.equal(response.headers["access-control-allow-origin"], "https://beanthere.example",
    `https://beanthere.example is a different origin from https://www.beanthere.example, and both are allowed. Access-Control-Allow-Origin was ${response.headers["access-control-allow-origin"] ?? "missing"}.`);
});

test("5) A preflight, OPTIONS /members/me from https://www.beanthere.example asking for PATCH, answers 204 and allows PATCH", async () => {
  const response = await request(app)
    .options("/members/me")
    .set("Origin", "https://www.beanthere.example")
    .set("Access-Control-Request-Method", "PATCH")
    .set("Access-Control-Request-Headers", "authorization,content-type");
  assert.equal(response.status, 204, `The preflight should answer 204, but it answered ${response.status}.`);
  assert.equal(response.headers["access-control-allow-origin"], "https://www.beanthere.example",
    "The preflight's answer should allow the club's origin.");
  assert.match(response.headers["access-control-allow-methods"] ?? "(none)", /PATCH/,
    "The preflight's Access-Control-Allow-Methods should include PATCH.");
});

test("6) PATCH /members/me with favoriteRoast \"Night Owl\", role \"admin\" and cupsLeft 999 changes only the roast: Dana stays a member with 4 cups", async () => {
  const response = await request(app)
    .patch("/members/me")
    .set("Authorization", danasToken())
    .send({ favoriteRoast: "Night Owl", role: "admin", cupsLeft: 999 });
  assert.equal(response.status, 200, `PATCH /members/me should answer 200, but it answered ${response.status}.`);
  assert.equal(response.body.favoriteRoast, "Night Owl", "favoriteRoast is allowed, so it should change to Night Owl.");
  assert.equal(response.body.role, "member", `role isn't allowed, so Dana should stay a "member", but she became "${response.body.role}".`);
  assert.equal(response.body.cupsLeft, 4, `cupsLeft isn't allowed, so it should stay 4, but it became ${response.body.cupsLeft}.`);
  assert.equal(dana().role, "member", "The stored member should keep role \"member\" too, not only the answer.");
});

test("7) PATCH /members/me with name \"Dana R.\", favoriteRoast \"Sunrise Blend\" and a new email changes the name and the roast, and keeps the email", async () => {
  const response = await request(app)
    .patch("/members/me")
    .set("Authorization", danasToken())
    .send({ name: "Dana R.", favoriteRoast: "Sunrise Blend", email: "someone-else@beanthere.example" });
  assert.equal(response.status, 200, `PATCH /members/me should answer 200, but it answered ${response.status}.`);
  assert.equal(response.body.name, "Dana R.", "name is allowed, so it should change to Dana R.");
  assert.equal(response.body.favoriteRoast, "Sunrise Blend", "favoriteRoast is allowed, so it should change to Sunrise Blend.");
  assert.equal(response.body.email, "dana@beanthere.example",
    `email isn't allowed, so it should stay dana@beanthere.example, but it became ${response.body.email}.`);
});

test("8) POST /auth/sign-in with the email { \"$gt\": \"\" } answers 400 \"Email and password must be text.\", and Dana's real sign-in still answers 200", async () => {
  const attack = await request(app)
    .post("/auth/sign-in")
    .send({ email: { $gt: "" }, password: "dana-test-password" });
  assert.equal(attack.status, 400, `An email that's an object should answer 400, but it answered ${attack.status}.`);
  assert.deepEqual(attack.body, { status: 400, title: "Bad Request", detail: "Email and password must be text." });
  const real = await request(app)
    .post("/auth/sign-in")
    .send({ email: "dana@beanthere.example", password: "dana-test-password" });
  assert.equal(real.status, 200, `Dana's real email and password should still sign her in (200), but the answer was ${real.status}.`);
  assert.equal(typeof real.body.token, "string", "A real sign-in should still answer with a token.");
});

test("9) POST /auth/sign-in with the password { \"$gt\": \"\" } answers 400 \"Email and password must be text.\"", async () => {
  const response = await request(app)
    .post("/auth/sign-in")
    .send({ email: "dana@beanthere.example", password: { $gt: "" } });
  assert.equal(response.status, 400, `A password that's an object should answer 400, but it answered ${response.status}.`);
  assert.deepEqual(response.body, { status: 400, title: "Bad Request", detail: "Email and password must be text." });
});
