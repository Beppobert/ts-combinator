import { isTypeOf } from "../../../utils/is-type-of";
import { Lazy } from "../../../utils/lazy";
import { MapCapture } from "./core";

type _FromEntries<I, $agg = {}> = I extends [infer Entry, ...infer Rest]
  ? Entry extends [infer Key extends PropertyKey, infer Value]
    ? _FromEntries<Rest, $agg & { [K in Key]: Value }>
    : never
  : $agg;

export class FromEntries extends MapCapture<"from_entries"> {
  constructor() {
    super("from_entries" as const);
  }
  map(): _FromEntries<this["arg"]> {
    const entries = this.arg;
    if (!Array.isArray(entries)) {
      throw new Error(`Expected an array of entries. Received: ${entries}`);
    }
    const sanitizedEntries: [PropertyKey, any][] = [];
    for (const entry of entries) {
      const invalidEntry = !Array.isArray(entry) || entry.length !== 2;
      if (isTypeOf(entry[0], "string", "number", "symbol")) {
        throw new Error(
          `Invalid key, Received:${entry[0]}. Expected: PropertyKey`
        );
      }
      if (invalidEntry) throw new Error(`Entry is not a tuple of two elements`);
      sanitizedEntries.push([entry[0], entry[1]]);
    }
    return Object.fromEntries(sanitizedEntries) as any;
  }
}

export type from_entries = Lazy<FromEntries>;
export function from_entries() {
  return new FromEntries();
}
