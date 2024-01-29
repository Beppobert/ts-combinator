import { $ } from "../utils/any";
import { Eager, Lazy } from "../utils/lazy";
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

export const name = "one_or_more";

type _OneOrMore<
  I extends string,
  C extends Combinator,
  ErrMsg extends string = DefaultCombinatorError,
  $agg extends Ok = Ok<"", I, []>
> = Call<C, I> extends Ok
  ? $agg extends Call<C, I>
    ? $agg // breaks infinite loop
    : _OneOrMore<
        Call<C, I>["rest"],
        C,
        ErrMsg,
        Ok<
          `${$agg["parsed"]}${Call<C, I>["parsed"]}`,
          Call<C, I>["rest"],
          [...$agg["stack"], ...Call<C, I>["stack"]]
        >
      >
  : $agg["parsed"] extends ""
  ? Err<
      ErrMsg,
      {
        "%c": typeof name;
        "%e": "One or more";
        "%r": I;
      }
    >
  : $agg;

export class OneOrMore<
  const C extends Lazy<Combinator>,
  const ErrMsg extends string = DefaultCombinatorError
> extends Combinator {
  constructor(
    private combinator: C,
    private errMsg: ErrMsg = defaultCombinatorError as ErrMsg
  ) {
    super(name);
  }
  parse(): _OneOrMore<this["arg"], Eager<C>, ErrMsg> {
    let result = ok("", this.arg, [] as any);
    while (true) {
      const res = this.combinator().apply(result.rest).parse();
      if (isOk(res) && res.parsed !== "") {
        result.parsed += res.parsed;
        result.rest = res.rest;
        result.stack = [...result.stack, ...res.stack];
      } else break;
    }
    if (result.parsed === "")
      return $(
        err(this.errMsg, {
          "%c": name,
          "%e": "One or more",
          "%r": this.arg,
        })
      );
    return $(result);
  }
}

export function one_or_more<
  const C extends Lazy<Combinator>,
  const ErrMsg extends string = DefaultCombinatorError
>(
  combinator: C,
  errMsg: ErrMsg = defaultCombinatorError as ErrMsg
): one_or_more<C, ErrMsg> {
  return () => new OneOrMore(combinator, errMsg);
}

export type one_or_more<
  C extends Lazy<Combinator>,
  ErrMsg extends string = DefaultCombinatorError
> = Lazy<OneOrMore<C, ErrMsg>>;
