import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import WinCheck, { NoTurns } from "./fun/WinCheck.js";

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
}

let map = new Map<string, Info>();
/**
 * this is for chaging turns
 * @param RoomId
 */
function ChangeTurns(RoomId: string) {
  map.get(RoomId).turn = map.get(RoomId).turn === "O" ? "X" : "O";
}

io.on("connection", (socket: Socket) => {
  /**
   * When someone room is created when this event triggered
   */
  socket.on("create-room", (name) => {
    let roomId = getNumber();
    map.set(roomId, {
      turn: "X",
      playerId: [socket.id],
      order: ["X", "O"],
      sucStart: 0,
      names: [undefined, undefined],
      wins: [0, 0],
    });
    socket.join(roomId);
    map.get(roomId).names[0] = name;
    socket.emit("room-joined", roomId);
  });
  /**
   * when somenoe joined this event get triggers
   */
  socket.on("join", (id: string, name) => {
    if (map.get(id)?.["playerId"].length < 2) {
      if (map.get(id)["playerId"].includes(socket.id)) {
        console.log("error");
        socket.emit("error", "Already Joined");
      } else {
        map.get(id)["playerId"].push(socket.id);
        map.get(id).names[1] = name;
        socket.emit("room-joined");
        socket.join(id);
        io.to(id).emit("start", map.get(id));
      }
    } else {
      socket.emit("error", "No More Space");
    }
  });
  /**
   * when game startes then this event is triggered
   */
  socket.on("start", (roomId, name) => {
    map.get(roomId).sucStart++;
    if (map.get(roomId).sucStart >= 2) {
      map.get(roomId).sucStart = 0;
      io.to(roomId).emit("turn", map.get(roomId).turn);
      ChangeTurns(roomId);
    }
  });
  socket.on("played", (prev, roomId) => {
    let Xwon = WinCheck(prev, "X");
    let Owon = WinCheck(prev, "O");
    let isDraw = NoTurns(prev);
    let order = map.get(roomId).order;

    if (Xwon) {
      let index = order[0] === "X" ? 0 : 1;
      map.get(roomId).wins[index]++;
      io.to(roomId).emit("play", prev);
      io.to(roomId).emit(
        "win",
        map.get(roomId).wins,
        map.get(roomId).names,
        map.get(roomId).names[index]
      );
    } else if (Owon) {
      let index = order[0] === "O" ? 0 : 1;
      map.get(roomId).wins[index]++;
      io.to(roomId).emit("play", prev);

      io.to(roomId).emit(
        "win",
        map.get(roomId).wins,
        map.get(roomId).names,
        map.get(roomId).names[index]
      );
    } else if (isDraw) {
      io.to(roomId).emit("win", "draw", map.get(roomId).wins, "___DRAW___");
      io.to(roomId).emit("play", prev);
    } else {
      io.to(roomId).emit("play", prev);
      io.to(roomId).emit("turn", map.get(roomId).turn);
      ChangeTurns(roomId);
    }
  });
  socket.on("close", (roomId) => {
    map.delete(roomId);
    io.to(roomId).emit("close");
    io.of("/").adapter.rooms.delete(roomId);
  });
  socket.on("another-match", (roomId) => {
    map.get(roomId).order = [
      map.get(roomId).order[1],
      map.get(roomId).order[0],
    ];
    map.get(roomId).turn = "X";
    io.to(roomId).emit("another-match");
    io.to(roomId).emit("play", ["", "", "", "", "", "", "", "", ""]);
    io.to(roomId).emit("start", map.get(roomId));
  });
});
// ["", "", "", "", "", "", "", "", ""]

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
