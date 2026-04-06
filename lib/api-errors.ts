import type { ZodError } from "zod";
import { ApiResponse } from "@/lib/api-response";

function isZodError(err: unknown): err is ZodError {
  return typeof err === "object" && err !== null && "issues" in err;
}

function isPostgrestError(err: unknown): err is {
  code?: string;
  message?: string;
} {
  if (typeof err !== "object" || err === null) return false;
  const anyErr = err as any;
  return "code" in anyErr && "message" in anyErr;
}

export function handleApiError(err: unknown) {
  if (isZodError(err)) {
    return ApiResponse.validationError(err);
  }

  if (isPostgrestError(err)) {
    const code = err.code;
    const status = code === "23505" ? 409 : 400;
    return ApiResponse.error(err.message ?? "Request failed", status);
  }

  const message = err instanceof Error ? err.message : "Internal Server Error";
  return ApiResponse.error(message, 500);
}

