import { describe, expect, expectTypeOf, test } from "vitest";
import { ok } from "../../utils/result";
import { literal } from "../literal";
import { CaptureWithLabel } from "./capture-with-label";

describe("CaptureWithLabel", () => {
  test("should capture the parsed value with the specified label", () => {
    const combinator = new CaptureWithLabel("label", literal("hello"));
    const result = combinator.apply("hello").parse();
    const expected = ok("hello", "", [{ label: "hello" }]);

    expect(result).toStrictEqual(expected);
    expectTypeOf(result).toMatchTypeOf<typeof expected>();
  });
});
