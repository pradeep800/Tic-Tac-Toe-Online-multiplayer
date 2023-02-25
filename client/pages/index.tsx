import Board from "@/Component/Board/Board";
import CJRoom from "@/Component/CJRoom/CJRoom";
import Wrapper from "@/Component/Wrapper/Wrapper";
import { useGameStore } from "@/lib/store";
import dynamic from "next/dynamic";
import { useEffect } from "react";
function HomeSSR() {
  useEffect(() => {
    document.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
      }
    });
  }, []);
  const io = useGameStore((state) => {
    return state.IO;
  });
  return <Wrapper>{!io ? <CJRoom /> : <Board />}</Wrapper>;
}

const Home = dynamic(() => Promise.resolve(HomeSSR), {
  ssr: false,
});

export default Home;
