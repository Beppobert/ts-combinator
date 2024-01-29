import { $ } from "../../utils/any";
import { Eager, Lazy } from "../../utils/lazy";
import { Ok, assertResult, isOk, ok } from "../../utils/result";
import { Call, Combinator } from "../core";
import { CallMap, MapCapture } from "./map-capture/core";
import { identity } from "./map-capture/identity";

export const name = "layer";
type _Capture<
  I extends string,
  C extends Combinator,
  M extends MapCapture
> = Call<C, I> extends Ok
  ? Ok<
      Call<C, I>["parsed"],
      Call<C, I>["rest"],
      [...Call<C, I>["stack"], CallMap<M, Call<C, I>["parsed"]>]
    >
  : Call<C, I>;

export class Capture<
  C extends Lazy<Combinator>,
  M extends Lazy<MapCapture> = identity
> extends Combinator {
  constructor(private combinator: C, private map: M = identity as M) {
    super(name);
  }
  parse(): _Capture<this["arg"], Eager<C>, Eager<M>> {
    const res = this.combinator().apply(this.arg).parse();
    assertResult(res);

    if (isOk(res)) {
      const m = this.map().apply(res.parsed).map();
      return $(ok(res.parsed, res.rest, [...res.stack, m]));
    }
    return $(res);
  }
}

export type capture<
  C extends Lazy<Combinator>,
  M extends Lazy<MapCapture> = identity
> = Lazy<Capture<C, M>>;
export function capture<
  C extends Lazy<Combinator>,
  M extends Lazy<MapCapture> = identity
>(combinator: C, map: M = identity as M) {
  return () => new Capture<C, M>(combinator, map);
}
