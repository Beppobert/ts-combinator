import { describe, expect, expectTypeOf, test } from "vitest";
import {
  DefaultCombinatorError,
  Err,
  Ok,
  defaultCombinatorError,
  err,
  ok,
} from "../utils/result";
import { Until, name } from "./until";

describe("until combinator", () => {
  test("until<'hello'> of 'hello'. Expects partial match.", () => {
    const match = new Until("hello").apply("hello").parse();
    expect(match).toStrictEqual(ok("", "hello", []));
    expectTypeOf(match).toMatchTypeOf<Ok<"", "hello", []>>();
  });

  test("until<'hello'> of 'hellohello'. Expects partial match.", () => {
    const match = new Until("hello").apply("hellohello").parse();
    expect(match).toStrictEqual(ok("", "hellohello", []));
    expectTypeOf(match).toMatchTypeOf<Ok<"", "hellohello", []>>();
  });

  test("until<'world'> of 'hello world'. Expects partial match.", () => {
    const match = new Until("world").apply("hello world").parse();
    expect(match).toStrictEqual(ok("hello ", "world", []));
    expectTypeOf(match).toMatchTypeOf<Ok<"hello ", "world", []>>();
  });

  test("until<'hello'> of 'hell_'. Expects no match.", () => {
    const noMatch = new Until("hello").apply("hell_").parse();
    expect(noMatch).toStrictEqual(
      err(defaultCombinatorError, {
        "%c": name,
        "%e": "hello",
        "%r": "hell_",
      })
    );
    expectTypeOf(noMatch).toMatchTypeOf<
      Err<
        DefaultCombinatorError,
        { "%c": typeof name; "%e": "hello"; "%r": "hell_" }
      >
    >();
  });
});
