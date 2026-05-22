import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function validationError(error: ZodError) {
  const message = error.issues[0]?.message ?? "Invalid request";
  return jsonError(message, 422);
}
