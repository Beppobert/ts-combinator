import { describe, expect, expectTypeOf, test } from "vitest";
import {
  DefaultCombinatorError,
  Err,
  Ok,
  defaultCombinatorError,
  err,
  ok,
} from "../utils/result";
import { literal } from "./literal";
import { OneOrMore, name } from "./one-or-more";

describe("one-or-more combinator", () => {
  const hello = literal("hello");

  test("one_or_more<literal<'hello'>> of 'hello'. Expects complete match.", () => {
    const match = new OneOrMore(hello).apply("hello").parse();
    expect(match).toStrictEqual(ok("hello", "", []));
    expectTypeOf(match).toMatchTypeOf<Ok<"hello", "", []>>();
  });

  test("one_or_more<literal<'hello'>> of 'hellohello'. Expects complete match.", () => {
    const match = new OneOrMore(hello).apply("hellohello").parse();
    expect(match).toStrictEqual(ok("hellohello", "", []));
    expectTypeOf(match).toMatchTypeOf<Ok<"hellohello", "", []>>();
  });

  test("one_or_more<literal<'hello'>> of 'hellohell_'. Expects partial match.", () => {
    const match = new OneOrMore(hello).apply("hellohell_").parse();
    expect(match).toStrictEqual(ok("hello", "hell_", []));
    expectTypeOf(match).toMatchTypeOf<Ok<"hello", "hell_", []>>();
  });

  test("one_or_more<literal<'hello'>> of 'hell_hello'. Expects no match.", () => {
    const noMatch = new OneOrMore(hello).apply("hell_hello").parse();
    expect(noMatch).toStrictEqual(
      err(defaultCombinatorError, {
        "%c": name,
        "%e": "One or more",
        "%r": "hell_hello",
      })
    );
    expectTypeOf(noMatch).toMatchTypeOf<
      Err<
        DefaultCombinatorError,
        {
          "%c": typeof name;
          "%e": "One or more";
          "%r": "hell_hello";
        }
      >
    >();
  });

  test("one_or_more<literal<'hello'>, 'custom error message'> of 'hell_hello'. Expects no match.", () => {
    const parsed = new OneOrMore(hello, "Custom error message")
      .apply("hell_hello")
      .parse();
    expect(parsed).toStrictEqual(err("Custom error message"));
    expectTypeOf(parsed).toMatchTypeOf<Err<"Custom error message">>();
  });
});
