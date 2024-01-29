import { $ } from "../utils/any";
import { Lazy } from "../utils/lazy";
import {
  DefaultCombinatorError,
  Err,
  Ok,
  defaultCombinatorError,
  err,
  ok,
} from "../utils/result";
import { Combinator } from "./core";

export const name = "until";
type _Until<
  I extends string,
  BreakAt extends string,
  ErrMsg extends string = DefaultCombinatorError
> = I extends `${infer H}${BreakAt}${infer Rest}`
  ? Ok<H, `${BreakAt}${Rest}`, []>
  : Err<
      ErrMsg,
      {
        "%c": typeof name;
        "%e": BreakAt;
        "%r": I;
      }
    >;

export class Until<
  const BreakAt extends string,
  ErrMsg extends string = DefaultCombinatorError
> extends Combinator {
  constructor(
    private breakAt: BreakAt,
    private errMsg: ErrMsg = defaultCombinatorError as ErrMsg
  ) {
    super(name);
  }
  parse(): _Until<this["arg"], BreakAt, ErrMsg> {
    if (this["arg"] === "") return $(err(this.errMsg));
    const index = this["arg"].indexOf(this.breakAt);
    if (index === -1)
      return $(
        err(this.errMsg, {
          "%c": name,
          "%e": this.breakAt,
          "%r": this["arg"],
        })
      );
    return $(
      ok(this["arg"].substring(0, index), this["arg"].substring(index), [])
    );
  }
}

export function until<
  const B extends string,
  const ErrMsg extends string = DefaultCombinatorError
>(
  breakAt: B,
  errMsg: ErrMsg = defaultCombinatorError as ErrMsg
): until<B, ErrMsg> {
  return () => new Until(breakAt, errMsg);
}
export type until<
  B extends string,
  ErrMsg extends string = DefaultCombinatorError
> = Lazy<Until<B, ErrMsg>>;
