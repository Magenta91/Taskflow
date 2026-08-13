import type { NextFunction, Request, Response } from "express";
import { ValidationError, NotFoundError } from "../types";

/**
 * Central error handler. Every controller just throws; this is the one
 * place that decides what status code and shape goes back to the client.
 * Keeps "how do we tell the frontend something went wrong" consistent, so
 * the frontend can rely on always getting { error: string }.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message });
  }
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message });
  }

  console.error("Unexpected error:", err);
  return res.status(500).json({ error: "Something went wrong on our end. Please try again." });
}

// Wraps async route handlers so thrown/rejected errors reach errorHandler
// instead of crashing the process or hanging the request.
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
