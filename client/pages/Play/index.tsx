import Wrapper from "@/Component/Wrapper/Wrapper";
import Board from "@/Component/Board/Board";
import dynamic from "next/dynamic";
function PlaySSR() {
  return (
    <Wrapper>
      <Board />
    </Wrapper>
  );
}

const Play = dynamic(() => Promise.resolve(PlaySSR), {
  ssr: false,
});

export default Play;
