import { Combinator } from "../combinator/core";

export type Lazy<T> = () => T;
export type Eager<T> = T extends () => infer U ? U : T;

export type EagerTuple<T extends Lazy<Combinator>[]> = {
  [K in keyof T]: Eager<T[K]>;
};
