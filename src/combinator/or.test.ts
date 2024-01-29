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
import { Or, name } from "./or";

describe("or combinator", () => {
  const hello = literal("hello");
  const world = literal("world");

  test("or<[literal<'hello'>]> of 'hello'. Expects complete match.", () => {
    const match = new Or([hello]).apply("hello").parse();
    expect(match).toStrictEqual(ok("hello", "", []));
    expectTypeOf(match).toMatchTypeOf<Ok<"hello", "", []>>();
  });

  test("or<[]> of 'hello'. Expects no match.", () => {
    const match = new Or([]).apply("hello").parse();
    expect(match).toStrictEqual(
      err(defaultCombinatorError, {
        "%c": name,
        "%e": "Matching combinator",
        "%r": "hello",
      })
    );
    expectTypeOf(match).toMatchTypeOf<
      Err<
        DefaultCombinatorError,
        { "%c": typeof name; "%e": "Matching combinator"; "%r": "hello" }
      >
    >();
  });

  test("or<[literal<'world'>, literal<'hello'>]> of 'hello world'. Expects partial match.", () => {
    const match = new Or([world, hello]).apply("hello world").parse();
    expect(match).toStrictEqual(ok("hello", " world", []));
    expectTypeOf(match).toMatchTypeOf<Ok<"hello", " world", []>>();
  });

  test("or<[literal<'world'>]> of 'hello'. Expects no match.", () => {
    const noMatch = new Or([world]).apply("hello").parse();
    expect(noMatch).toStrictEqual(
      err(defaultCombinatorError, {
        "%c": name,
        "%e": "Matching combinator",
        "%r": "hello",
      })
    );
    expectTypeOf(noMatch).toMatchTypeOf<
      Err<
        DefaultCombinatorError,
        { "%c": typeof name; "%e": "Matching combinator"; "%r": "hello" }
      >
    >();
  });

  test("or<[literal<'world'>], 'Custom error message'> of 'hello'. Expects no match.", () => {
    const parsed = new Or([world], "Custom error message")
      .apply("hello")
      .parse();
    expect(parsed).toStrictEqual(err("Custom error message"));
    expectTypeOf(parsed).toMatchTypeOf<Err<"Custom error message">>;
  });
});
