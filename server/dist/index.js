import express from "express";
import http from "http";
import { Server } from "socket.io";
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
let rooms = new Map();
/**
 * this is for chaging turns
 *
 */
function ChangeTurns(RoomId) {
    rooms.get(RoomId).turn = rooms.get(RoomId).turn === "O" ? "X" : "O";
}
io.on("connection", (socket) => {
    /**
     * When someone room is created when this event triggered
     */
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
    /**
     * when somenoe joined this event get triggers
     */
    socket.on("join", (id, name) => {
        if (rooms.get(id)?.["playerId"].length < 2) {
            if (rooms.get(id)["playerId"].includes(socket.id)) {
                socket.emit("error", "Already Joined");
            }
            else {
                rooms.get(id)["playerId"].push(socket.id);
                rooms.get(id).names[1] = name;
                socket.emit("room-joined");
                socket.join(id);
                io.to(id).emit("start", rooms.get(id));
            }
        }
        else {
            socket.emit("error", "No More Space");
        }
    });
    /**
     * when game startes then this event is triggered
     */
    socket.on("start", (roomId, name) => {
        rooms.get(roomId).sucStart++;
        if (rooms.get(roomId).sucStart >= 2) {
            rooms.get(roomId).sucStart = 0;
            io.to(roomId).emit("turn", rooms.get(roomId).turn);
            ChangeTurns(roomId);
        }
    });
    /**
     * when player played his turned it will check if it is winning codition or it will wil chance to another player
     */
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
            io.to(roomId).emit("win", rooms.get(roomId).wins, rooms.get(roomId).names, rooms.get(roomId).names[index]);
        }
        else if (Owon) {
            let index = order[0] === "O" ? 0 : 1;
            rooms.get(roomId).wins[index]++;
            io.to(roomId).emit("play", prev);
            io.to(roomId).emit("win", rooms.get(roomId).wins, rooms.get(roomId).names, rooms.get(roomId).names[index]);
        }
        else if (isDraw) {
            io.to(roomId).emit("win", "draw", rooms.get(roomId).wins, "___DRAW___");
            io.to(roomId).emit("play", prev);
        }
        else {
            io.to(roomId).emit("play", prev);
            io.to(roomId).emit("turn", rooms.get(roomId).turn);
            ChangeTurns(roomId);
        }
    });
    /**
     * When we Want  to close this socket
     * it will remove it from memory and close from all device which are connected to this room
     */
    socket.on("close", (roomId) => {
        rooms.delete(roomId);
        io.to(roomId).emit("close");
        io.of("/").adapter.rooms.delete(roomId);
    });
    /**
     * when you have to reset your board  and start again
     */
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
 * It every 1 minnute if there is some room with are in active for Timout time
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
//# sourceMappingURL=index.js.map