import { useContext } from "react";
import { Context } from "./context";
export function useContent() {
  return useContext(Context);
}
