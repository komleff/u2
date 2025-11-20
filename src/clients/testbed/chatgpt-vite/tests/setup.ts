// Setup file for tests running in Node.js environment
import { WebSocket } from 'ws';

// Polyfill WebSocket for Node.js environment
(global as any).WebSocket = WebSocket;
