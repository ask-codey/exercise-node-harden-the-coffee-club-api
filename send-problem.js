// sendProblem: the course's one error shape, from the lesson Error Handling and Consistent Error Responses.
// Every error this API sends is { status, title, detail }, plus problems for a body that breaks the rules.
// Ready to use: you don't need to change this file.
import { STATUS_CODES } from "node:http";

export function sendProblem(res, status, detail, problems) {
  const body = { status, title: STATUS_CODES[status], detail };
  if (problems !== undefined) {
    body.problems = problems;
  }
  res.status(status).json(body);
}
