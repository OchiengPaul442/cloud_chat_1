// ********************************************************************************* //
// listens for connections by other ports and forwards messages 
// ********************************************************************************* //
const WebSocket = require('ws');

const chat1Port = 8080;  // port for first chat application
const chat2Port = 8081;  // port for second chat application

// Create a server that listens for websocket connections on chat1Port
const chat1Server = new WebSocket.Server({ port: chat1Port });

// When a connection is received on chat1Server, create a new websocket connection to chat2Port
chat1Server.on('connection', (ws) => {
  const chat2Client = new WebSocket(`ws://localhost:${chat2Port}`);

  // When a message is received on chat1Server, forward it to chat2Client
  ws.on('message', (message) => {
    chat2Client.send(message);
  });

  // When a message is received on chat2Client, forward it to chat1Server
  chat2Client.on('message', (message) => {
    ws.send(message);
  });

  // When the connection to chat2Client is closed, close the connection to chat1Server
  chat2Client.on('close', () => {
    ws.close();
  });
});