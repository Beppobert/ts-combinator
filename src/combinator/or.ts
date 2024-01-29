import { $ } from "../utils/any";
import { EagerTuple, Lazy } from "../utils/lazy";
import {
  DefaultCombinatorError,
  Err,
  Ok,
  defaultCombinatorError,
  err,
  isOk,
  ok,
} from "../utils/result";
import { Call, Combinator } from "./core";

export const name = "or";
type _Or<
  I extends string,
  Cs,
  ErrMsg extends string = DefaultCombinatorError
> = Cs extends [infer H extends Combinator, ...infer Ta]
  ? Call<H, I> extends Ok
    ? Call<H, I>
    : _Or<I, Ta, ErrMsg>
  : Err<ErrMsg, { "%c": typeof name; "%e": "Matching combinator"; "%r": I }>;

export class Or<
  const Combinators extends Lazy<Combinator>[],
  const ErrMsg extends string = DefaultCombinatorError
> extends Combinator {
  constructor(
    private combinator: Combinators,
    private errMsg: ErrMsg = defaultCombinatorError as ErrMsg
  ) {
    super(name);
  }
  parse(): _Or<this["arg"], EagerTuple<Combinators>, ErrMsg> {
    let result = ok("", this.arg, []);
    for (const c of this.combinator) {
      const res = c().apply(result.rest).parse();
      if (isOk(res)) return $(res);
    }
    return $(
      err(this.errMsg, {
        "%c": name,
        "%e": "Matching combinator",
        "%r": this.arg,
      })
    );
  }
}

export function or<
  const S extends Lazy<Combinator>[],
  const ErrMsg extends string = DefaultCombinatorError
>(
  sequence: S,
  errMsg: ErrMsg = defaultCombinatorError as ErrMsg
): or<S, ErrMsg> {
  return () => new Or(sequence, errMsg);
}
export type or<
  S extends Lazy<Combinator>[],
  ErrMsg extends string = DefaultCombinatorError
> = Lazy<Or<S, ErrMsg>>;
