import { useEffect, useState } from "react";
import { useGameStore, useProfileInfo } from "@/lib/store";
import style from "./Board.module.css";
interface Info {
  board: string[];
  turn: "X" | "O" | undefined;
  playerId: string[];
  order: ["X" | "O", "O" | "X"];
  names: [string | undefined, string | undefined];
  wins: [number, number];
}
export default function Board() {
  const [board, setBoard] = useState(["", "", "", "", "", "", "", "", ""]);
  const [winner, setWinner] = useState<string>("");
  const [start, setStart] = useState(false);
  const [scoreBoard, setScoreboard] = useState<
    [[string | undefined, string | undefined], [number, number]]
  >([
    [undefined, undefined],
    [0, 0],
  ]);
  const {
    IO,
    setIO,
    roomId,
    setRoomId,
    setYourMark,
    yourMark,
    setYourTurn,
    yourTurn,
  } = useGameStore();
  const name = useProfileInfo((state) => {
    return state.getName;
  });

  /**
   * When we want to leave room
   */
  function CloseRoom() {
    IO?.emit("close", roomId);
  }

  useEffect(() => {
    /**
     * It will trigger when both player joined the room
     */
    IO?.on("start", (obj: Info) => {
      setStart(true);
      setScoreboard([obj.names, obj.wins]);

      let i = 0;
      obj["playerId"].forEach((ele, index) => {
        if (ele === IO.id) {
          i = index;
        }
      });
      setYourMark(obj["order"][i]);
      IO.emit("start", roomId, name());
    });
    /**
     * It will trigger when  we want to close the room
     */
    IO?.on("close", reset);

    /**
     * It is use for deciding turns
     */
    IO?.on("turn", (s) => {
      if (s === yourMark) {
        setYourTurn(true);
      } else {
        setYourTurn(false);
      }
    });

    /**
     * When one player win or draw the game
     */
    IO?.on("win", (winboard, names, winner) => {
      if (winner !== "___DRAW___") setScoreboard([names, winboard]);

      setWinner(winner);
    });

    /**
     * when player played their move (for both  player)
     */
    IO?.on("play", (s) => {
      setBoard(s);
    });
    /**
     * Another Match
     */
    IO?.on("another-match", () => {
      setWinner("");
    });
    return () => {
      IO?.off();
    };
  }, [yourMark, board, IO, roomId, yourTurn, winner]);
  /**
   * Reset
   */
  function reset() {
    setYourTurn(false);
    setScoreboard([
      [undefined, undefined],
      [0, 0],
    ]);
    IO?.disconnect();
    setIO(undefined);
    setWinner("");
    setBoard(["", "", "", "", "", "", "", "", ""]);
    setRoomId(undefined);
  }

  /**
   * this function is excuted when we click on square
   */
  function EventDeligation(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    let a: HTMLDivElement = e.target as HTMLDivElement;
    let data_id_str = a.getAttribute("data-id");
    let data_id: number | undefined;
    if (data_id_str && yourTurn) {
      setYourTurn(false);
      let selected = document.querySelector(
        `[data-id='${data_id_str}']`
      ) as Element;
      data_id = !isNaN(Number(data_id_str)) ? Number(data_id_str) : undefined;
      let prev = board;
      if (data_id !== undefined) prev[data_id] = yourMark as string;
      /**
       * when player played the move and then server emit play event with prev array
       */
      IO?.emit("played", prev, roomId);
    }
  }
  /**
   * When we want to start with another match
   */
  function AnotherMatch() {
    IO?.emit("another-match", roomId);
  }
  return (
    <div className={`${style.flex} ${style.height} ${style.remove_rows}`}>
      {!start && (
        <div className={`${style.Room}`}>Room Id :-{" " + roomId}</div>
      )}
      {start && (
        <div className={`${style.flexrow}`}>
          {scoreBoard.map((ele, i) => {
            return (
              <div
                key={i}
                className={`${style.flexcolumn} ${style.small_letter}`}
              >
                <div>{ele[0]}</div>
                <div>{ele[1]}</div>
              </div>
            );
          })}
        </div>
      )}

      <div className={`${style.small_letter}`}>
        {!winner
          ? yourTurn
            ? "Your Turn"
            : "Waiting For Opponent To Play"
          : undefined}
      </div>
      {winner && winner != "___DRAW___" && (
        <div className={`${style.font}`}>{winner} won the match</div>
      )}
      {winner === "___DRAW___" && <div className={`${style.font}`}>DRAW</div>}
      <div className={`${style.grid}`} onClick={EventDeligation}>
        {board.map((value, i) => {
          return (
            <div key={i} className={`${style.flex}`} data-id={i}>
              {value}
            </div>
          );
        })}
      </div>
      <div className={`${style.nflex} ${style.small_letter}`}>
        <button onClick={AnotherMatch}>Another Match</button>
        <button onClick={CloseRoom}>Leave Room</button>
      </div>
    </div>
  );
}
