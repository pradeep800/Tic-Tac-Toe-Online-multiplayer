import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import WinCheck, { NoTurns } from "./fun/WinCheck.js";
const TimeOut = 10; //timeout for socket in minute
const app = express();
const server = http.createServer(app);
let couter = 0;
function getNumber() {
  let a = String(couter);
  couter++;
  return a;
}
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
interface Info {
  turn: "X" | "O" | undefined;
  playerId: string[];
  order: ["X" | "O", "O" | "X"];
  sucStart: number;
  names: [string | undefined, string | undefined];
  wins: [number, number];
  lastActivity: number;
}

let rooms = new Map<string, Info>();

function ChangeTurns(RoomId: string) {
  rooms.get(RoomId).turn = rooms.get(RoomId).turn === "O" ? "X" : "O";
}

io.on("connection", (socket: Socket) => {
  socket.on("create-room", (name) => {
    let roomId = getNumber();
    rooms.set(roomId, {
      turn: "X",
      playerId: [socket.id],
      order: ["X", "O"],
      sucStart: 0,
      names: [undefined, undefined],
      wins: [0, 0],
      lastActivity: Date.now(),
    });
    socket.join(roomId);
    rooms.get(roomId).names[0] = name;
    socket.emit("room-joined", roomId);
  });

  socket.on("join", (id: string, name) => {
    if (rooms.get(id)?.["playerId"].length < 2) {
      if (rooms.get(id)["playerId"].includes(socket.id)) {
        socket.emit("error", "Already Joined");
      } else {
        rooms.get(id)["playerId"].push(socket.id);
        rooms.get(id).names[1] = name;
        socket.emit("room-joined");
        socket.join(id);
        io.to(id).emit("start", rooms.get(id));
      }
    } else {
      socket.emit("error", "No More Space");
    }
  });

  socket.on("start", (roomId, name) => {
    rooms.get(roomId).sucStart++;
    if (rooms.get(roomId).sucStart >= 2) {
      rooms.get(roomId).sucStart = 0;
      io.to(roomId).emit("turn", rooms.get(roomId).turn);
      ChangeTurns(roomId);
    }
  });

  socket.on("played", (prev, roomId) => {
    rooms.get(roomId).lastActivity = Date.now();
    let Xwon = WinCheck(prev, "X");
    let Owon = WinCheck(prev, "O");
    let isDraw = NoTurns(prev);
    let order = rooms.get(roomId).order;

    if (Xwon) {
      let index = order[0] === "X" ? 0 : 1;
      rooms.get(roomId).wins[index]++;
      io.to(roomId).emit("play", prev);
      io.to(roomId).emit(
        "win",
        rooms.get(roomId).wins,
        rooms.get(roomId).names,
        rooms.get(roomId).names[index]
      );
    } else if (Owon) {
      let index = order[0] === "O" ? 0 : 1;
      rooms.get(roomId).wins[index]++;
      io.to(roomId).emit("play", prev);

      io.to(roomId).emit(
        "win",
        rooms.get(roomId).wins,
        rooms.get(roomId).names,
        rooms.get(roomId).names[index]
      );
    } else if (isDraw) {
      io.to(roomId).emit("win", "draw", rooms.get(roomId).wins, "___DRAW___");
      io.to(roomId).emit("play", prev);
    } else {
      io.to(roomId).emit("play", prev);
      io.to(roomId).emit("turn", rooms.get(roomId).turn);
      ChangeTurns(roomId);
    }
  });

  socket.on("close", (roomId) => {
    rooms.delete(roomId);
    io.to(roomId).emit("close");
    io.of("/").adapter.rooms.delete(roomId);
  });

  socket.on("another-match", (roomId) => {
    rooms.get(roomId).order = [
      rooms.get(roomId).order[1],
      rooms.get(roomId).order[0],
    ];
    rooms.get(roomId).turn = "X";
    io.to(roomId).emit("another-match");
    io.to(roomId).emit("play", ["", "", "", "", "", "", "", "", ""]);
    io.to(roomId).emit("start", rooms.get(roomId));
  });
});
/**
 * setinterval check in every 1 minute if there is some room which is not active it delete them and emit close event
 */
setInterval(() => {
  let ThisPoint = Date.now();
  for (let [roomId, room] of rooms) {
    if (ThisPoint - room.lastActivity > TimeOut * 60 * 1000) {
      rooms.delete(roomId);
      io.to(roomId).emit("close");
      io.of("/").adapter.rooms.delete(roomId);
    }
  }
}, 60 * 1000);
const PORT = 8000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
