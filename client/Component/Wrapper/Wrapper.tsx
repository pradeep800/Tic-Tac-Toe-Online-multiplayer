import { ReactNode } from "react";
import { useProfileInfo } from "@/lib/store";
import GetName from "../GetName/GetName";

export default function Wrapper(props: { children: ReactNode }) {
  const name = useProfileInfo((state) => state.getName);

  return <>{name() ? props.children : <GetName />}</>;
}
