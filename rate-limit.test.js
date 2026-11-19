// The test for job 3 in app.js, the rate limit on sign-in. Run every test with: npm test.
// node --test runs each test file on its own, so this file's app starts with no sign-in tries counted.
// You don't need to change this file.
import { test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "./app.js";

process.env.JWT_SECRET = "only-for-the-tests";

test("10) Five wrong sign-ins answer 401, the sixth answers 429 \"Too many sign-in attempts. Try again in 15 minutes.\", and GET /roasts still answers 200", async () => {
  for (let attempt = 1; attempt <= 5; attempt++) {
    const response = await request(app)
      .post("/auth/sign-in")
      .send({ email: "dana@beanthere.example", password: `guess-${attempt}` });
    assert.equal(response.status, 401, `Wrong try ${attempt} of 5 should answer 401, but it answered ${response.status}.`);
  }
  const sixth = await request(app)
    .post("/auth/sign-in")
    .send({ email: "dana@beanthere.example", password: "guess-6" });
  assert.equal(sixth.status, 429, `The sixth try in 15 minutes should answer 429, but it answered ${sixth.status}.`);
  assert.deepEqual(sixth.body, { status: 429, title: "Too Many Requests", detail: "Too many sign-in attempts. Try again in 15 minutes." });
  const roasts = await request(app).get("/roasts");
  assert.equal(roasts.status, 200,
    `The limit is for sign-in only, so GET /roasts should still answer 200, but it answered ${roasts.status}.`);
});
