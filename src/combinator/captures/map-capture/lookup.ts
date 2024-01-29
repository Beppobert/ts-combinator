import { isTypeOf } from "../../../utils/is-type-of";
import { Lazy } from "../../../utils/lazy";
import { unset } from "../../../utils/unset";
import { MapCapture } from "./core";

type Unknown = {} | null | undefined;

export interface Dict {
  [x: number | string]: unset | Unknown;
  Default: Unknown;
}

type LookUp<I, L extends Dict> = I extends number | string
  ? unset extends L[I]
    ? L["Default"]
    : L[I]
  : L["Default"];

export class Lookup<L extends Dict> extends MapCapture<"lookup"> {
  constructor(private lookup: L) {
    super("lookup" as const);
  }
  map(): LookUp<this["arg"], L> {
    return isTypeOf(this.arg, "string", "number")
      ? this.lookup[this.arg] ?? (this.lookup.Default as any)
      : (this.lookup.Default as any);
  }
}
export type lookup<T extends Dict> = Lazy<Lookup<T>>;
export function lookup<T extends Dict>(l: T): lookup<T> {
  return () => new Lookup(l);
}
