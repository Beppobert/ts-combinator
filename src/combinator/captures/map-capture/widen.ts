import { Eager, Lazy } from "../../../utils/lazy";
import { CallMap, MapCapture } from "./core";
//prettier-ignore
export type Expand<T> = 
    T extends string ? string
  : T extends number ? number
  : T extends bigint ? bigint
  : T extends boolean ? boolean
  : T extends any[] ? ExpandArray<T>
  : T extends (...args: any[]) => any ? ExpandFunction<T>
  : T extends object ? { [K in keyof T]: Expand<T[K]>;}
  : T;

type ExpandFunction<T extends (...args: any[]) => any> = (
  ...args: ExpandArray<Parameters<T>>
) => Widen<ReturnType<T>>;

type ExpandArray<T, $agg extends any[] = []> = T extends [
  infer Head,
  ...infer Tail
]
  ? ExpandArray<Tail, [...$agg, Expand<Head>, ...Expand<Tail>]>
  : $agg;

export function expand<T>(m: T): Expand<T> {
  return m as any;
}

export class Widen<M extends Lazy<MapCapture>> extends MapCapture<"widen"> {
  constructor(private m: M) {
    super("widen" as const);
  }
  map(): Expand<CallMap<Eager<M>, this["arg"]>> {
    return this.m().apply(this.arg).map() as any;
  }
}

export type widen<M extends Lazy<MapCapture>> = Lazy<Widen<M>>;
export function widen<M extends Lazy<MapCapture>>(m: M): Lazy<Widen<M>> {
  return () => new Widen(m);
}
