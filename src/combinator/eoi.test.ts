import { describe, expect, expectTypeOf, test } from "vitest";
import {
  DefaultCombinatorError,
  Err,
  Ok,
  defaultCombinatorError,
  err,
  ok,
} from "../utils/result";
import { Eoi } from "./eoi";

describe("end-of-input combinator", () => {
  test("eoi of ''. Expects end-of-input.", () => {
    const match = new Eoi().apply("").parse();
    expect(match).toStrictEqual(ok("", "", []));
    expectTypeOf(match).toMatchTypeOf<Ok<"", "", []>>();
  });

  test("eoi of 'hello'. Expects no match.", () => {
    const noMatch = new Eoi().apply("hello").parse();
    expect(noMatch).toStrictEqual(
      err(defaultCombinatorError, {
        "%c": "eoi",
        "%e": "End of Input",
        "%r": "hello",
      })
    );
    expectTypeOf(noMatch).toMatchTypeOf<
      Err<
        DefaultCombinatorError,
        {
          "%c": "eoi";
          "%e": "End of Input";
          "%r": "hello";
        }
      >
    >();
  });

  test("eoi<'Custom error message'> of 'hello'. Expects no match.", () => {
    const noMatch = new Eoi("Custom error message").apply("hello").parse();
    expect(noMatch).toStrictEqual(err("Custom error message"));
    expectTypeOf(noMatch).toMatchTypeOf<Err<"Custom error message">>();
  });
});
