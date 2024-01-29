import { describe, expect, expectTypeOf, test } from "vitest";
import { Ok, defaultCombinatorError, err, ok } from "../../utils/result";
import { literal } from "../literal";
import { seq } from "../sequence";
import { capture } from "./capture";
import { layer, name } from "./layer";

describe("Layer", () => {
  test("should parse successfully when the inner combinator succeeds", () => {
    const innerCombinator = literal("hello");
    const layerCombinator = layer(capture(innerCombinator));

    const input = "hello world";
    const result = layerCombinator().apply(input).parse();

    expect(result).toEqual(ok("hello", " world", [["hello"]]));
  });

  test("should return an error when the inner combinator fails", () => {
    const innerCombinator = literal("hello");
    const mapCapture = capture(innerCombinator);
    const layerCombinator = layer(mapCapture);

    const input = "hi world";
    const result = layerCombinator().apply(input).parse();

    expect(result).toEqual(
      err(defaultCombinatorError, {
        "%c": name,
        "%e": "hello",
        "%r": "hi world",
      })
    );
  });

  test("should parse successfully with a different inner combinator", () => {
    const innerCombinator = seq([
      capture(literal("hello")),
      literal(" "),
      capture(literal("world")),
    ]);
    const layerCombinator = layer(innerCombinator);

    const input = "hello world";
    const result = layerCombinator().apply(input).parse();

    expect(result).toEqual(ok("hello world", "", [["hello", "world"]]));
    expectTypeOf(result).toMatchTypeOf<
      Ok<"hello world", "", [["hello", "world"]]>
    >();
  });
});
