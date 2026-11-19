// Signing members in with tokens (JWT), as the chapter "Passwords and Signing In" built them.
// Ready to use: you don't need to change this file.
// The secret that signs every token comes from the environment variable JWT_SECRET, never from the code:
// npm start reads it from your .env file, and the tests set it themselves.
import jwt from "jsonwebtoken";
import { members } from "./data.js";
import { sendProblem } from "./send-problem.js";

export function signToken(member) {
  return jwt.sign({ sub: String(member.id), role: member.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
}

// Middleware for routes that need a signed-in member: it reads "Authorization: Bearer <token>",
// checks the token and puts the member in req.user, or answers 401, "Sign in first."
export function requireUser(req, res, next) {
  const header = req.get("Authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = members.find((m) => String(m.id) === payload.sub);
  } catch {
    req.user = undefined;
  }
  if (req.user === undefined) {
    sendProblem(res, 401, "Sign in first.");
    return;
  }
  next();
}
