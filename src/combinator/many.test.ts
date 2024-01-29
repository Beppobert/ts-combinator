import { describe, expect, expectTypeOf, test } from "vitest";
import { Ok, ok } from "../utils/result";
import { literal } from "./literal";
import { Many } from "./many";
import { until } from "./until";

describe("many combinator", () => {
  const hello = literal("hello");

  test("many<literal<'hello'>> of 'hello'. Expects complete match.", () => {
    const match = new Many(hello).apply("hello").parse();
    expect(match).toStrictEqual(ok("hello", "", []));
    expectTypeOf(match).toMatchTypeOf<Ok<"hello", "", []>>();
  });

  test("many<literal<'hello'>> of 'hellohello'. Expects complete match.", () => {
    const match = new Many(hello).apply("hellohello").parse();
    expect(match).toStrictEqual(ok("hellohello", "", []));
    expectTypeOf(match).toMatchTypeOf<Ok<"hellohello", "", []>>();
  });

  test("many<literal<'hello'>> of 'hello world'. Expects partial match.", () => {
    const match = new Many(hello).apply("hello world").parse();
    expect(match).toStrictEqual(ok("hello", " world", []));
    expectTypeOf(match).toMatchTypeOf<Ok<"hello", " world", []>>();
  });

  test("many<literal<'hello'>> of 'hell_'. Expects no match.", () => {
    const noMatch = new Many(hello).apply("hell_").parse();
    expect(noMatch).toStrictEqual(ok("", "hell_", []));
    expectTypeOf(noMatch).toMatchTypeOf<Ok<"", "hell_", []>>();
  });

  test("many<until<'hello'>> of 'hello'. Expects match but no infinite loop.", () => {
    const match = new Many(until("hello")).apply("hello").parse();
    expect(match).toStrictEqual(ok("", "hello", []));
    expectTypeOf(match).toMatchTypeOf<Ok<"", "hello", []>>();
  });
});
