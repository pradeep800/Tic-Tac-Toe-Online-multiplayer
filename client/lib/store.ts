import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Socket } from "socket.io-client";
interface StoreType {
  yourTurn: boolean;
  yourMark: "X" | "O" | undefined;
  IO: Socket | undefined;
  setIO: (s: Socket | undefined) => void;
  roomId: string | undefined;
  setRoomId: (s: string | undefined) => void;
  setYourMark: (s: string) => void;
  setYourTurn: (s: boolean) => void;
}
const store = (set: any): StoreType => ({
  yourTurn: false,
  yourMark: undefined,
  IO: undefined,
  setIO: (s) => {
    set((state: StoreType) => ({ IO: s }));
  },
  roomId: undefined,
  setRoomId: (s: string | undefined) => {
    set((state: StoreType) => ({ roomId: s }));
  },
  setYourMark: (s) => {
    set((state: StoreType) => ({ yourMark: s }));
  },
  setYourTurn: (s: boolean) => {
    set((state: StoreType) => ({ yourTurn: s }));
  },
});
export const useGameStore = create<StoreType>(store);

interface ProfileInfo {
  getName: () => string;
  setName: (name: string) => void;
}

const profileInfo = (set: any): ProfileInfo => {
  return {
    setName: (name: string) => {
      localStorage.setItem("name", name);
    },
    getName: () => {
      return localStorage.getItem("name") as string;
    },
  };
};

// const persistProfileInfo = persist(profileInfo, {
//   name: "profileInfo",
// });

export const useProfileInfo = create<ProfileInfo>(profileInfo);
