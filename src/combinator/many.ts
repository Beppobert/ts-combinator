import { $ } from "../utils/any";
import { Eager, Lazy } from "../utils/lazy";
import { Ok, isOk, ok } from "../utils/result";
import { Call, Combinator } from "./core";

export const name = "many";

type _Many<
  I extends string,
  C extends Combinator,
  $agg extends Ok = Ok<"", I, []>
> = Call<C, I> extends Ok
  ? $agg["rest"] extends Call<C, I>["rest"]
    ? $agg // breaks infinite loop
    : _Many<
        Call<C, I>["rest"],
        C,
        Ok<
          `${$agg["parsed"]}${Call<C, I>["parsed"]}`,
          Call<C, I>["rest"],
          [...$agg["stack"], ...Call<C, I>["stack"]]
        >
      >
  : $agg;

export class Many<const C extends Lazy<Combinator>> extends Combinator {
  constructor(private combinator: C) {
    super(name);
  }
  parse(): _Many<this["arg"], Eager<C>> {
    let result = ok("", this.arg, [] as any);
    while (true) {
      const res = this.combinator().apply(result.rest).parse();
      if (isOk(res) && res.parsed !== "") {
        result.parsed += res.parsed;
        result.rest = res.rest;
        result.stack = [...result.stack, ...res.stack];
      } else break;
    }
    return $(result);
  }
}

export type many<C extends Lazy<Combinator>> = Lazy<Many<C>>;
export function many<const C extends Lazy<Combinator>>(combinator: C): many<C> {
  return () => new Many(combinator);
}
