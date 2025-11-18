import { NetworkClient } from './src/network/NetworkClient';
import type { PlayerInputProto, WorldSnapshotProto } from './src/network/proto/ecs';

// Test NetworkClient connection to WebSocket relay
console.log('=== M2.3 NetworkClient WebSocket Test ===');

const client = new NetworkClient({
  serverUrl: 'ws://localhost:8080/',
  inputRateHz: 30,
  onSnapshot: (snapshot: WorldSnapshotProto) => {
    console.log('📥 Snapshot received:', {
      serverTick: snapshot.serverTick,
      entities: snapshot.entities?.length || 0,
    });
  },
  onConnectionStateChange: (connected: boolean) => {
    console.log(connected ? '✅ Connected' : '❌ Disconnected');
  },
  onError: (error: Error) => {
    console.error('❌ Error:', error.message);
  },
});

console.log('Connecting to ws://localhost:8080/...');
client.connect()
  .then(() => {
    console.log('✅ Connection established');
    
    // Send test input after 1 second
    setTimeout(() => {
      console.log('📤 Sending test input...');
      const testInput: PlayerInputProto = {
        clientTick: 1,
        thrust: 0.5,
        yaw: 0.0,
      };
      
      const sent = client.sendInput(testInput);
      console.log(sent ? '✅ Input sent' : '⚠️ Input rate-limited');
    }, 1000);
  })
  .catch((err) => {
    console.error('❌ Connection failed:', err);
  });

// Prevent process exit
console.log('Waiting for WebSocket events (Ctrl+C to exit)...');
