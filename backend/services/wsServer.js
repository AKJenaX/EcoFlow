import { WebSocketServer } from 'ws';

let wss = null;

/**
 * Attach a WebSocket server to the given HTTP server instance.
 * Call this once after app.listen() returns the server.
 */
export function attachWebSocketServer(httpServer) {
  wss = new WebSocketServer({ server: httpServer });

  wss.on('connection', (ws) => {
    console.log('🔌 WebSocket client connected');
    ws.on('close', () => console.log('🔌 WebSocket client disconnected'));
    ws.on('error', (err) => console.error('WebSocket error:', err.message));
  });

  console.log('✅ WebSocket server attached');
  return wss;
}

/**
 * Broadcast a typed message to every connected WebSocket client.
 * @param {'BIN_UPDATE'|'ALERT_UPDATE'} type
 * @param {object} data
 */
export function broadcast(type, data) {
  if (!wss) return;
  const payload = JSON.stringify({ type, data });
  for (const client of wss.clients) {
    if (client.readyState === 1 /* OPEN */) {
      client.send(payload);
    }
  }
}
