import { Lazy } from "../../../utils/lazy";
import { MapCapture } from "./core";

type _ToNumber<T> = T extends `${infer N extends number}` ? N : never;

export class ToNumber extends MapCapture<"to_number"> {
  constructor() {
    super("to_number" as const);
  }
  map(): _ToNumber<this["arg"]> {
    const parsed = Number(this.arg);
    if (isNaN(parsed)) {
      throw new Error(`Expected a number. Received: ${this.arg}`);
    }
    return parsed as any;
  }
}

export type to_number = Lazy<ToNumber>;
export function to_number(): ReturnType<to_number> {
  return new ToNumber();
}
