import { $ } from "../../utils/any";
import { Eager, Lazy } from "../../utils/lazy";
import { Ok, assertResult, isOk, ok } from "../../utils/result";
import { Call, Combinator } from "../core";
import { CallMap, MapCapture } from "./map-capture/core";
import { identity } from "./map-capture/identity";

export const name = "capture_with_label";
type _CaptureWithLabel<
  I extends string,
  Label extends PropertyKey,
  C extends Combinator,
  M extends MapCapture
> = Call<C, I> extends Ok
  ? Ok<
      Call<C, I>["parsed"],
      Call<C, I>["rest"],
      [
        ...Call<C, I>["stack"],
        { [K in Label]: CallMap<M, Call<C, I>["parsed"]> }
      ]
    >
  : Call<C, I>;

export class CaptureWithLabel<
  const Label extends PropertyKey,
  C extends Lazy<Combinator>,
  M extends Lazy<MapCapture> = identity
> extends Combinator<typeof name> {
  constructor(
    private label: Label,
    private combinator: C,
    private map: M = identity as M
  ) {
    super(name);
  }
  parse(): _CaptureWithLabel<this["arg"], Label, Eager<C>, Eager<M>> {
    const res = this.combinator().apply(this.arg).parse();
    assertResult(res);

    if (isOk(res)) {
      const m = this.map().apply(res.parsed).map();
      return $(ok(res.parsed, res.rest, [...res.stack, { [this.label]: m }]));
    }
    return $(res);
  }
}

export type capture_with_label<
  Label extends PropertyKey,
  C extends Lazy<Combinator>,
  M extends Lazy<MapCapture> = identity
> = Lazy<CaptureWithLabel<Label, C, M>>;
export function capture_with_label<
  const Label extends PropertyKey,
  C extends Lazy<Combinator>,
  M extends Lazy<MapCapture> = identity
>(label: Label, combinator: C, map: M = identity as M) {
  return () => new CaptureWithLabel(label, combinator, map);
}
