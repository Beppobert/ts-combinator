import { Type } from "../hkt-class";

export class Combinator<
  const Name extends string = string
> extends Type<string> {
  constructor(public name: Name) {
    super();
  }
  parse(): unknown {
    throw new Error("Not implemented");
  }
}

export type Call<T extends Combinator, I extends string> = ReturnType<
  (T & { arg: I })["parse"]
>;
