import { Lazy } from "../../../utils/lazy";
import { MapCapture } from "./core";

export class Constant<T> extends MapCapture<"constant"> {
  constructor(private value: T) {
    super("constant" as const);
  }
  map(): T {
    return this.value;
  }
}

export type constant<T> = Lazy<Constant<T>>;
export function constant<T>(value: T): constant<T> {
  return () => new Constant(value);
}
