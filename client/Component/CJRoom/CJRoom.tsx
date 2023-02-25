//create and Join room
import { FormEvent, useEffect, useRef } from "react";
import { useState } from "react";
import style from "./CJRoom.module.css";
import { io } from "socket.io-client";
import { useGameStore, useProfileInfo } from "@/lib/store";
import { Const } from "@/lib/const";
export default function CJRoom() {
  const [clicked, setClicked] = useState(false);
  const [error, setError] = useState(false);
  const name = useProfileInfo((state) => state.getName)();
  const setIO = useGameStore((state) => state.setIO);
  const setRoomId = useGameStore((state) => state.setRoomId);
  const inputEle = useRef<HTMLInputElement>(null);

  function Join(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    if (!clicked) {
      setClicked(true);
      try {
        const socket = io(Const.url);
        socket.on("connect", () => {
          let roomId = inputEle.current?.value;
          socket.emit("join", roomId, name);
          socket.on("room-joined", () => {
            setIO(socket);
            setRoomId(roomId as string);
            socket.off();
          });
          socket.on("error", (message) => {
            setError(true);
            setClicked(false);
          });
        });
      } catch (err) {
        setClicked(false);
        setError(true);
      }
    }
  }
  function Create(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    if (!clicked) {
      try {
        let socket = io(Const.url);
        socket.on("connect", () => {
          socket.emit("create-room", name);
          socket.on("room-joined", (roomId) => {
            setIO(socket);
            setRoomId(roomId);
            socket.off();
          });
          socket.on("error", (message) => {
            setError(true);
            setClicked(false);
          });
        });
      } catch (err) {
        setClicked(false);
        setError(true);
      }
    }
  }
  return (
    <div className={`${style.main}`}>
      <div className={`${style.form}`}>
        <button onClick={Create} style={{ marginBottom: "30px" }}>
          Create Room
        </button>
        <label style={{ marginBottom: "10px" }}>Join Room</label>
        <input ref={inputEle} style={{ marginBottom: "5px" }} />
        <button onClick={Join}>Join</button>
        {error && <div>there is Some kind of Error</div>}
      </div>
    </div>
  );
}
