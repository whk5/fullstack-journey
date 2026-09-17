import { WebSocketServer } from 'ws';

const port = 8080;
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', ws => {
  console.log('Client connected');
  ws.on('message', data => {
    console.log('Message from client:', data.toString());
    ws.send('Hello Client!');
  });
  ws.on('close', () => console.log('Client disconnected'));
});

console.log(`WS server listening on ws://localhost:${port}`);