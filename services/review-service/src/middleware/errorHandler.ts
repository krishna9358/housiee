import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ApiError, createApiResponse } from "@marketplace/utils";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err);

  if (err instanceof ApiError) {
    return res
      .status(err.statusCode)
      .json(createApiResponse(false, undefined, undefined, err.message));
  }

  if (err instanceof ZodError) {
    return res.status(400).json(
      createApiResponse(
        false,
        undefined,
        undefined,
        err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")
      )
    );
  }

  return res
    .status(500)
    .json(createApiResponse(false, undefined, undefined, "Internal server error"));
}
