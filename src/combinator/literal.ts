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

export const name = "literal";
type _Literal<
  I extends string,
  Lit extends string,
  ErrMsg extends string = DefaultCombinatorError
> = I extends `${Lit}${infer Rest}`
  ? Ok<Lit, Rest, []>
  : Err<
      ErrMsg,
      {
        "%c": typeof name;
        "%e": Lit;
        "%r": I;
      }
    >;

export class Literal<
  const Lit extends string,
  ErrMsg extends string = DefaultCombinatorError
> extends Combinator {
  constructor(
    private literal: Lit,
    private errMsg: ErrMsg = defaultCombinatorError as ErrMsg
  ) {
    super(name);
  }
  parse(): _Literal<this["arg"], Lit, ErrMsg> {
    if (this["arg"] === null) return $(err(this.errMsg));
    if (!this["arg"].startsWith(this.literal))
      return $(
        err(this.errMsg, {
          "%c": name,
          "%e": this.literal,
          "%r": this.arg,
        })
      );
    return $(ok(this.literal, this["arg"].substring(this.literal.length), []));
  }
}

export type literal<
  T extends string,
  ErrMsg extends string = DefaultCombinatorError
> = Lazy<Literal<T, ErrMsg>>;
export function literal<
  T extends string,
  ErrMsg extends string = DefaultCombinatorError
>(
  literal: T,
  errMsg: ErrMsg = defaultCombinatorError as ErrMsg
): Lazy<Literal<T, ErrMsg>> {
  return () => new Literal(literal, errMsg);
}
