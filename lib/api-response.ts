import { NextResponse } from "next/server";
import { ZodError } from "zod";

export const ApiResponse = {
  success<T>(data: T, status = 200) {
    return NextResponse.json(
      {
        success: true,
        data
      },
      { status }
    );
  },

  error(message: string, status: number, details?: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: message,
        ...(details ? { details } : {})
      },
      { status }
    );
  },

  validationError(error: ZodError) {
    const flattened = error.flatten();
    return NextResponse.json(
      {
        success: false,
        error: "Validation failed",
        details: flattened.fieldErrors
      },
      { status: 422 }
    );
  }
};

