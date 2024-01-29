import { $ } from "../../utils/any";
import { Eager, Lazy } from "../../utils/lazy";
import { Ok, assertResult, isOk, ok } from "../../utils/result";
import { Call, Combinator } from "../core";
import { CallMap, MapCapture } from "./map-capture/core";
import { identity } from "./map-capture/identity";

export const name = "layer";
type _Layer<
  I extends string,
  C extends Combinator,
  M extends MapCapture
> = Call<C, I> extends Ok
  ? Ok<
      Call<C, I>["parsed"],
      Call<C, I>["rest"],
      [CallMap<M, Call<C, I>["stack"]>]
    >
  : Call<C, I>;

export class Layer<
  C extends Lazy<Combinator>,
  M extends Lazy<MapCapture> = identity
> extends Combinator {
  constructor(private combinator: C, private map: M = identity as M) {
    super(name);
  }
  parse(): _Layer<this["arg"], Eager<C>, Eager<M>> {
    const res = this.combinator().apply(this.arg).parse();
    assertResult(res);

    if (isOk(res)) {
      const m = this.map().apply(res.stack).map();
      return $(ok(res.parsed, res.rest, [m]));
    }
    return $(res);
  }
}

export type layer<
  C extends Lazy<Combinator>,
  M extends Lazy<MapCapture> = identity
> = Lazy<Layer<C, M>>;
export function layer<
  C extends Lazy<Combinator>,
  M extends Lazy<MapCapture> = identity
>(combinator: C, map: M = identity as M) {
  return () => new Layer(combinator, map);
}
