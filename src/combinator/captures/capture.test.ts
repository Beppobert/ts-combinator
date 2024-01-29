import { describe, expect, expectTypeOf, test } from "vitest";
import {
  DefaultCombinatorError,
  Err,
  Ok,
  defaultCombinatorError,
  err,
  ok,
} from "../../utils/result";
import { Literal, literal, name } from "../literal";
import { Seq, seq } from "../sequence";
import { Capture, capture } from "./capture";

describe("capture combinator", () => {
  const hello = literal("hello");
  test("capture<literal<'hello'>> of 'hello'. Expects complete match.", () => {
    const match = new Capture(hello).apply("hello").parse();
    expect(match).toStrictEqual(ok("hello", "", ["hello"]));
    expectTypeOf(match).toMatchTypeOf<Ok<"hello", "", ["hello"]>>();
  });

  test("capture<capture<literal<'hello'>>> of 'hello'. Expects complete match.", () => {
    const match = new Capture(capture(hello)).apply("hello").parse();
    expect(match).toStrictEqual(ok("hello", "", ["hello", "hello"]));
    expectTypeOf(match).toMatchTypeOf<Ok<"hello", "", ["hello", "hello"]>>();
  });

  test("capture<literal<'hello'>> of 'hello world'. Expects partial match.", () => {
    const partialMatch = new Capture(hello).apply("hello world").parse();
    expect(partialMatch).toStrictEqual(ok("hello", " world", ["hello"]));
    expectTypeOf(partialMatch).toMatchTypeOf<
      Ok<"hello", " world", ["hello"]>
    >();
  });

  test("capture<seq<[literal<'hello'>,literal<'hello'>]>> of 'hellohello'. Expects partial match.", () => {
    const partialMatch = new Capture(seq([hello, hello]))
      .apply("hellohello")
      .parse();
    expect(partialMatch).toStrictEqual(ok("hellohello", "", ["hellohello"]));
    expectTypeOf(partialMatch).toMatchTypeOf<
      Ok<"hellohello", "", ["hellohello"]>
    >();
  });

  test("seq<[capture<literal<'hello'>>, capture<literal<'hello'>>]> of 'hellohello'. Expects partial match.", () => {
    const partialMatch = new Seq([capture(hello), capture(hello)])
      .apply("hellohello")
      .parse();
    expect(partialMatch).toStrictEqual(
      ok("hellohello", "", ["hello", "hello"])
    );
    expectTypeOf(partialMatch).toMatchTypeOf<
      Ok<"hellohello", "", ["hello", "hello"]>
    >();
  });

  test("capture<literal<'hello'>> of 'world'. Expects no match.", () => {
    const noMatch = new Capture(hello).apply("world").parse();
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
