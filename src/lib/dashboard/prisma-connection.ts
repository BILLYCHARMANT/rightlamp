/** Prisma codes where the client could not use the database (host down, timeout, etc.). */
const CONNECTION_LIKE_CODES = new Set([
  "P1001", // Can't reach database server
  "P1002", // Connection timeout
  "P1017", // Server closed the connection
]);

export function isPrismaConnectionError(e: unknown): boolean {
  if (typeof e !== "object" || e === null) return false;
  const code = (e as { code?: string }).code;
  return typeof code === "string" && CONNECTION_LIKE_CODES.has(code);
}
