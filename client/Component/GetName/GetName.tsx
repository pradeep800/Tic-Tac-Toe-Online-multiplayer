import { useProfileInfo } from "@/lib/store";
import { useRouter } from "next/router";
import { useState } from "react";
import style from "./GetName.module.css";
export default function GetName() {
  const router = useRouter();
  const [name, sName] = useState("");
  const setName = useProfileInfo((state) => {
    return state.setName;
  });
  return (
    <div className={`${style.main}`}>
      <div className={`${style.form}`}>
        <label>Name:-</label>
        <input
          onChange={(e) => {
            sName(e.target.value);
          }}
        />
        <button
          onClick={(e) => {
            if (name.length >= 3) {
              setName(name);
              router.push("/");
            } else {
              alert("Name should have length greater then 3!!");
            }
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}
