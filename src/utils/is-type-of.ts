const types = [
  "string",
  "number",
  "bigint",
  "boolean",
  "symbol",
  "undefined",
  "object",
  "function",
] as const;
type Type = (typeof types)[number];
type TypeMap = {
  string: string;
  number: number;
  bigint: bigint;
  boolean: boolean;
  symbol: Symbol;
  undefined: undefined;
  object: Record<PropertyKey, unknown>;
  function: (...args: any[]) => any;
};

export function isTypeOf<Types extends Type[]>(
  input: unknown,
  ...types: Types
): input is TypeMap[Types[number]] {
  return types.some((type) => typeof input === type);
}
