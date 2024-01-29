export type Ok<
  Parsed extends string = string,
  Rest extends string = string,
  Stack extends unknown[] = any
> = {
  parsed: Parsed;
  rest: Rest;
  stack: Stack;
  tag: "Ok";
};

export const ok = <
  Parsed extends string,
  Rest extends string,
  Stack extends unknown[] = []
>(
  parsed: Parsed,
  rest: Rest,
  stack: Stack = [] as any as Stack
): Ok<Parsed, Rest, Stack> => ({ tag: "Ok", parsed, rest, stack: stack });
export const isOk = (v: unknown): v is Ok =>
  v !== null && typeof v === "object" && "tag" in v && v.tag === "Ok";

export type Err<
  A extends string = string,
  F extends FormatSpecifiers = FormatSpecifiers
> = { error: ErrorF<A, F>; tag: "Err" };

export const err = <
  const Msg extends string,
  const F extends FormatSpecifiers = {}
>(
  msg: Msg,
  fmt: F = {} as F
): Err<Msg, F> => ({
  error: msg.replace(
    /%c|%e|%r/g,
    (m) => fmt[m as keyof FormatSpecifiers] ?? "unknown format specifier"
  ) as any as ErrorF<Msg, F>,
  tag: "Err",
});
export const isErr = (v: unknown): v is Err<string> =>
  v !== null && typeof v === "object" && "tag" in v && v.tag === "Err";

type FormatSpecifiers = Partial<{
  "%c": string;
  "%e": string;
  "%r": string;
}>;

export const defaultCombinatorError = "[%c]: Expected: %e. Received: '%r'";

export type DefaultCombinatorError = typeof defaultCombinatorError;

//prettier-ignore
export type ErrorF<T extends string, F extends FormatSpecifiers> = 
        T extends `${infer H}%c${infer R}` ? `${ErrorF<H, F>}${F["%c"]}${ErrorF<R, F>}` 
      : T extends `${infer H}%e${infer R}` ? `${ErrorF<H, F>}${F["%e"]}${ErrorF<R, F>}`
      : T extends `${infer H}%r${infer R}` ? `${ErrorF<H, F>}${F["%r"]}${ErrorF<R, F>}`
      : T

export function assertResult(input: unknown): asserts input is Err | Ok {
  if (!isOk(input) && !isErr(input)) {
    throw new Error("Parser Error: Expected Ok or Err.");
  }
}
