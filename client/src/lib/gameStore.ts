import { create } from "zustand";

interface StoreType {
  player: "A" | "B";
  changeChance: () => void;
  yourTurn: boolean;
  yourMark: "X" | "O";
}
const store = (set: any): StoreType => ({
  player: "A",
  yourTurn: false,
  yourMark: "X",
  changeChance: () => {
    set((state: any) => {
      if (state.player === "A") {
        return { player: "B" };
      } else {
        return { player: "A" };
      }
    });
  },
});
export const useGameStore = create<StoreType>(store);
