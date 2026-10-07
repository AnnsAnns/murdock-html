import { useEffect, useRef } from 'react';
import { WS_URL } from '../api/config';
import type { SocketMessage } from '../types';

/**
 * Subscribe to Murdock's status WebSocket. Messages are `{ cmd, ... }` with
 * `reload`, `status` and `output` commands. Reconnects with backoff and keeps
 * the latest handler in a ref so callers don't need to memoise it.
 */
export function useMurdockSocket(onMessage: (message: SocketMessage) => void): void {
  const handler = useRef(onMessage);

  // Keep the latest handler without reconnecting on every render.
  useEffect(() => {
    handler.current = onMessage;
  });

  useEffect(() => {
    let socket: WebSocket | undefined;
    let closed = false;
    let attempt = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const connect = () => {
      socket = new WebSocket(WS_URL);

      socket.onopen = () => {
        attempt = 0;
      };

      socket.onmessage = (event) => {
        let message: SocketMessage;
        try {
          message = JSON.parse(event.data as string) as SocketMessage;
        } catch {
          return;
        }
        handler.current?.(message);
      };

      socket.onclose = () => {
        if (closed) return;
        attempt = Math.min(attempt + 1, 6);
        timer = setTimeout(connect, 500 * 2 ** (attempt - 1));
      };

      socket.onerror = () => socket?.close();
    };

    connect();

    return () => {
      closed = true;
      clearTimeout(timer);
      socket?.close();
    };
  }, []);
}
