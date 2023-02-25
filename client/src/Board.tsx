import { useEffect, useState } from "react";
import "./App.css";
import { useGameStore } from "./lib/gameStore";

export default function Board() {
  const a = useState(10);
  const yourTurn = useGameStore((state) => state.yourTurn);
  useEffect(() => {
    let divs = document.querySelectorAll("[class='flex']");
    divs.forEach((div, i) => {
      div.setAttribute("data-id", i.toString());
    });
  }, []);
  function EventDeligation(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    let a: HTMLDivElement = e.target as HTMLDivElement;
    if (a.getAttribute("data-id") && !yourTurn) {
      let selected = document.querySelector(
        `[data-id='${a.getAttribute("data-id")}']`
      ) as Element;
      selected.textContent = "X";
    }
  }
  return (
    <div className="flex height remove-rows">
      <div
        onClick={(e) => {
          a[1]((pre) => pre + 1);
        }}
      >
        {a[0]}
      </div>
      <div className="small-letter">
        {yourTurn ? "Your Turn" : "Waiting For Opponent To Play"}
      </div>
      <div className="grid" onClick={EventDeligation}>
        <div className="flex"></div>
        <div className="flex"></div>
        <div className="flex"></div>
        <div className="flex"></div>
        <div className="flex"></div>
        <div className="flex"></div>
        <div className="flex"></div>
        <div className="flex"></div>
        <div className="flex"></div>
      </div>
    </div>
  );
}
