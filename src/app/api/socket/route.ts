import { NextRequest } from "next/server";
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ noServer: true });

wss.on("connection", (ws) => {
  console.log("New WebSocket connection");

  ws.send(JSON.stringify({ message: "Hello from Next.js WebSocket!" }));

  ws.on("message", (data) => {
    console.log("Received message:", data.toString());

    // Echo back the message
    ws.send(JSON.stringify({ message: `Echo: ${data.toString()}` }));
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
  });
});

export async function GET(req: any) {
  if (!req.socket?.server?.wss) {
    req.socket.server.wss = wss;
  }

  return new Response(null, { status: 101 }); // 101 = Switching Protocols
}
