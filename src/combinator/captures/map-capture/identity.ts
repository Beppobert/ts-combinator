import { Lazy } from "../../../utils/lazy";
import { MapCapture } from "./core";

export class Identity extends MapCapture<"identity"> {
  constructor() {
    super("identity" as const);
  }
  map(): this["arg"] {
    return this.arg;
  }
}
export type identity = Lazy<Identity>;
export function identity() {
  return new Identity();
}
