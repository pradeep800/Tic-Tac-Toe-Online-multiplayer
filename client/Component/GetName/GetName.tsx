import { useProfileInfo } from "@/lib/store";
import { useRouter } from "next/router";
import { InputHTMLAttributes, useState } from "react";
import style from "./GetName.module.css";
export default function GetName() {
  const router = useRouter();
  const setName = useProfileInfo((state) => {
    return state.setName;
  });
  return (
    <div
      className={`${style.main}`}
      onSubmit={(e) => {
        e.preventDefault();

        const inputElement =
          e.currentTarget.querySelector('input[name="name"]');
        let name: string = (inputElement as HTMLInputElement).value;
        if (name.length >= 3) {
          setName(name);
          router.push("/");
        } else {
          alert("Name should have length greater then 3!!");
        }
      }}
    >
      <form className={`${style.form}`}>
        <label>Name:-</label>
        <input name="name" />
        <button>Save</button>
      </form>
    </div>
  );
}
