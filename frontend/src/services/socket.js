/**
 * Singleton WebSocket client for EcoFlow real-time updates.
 * Opens one connection and exposes onMessage(handler) / disconnect().
 * Auto-reconnects on close with a 3-second delay.
 */

const WS_URL =
  (import.meta.env.VITE_API_URL || 'http://localhost:3000')
    .replace(/^http/, 'ws');

let socket = null;
const handlers = new Set();
let reconnectTimer = null;
let manuallyDisconnected = false;

function connect() {
  if (socket && socket.readyState === WebSocket.OPEN) return;

  socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log('[WS] Connected');
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  socket.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      handlers.forEach((fn) => fn(msg));
    } catch {
      // ignore malformed frames
    }
  };

  socket.onerror = (err) => {
    console.warn('[WS] Error', err);
  };

  socket.onclose = () => {
    console.log('[WS] Disconnected');
    if (!manuallyDisconnected) {
      reconnectTimer = setTimeout(connect, 3000);
    }
  };
}

/** Register a message handler. Returns an unsubscribe function. */
export function onMessage(handler) {
  handlers.add(handler);
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    connect();
  }
  return () => handlers.delete(handler);
}

/** Permanently close the WebSocket and stop reconnecting. */
export function disconnect() {
  manuallyDisconnected = true;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (socket) {
    socket.close();
    socket = null;
  }
}
