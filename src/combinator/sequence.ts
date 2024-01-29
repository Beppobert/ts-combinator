import { $ } from "../utils/any";
import { EagerTuple, Lazy } from "../utils/lazy";
import { Ok, assertResult, isOk, ok } from "../utils/result";
import { Call, Combinator } from "./core";

export const name = "seq";
export type Sequence<
  I extends string,
  Cs,
  $agg extends Ok<string, string, any> = Ok<"", I, []>
> = Cs extends [infer H extends Combinator, ...infer Ta]
  ? Call<H, I> extends Ok
    ? Sequence<
        Call<H, I>["rest"],
        Ta,
        Ok<
          `${$agg["parsed"]}${Call<H, I>["parsed"]}`,
          Call<H, I>["rest"],
          [...$agg["stack"], ...Call<H, I>["stack"]]
        >
      >
    : Call<H, I>
  : $agg;

export class Seq<const Cs extends Lazy<Combinator>[]> extends Combinator {
  constructor(private combinator: Cs) {
    super(name);
  }
  parse(): Sequence<this["arg"], EagerTuple<Cs>> {
    let result = ok("", this.arg, [] as any);
    for (const c of this.combinator) {
      const res = c().apply(result.rest).parse();
      assertResult(res);
      if (!isOk(res)) return $(res);
      result.parsed += res.parsed;
      result.rest = res.rest;
      result.stack = [...result.stack, ...res.stack];
    }
    return $(result);
  }
}

export type seq<S extends Lazy<Combinator>[]> = Lazy<Seq<S>>;
export function seq<const S extends Lazy<Combinator>[]>(sequence: S): seq<S> {
  return () => new Seq(sequence);
}
