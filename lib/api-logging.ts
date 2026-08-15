import "server-only";

export function createRequestContext(route: string) {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();

  return {
    requestId,
    log(status: number, extra: Record<string, unknown> = {}) {
      console.info(
        JSON.stringify({
          event: "api_request",
          requestId,
          route,
          status,
          durationMs: Date.now() - startedAt,
          ...extra
        })
      );
    }
  };
}
