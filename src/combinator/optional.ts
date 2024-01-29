import { $ } from "../utils/any";
import { Eager, Lazy } from "../utils/lazy";
import { Ok, isOk, ok } from "../utils/result";
import { Call, Combinator } from "./core";

export const name = "optional";
type _Optional<Str extends string, C extends Combinator> = Call<
  C,
  Str
> extends Ok
  ? Call<C, Str>
  : Ok<"", Str, []>;

export class Optional<const C extends Lazy<Combinator>> extends Combinator {
  constructor(private combinator: C) {
    super(name);
  }
  parse(): _Optional<this["arg"], Eager<C>> {
    const res = this.combinator().apply(this.arg).parse();
    if (isOk(res)) return $(res);
    return $(ok("", this.arg));
  }
}

export type optional<C extends Lazy<Combinator>> = Lazy<Optional<C>>;
export function optional<const C extends Lazy<Combinator>>(
  combinator: C
): optional<C> {
  return () => new Optional(combinator);
}
