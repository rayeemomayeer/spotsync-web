type UnauthorizedHandler = (ctx: { hadBearer: boolean }) => void;

let onUnauthorized: UnauthorizedHandler | null = null;

export function registerUnauthorizedHandler(handler: UnauthorizedHandler): void {
  onUnauthorized = handler;
}

export function notifyUnauthorized(ctx: { hadBearer?: boolean } = {}): void {
  onUnauthorized?.({ hadBearer: !!ctx.hadBearer });
}
