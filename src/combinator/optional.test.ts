import { describe, expect, expectTypeOf, test } from "vitest";
import { Ok, ok } from "../utils/result";
import { literal } from "./literal";
import { Optional } from "./optional";

describe("optional combinator", () => {
  const hello = literal("hello");

  test("optioanl<literal<'hello'>> of 'hello'. Expects complete match.", () => {
    const match = new Optional(hello).apply("hello").parse();
    expect(match).toStrictEqual(ok("hello", "", []));
    expectTypeOf(match).toMatchTypeOf<Ok<"hello", "", []>>();
  });

  test("optioanl<literal<'hello'>> of ''. Expects no match.", () => {
    const noMatch = new Optional(hello).apply("world").parse();
    expect(noMatch).toStrictEqual(ok("", "world", []));
    expectTypeOf(noMatch).toMatchTypeOf<Ok<"", "world", []>>();
  });
});
