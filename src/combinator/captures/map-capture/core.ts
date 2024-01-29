import { Type } from "../../../hkt-class";
import { Unknown } from "../../../utils/unknown";

export class MapCapture<
  const Name extends string = string
> extends Type<Unknown> {
  constructor(public name: Name) {
    super();
  }
  map(): unknown {
    throw new Error("Method not implemented.");
  }
}

export type CallMap<T extends MapCapture, I extends unknown> = ReturnType<
  (T & { arg: I })["map"]
>;
