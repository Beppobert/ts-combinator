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

export const name = "eoi";
type EoiResult<
  I extends string,
  ErrMsg extends string = DefaultCombinatorError
> = I extends ""
  ? Ok<"", "", []>
  : Err<ErrMsg, { "%c": "eoi"; "%e": "End of Input"; "%r": I }>;

export class Eoi<
  ErrMsg extends string = DefaultCombinatorError
> extends Combinator {
  constructor(private errMsg: ErrMsg = defaultCombinatorError as ErrMsg) {
    super(name);
  }
  parse(): EoiResult<this["arg"], ErrMsg> {
    if (this["arg"] === "") return $(ok("", "", []));
    return $(
      err(this.errMsg, {
        "%c": name,
        "%e": "End of Input",
        "%r": this["arg"],
      })
    );
  }
}
export function eoi<const ErrMsg extends string = DefaultCombinatorError>(
  errMsg: ErrMsg = defaultCombinatorError as ErrMsg
): eoi<ErrMsg> {
  return () => new Eoi<ErrMsg>(errMsg);
}
export type eoi<ErrMsg extends string = DefaultCombinatorError> = Lazy<
  Eoi<ErrMsg>
>;
