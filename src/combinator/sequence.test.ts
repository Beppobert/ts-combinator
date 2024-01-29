import { describe, expect, expectTypeOf, test } from "vitest";
import {
  DefaultCombinatorError,
  Err,
  Ok,
  defaultCombinatorError,
  err,
  ok,
} from "../utils/result";
import { literal, name } from "./literal";
import { Seq } from "./sequence";

describe("sequence combinator", () => {
  const hello = literal("hello");
  const world = literal("world");
  const world_with_custom_error_message = literal(
    "world",
    "Custom error message"
  );

  test("seq<[literal<'hello'>]> of 'hello'. Expects complete match.", () => {
    const match = new Seq([hello]).apply("hello").parse();
    expect(match).toStrictEqual(ok("hello", "", []));
    expectTypeOf(match).toMatchTypeOf<Ok<"hello", "", []>>();
  });

  test("seq<[]> of 'hello'. Expects partial match.", () => {
    const match = new Seq([]).apply("hello").parse();
    expect(match).toStrictEqual(ok("", "hello", []));
    expectTypeOf(match).toMatchTypeOf<Ok<"", "hello", []>>();
  });

  test("seq<[literal<'hello'>, literal<' '>, literal<'world'>]> of 'hello world'. Expects complete match.", () => {
    const match = new Seq([hello, literal(" "), world])
      .apply("hello world")
      .parse();
    expect(match).toStrictEqual(ok("hello world", "", []));
    expectTypeOf(match).toMatchTypeOf<Ok<"hello world", "", []>>();
  });

  test("seq<[literal<'world'>]> of 'hello'. Expects no match.", () => {
    const noMatch = new Seq([world]).apply("hello").parse();
    expect(noMatch).toStrictEqual(
      err(defaultCombinatorError, {
        "%c": name,
        "%e": "world",
        "%r": "hello",
      })
    );
    expectTypeOf(noMatch).toMatchTypeOf<
      Err<
        DefaultCombinatorError,
        {
          "%c": typeof name;
          "%e": "world";
          "%r": "hello";
        }
      >
    >();
  });

  test("seq<[literal<'world', 'Custom error message'>], 'Custom error message'> of 'hello'. Expects no match.", () => {
    const parsed = new Seq([world_with_custom_error_message])
      .apply("hello")
      .parse();
    expect(parsed).toStrictEqual(err("Custom error message"));
    expectTypeOf(parsed).toMatchTypeOf<Err<"Custom error message">>;
  });

  test("seq<[literal<'hello'>, literal<'hello'> ,literal<'world', 'Custom error message'>], 'Custom error message'> of 'hello'. Expects no match.", () => {
    const parsed = new Seq([world_with_custom_error_message])
      .apply("hello")
      .parse();
    expect(parsed).toStrictEqual(err("Custom error message"));
    expectTypeOf(parsed).toMatchTypeOf<Err<"Custom error message">>;
  });
});
