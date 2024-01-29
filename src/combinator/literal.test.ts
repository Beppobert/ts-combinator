import { describe, expect, expectTypeOf, test } from "vitest";
import {
  DefaultCombinatorError,
  Err,
  Ok,
  defaultCombinatorError,
  err,
  ok,
} from "../utils/result";
import { Literal, name } from "./literal";

describe("literal combinator", () => {
  test("literal<'hello'> of 'hello'. Expects complete match.", () => {
    const match = new Literal("hello").apply("hello").parse();
    expect(match).toStrictEqual(ok("hello", "", []));
    expectTypeOf(match).toMatchTypeOf<Ok<"hello", "", []>>();
  });

  test("literal<'hello'> of 'hello world'. Expects partial match.", () => {
    const partialMatch = new Literal("hello").apply("hello world").parse();
    expect(partialMatch).toStrictEqual(ok("hello", " world", []));
    expectTypeOf(partialMatch).toMatchTypeOf<Ok<"hello", " world", []>>();
  });

  test("literal<'hello'> of 'world'. Expects no match.", () => {
    const noMatch = new Literal("hello").apply("world").parse();
    expect(noMatch).toStrictEqual(
      err(defaultCombinatorError, {
        "%c": name,
        "%e": "hello",
        "%r": "world",
      })
    );
    expectTypeOf(noMatch).toMatchTypeOf<
      Err<
        DefaultCombinatorError,
        {
          "%c": typeof name;
          "%e": "hello";
          "%r": "world";
        }
      >
    >();
  });

  test("literal<'hello', 'Custom error message'> of 'world'. Expects no match.", () => {
    const parsed = new Literal("hello", "Custom error message")
      .apply("world")
      .parse();
    expect(parsed).toStrictEqual(err("Custom error message"));
    expectTypeOf(parsed).toMatchTypeOf<Err<"Custom error message">>();
  });
});
