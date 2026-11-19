// The Coffee Club API. It works, and it's about to go online: for you to harden.
//
// The routes already work:
//   GET   /roasts          200, every roast in data.js (anyone may ask)
//   POST  /auth/sign-in    200, { "token": "..." } for a right email and password
//                          401, "Wrong email or password." otherwise
//   GET   /members/me      200, the signed-in member (send "Authorization: Bearer <token>"); 401 without a token
//   PATCH /members/me      200, the signed-in member after the change
//
// Every error answer has the course's one error shape, { status, title, detail }, sent with sendProblem from
// send-problem.js: sendProblem(res, 401, "Wrong email or password.") answers
//   401, { "status": 401, "title": "Unauthorized", "detail": "Wrong email or password." }
// so each error here is its status and its detail; the title is that status's name.
//
// Harden it before it goes online:
//   1. helmet: every answer carries helmet's security headers, and none says X-Powered-By.
//   2. CORS: only the club's web pages, https://www.beanthere.example and https://beanthere.example, may call the
//      API from a browser. A page from any other origin gets no Access-Control-Allow-Origin header.
//   3. A rate limit on POST /auth/sign-in only: 5 tries per 15 minutes from one address, then
//      429, "Too many sign-in attempts. Try again in 15 minutes."
//   4. PATCH /members/me changes only name and favoriteRoast. Any other field in the body, such as role,
//      cupsLeft or email, is ignored.
//   5. POST /auth/sign-in answers 400, "Email and password must be text.", when the email or the password isn't a
//      string (an operator object such as { "$gt": "" }, say), before it looks for the member.
//
// For now, the routes work but none of the five jobs is done: every test fails until its job is.
import express from "express";
import bcrypt from "bcryptjs";
import { roasts, members, publicMember } from "./data.js";
import { sendProblem } from "./send-problem.js";
import { signToken, requireUser } from "./auth.js";

export const app = express();

app.use(express.json());

app.get("/roasts", (req, res) => {
  res.json(roasts);
});

app.post("/auth/sign-in", async (req, res) => {
  const { email, password } = req.body ?? {};
  const member = members.find((m) => m.email === email);
  const matches = member !== undefined && (await bcrypt.compare(password, member.passwordHash));
  if (!matches) {
    sendProblem(res, 401, "Wrong email or password.");
    return;
  }
  res.json({ token: signToken(member) });
});

app.get("/members/me", requireUser, (req, res) => {
  res.json(publicMember(req.user));
});

app.patch("/members/me", requireUser, (req, res) => {
  Object.assign(req.user, req.body);
  res.json(publicMember(req.user));
});
