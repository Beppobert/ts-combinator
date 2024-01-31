# Introduction

This library is a proof of concept and is not intended for production use. It aims to align an HKT implementation with runtime code. It implements a simple parser combinator library. You can use it to implement a typesafe JSON parser or GraphQL query parser.

## Quickstart

```shell
npm install @beppobert/ts-combinator
```

### Example of a non-recursive array parser

```typescript
import {
  seq,
  capture,
  many,
  or,
  literal,
  num,
  to_number,
  until,
} from "@beppobert/ts-combinator";

const number = capture(num, to_number);
const numberResult = number().apply("123").parse();
// numberResult = { tag:"Ok", parsed: "123", rest: "", stack: [123] }
const string = seq([literal("'"), capture(until('"')), literal("'")]);
const stringResult = string().apply("'hello'").parse();
// stringResult = { tag:"Ok", parsed: "'hello'", rest: "", stack: ["hello"] }
const value = or([number, string]);
const array = layer(
  seq([
    l_bracket,
    optional(or([seq([one_or_more(seq([value, comma])), value]), value])),
    r_bracket,
  ])
);
const arrayResult = array().apply("[1,2,3]").parse();
// arrayResult = { tag:"Ok", parsed: "[1,2,3]", rest: "", stack: [[1,2,3]] }
```

## Example of a recursive array parser

For a recursive parser, an explicit type annotation is needed. To achieve this, we create a new type for the array parser and the value parser and wrap both in a function that returns the type. This is necessary because TypeScript can't infer recursive types. The neat part is that you just need to copy your implementation and replace every "(" and ")" with "<" and ">" to create the correct type annotation.

```typescript
import {
  seq,
  capture,
  many,
  or,
  literal,
  num,
  to_number,
  until,
} from "@beppobert/ts-combinator";

const number = capture(num, to_number);
const numberResult = number().apply("123").parse();
// numberResult = { tag:"Ok", parsed: "123", rest: "", stack: [123] }
const string = seq([literal("'"), capture(until('"')), literal("'")]);
const stringResult = string().apply("'hello'").parse();
// stringResult = { tag:"Ok", parsed: "'hello'", rest: "", stack: ["hello"] }

type array = layer<
  seq<
    [
      l_bracket,
      optional<
        or<[seq<[one_or_more<seq<[value, literal<",">]>>, value]>, value]>
      >,
      r_bracket
    ]
  >
>;
function array(): ReturnType<array> {
  return layer(
    seq([
      l_bracket,
      optional(
        or([seq([one_or_more(seq([value, literal(",")])), value]), value])
      ),
      r_bracket,
    ])
  )();
}
type value = or<[number, string, array]>;
function value(): ReturnType<value> {
  return or([number, string, array])();
}
const arrayResult = array().apply('[1,2,3,["foo","bar",1]]').parse();
// arrayResult = { tag:"Ok", parsed: '[1,2,3,["foo","bar",1]]', rest: "", stack: [[1,2,3,["foo","bar",1]]] }
```

## Combinator API Documentation

### literal

The literal combinator matches a string literal.

```typescript
const singleQuote = literal("'");
singleQuote().apply("'").parse();
// {tag:"Ok", parsed: "'", rest: "", stack: [] }
singleQuote().apply("a").parse();
// {tag:"Err", error: "[literal]: Expected: '. Received: 'a'" }
```

### eoi (End of Input)

The eoi combinator matches the end of the input.

```typescript
const end = eoi();
end().apply("").parse();
// {tag:"Ok", parsed: "", rest: "", stack: [] }
end().apply("a").parse();
// {tag:"Err", error: "[eoi]: Expected: End of Input. Received: 'a'" }
```

### many

The many combinator matches the given parser zero or more times.

```typescript
const manyA = many(literal("a"));
manyA().apply("aaa").parse();
// {tag:"Ok", parsed: "aaa", rest: "", stack: [] }
manyA().apply("b").parse();
// {tag:"Ok", parsed: "", rest: "b", stack: [] }
```

### one_or_more

The one_or_more combinator matches the given parser one or more times.

```typescript
const oneOrMoreA = one_or_more(literal("a"));
oneOrMoreA().apply("aaa").parse();
// {tag:"Ok", parsed: "aaa", rest: "", stack: [] }
oneOrMoreA().apply("b").parse();
// {tag:"Err", error: ""[one_or_more]: Expected: One or more. Received: 'b'"
```

### optional

The optional combinator matches the given parser zero or one times.

```typescript
const optionalA = optional(literal("a"));
optionalA().apply("a").parse();
// {tag:"Ok", parsed: "a", rest: "", stack: [] }
optionalA().apply("b").parse();
// {tag:"Ok", parsed: "", rest: "b", stack: [] }
```

### seq

The seq combinator matches the given parsers in sequence.
Note: The seq combinator propagates the error of the first failed parser.

```typescript
const seqA = seq([literal("a"), literal("b")]);
seqA().apply("ab").parse();
// {tag:"Ok", parsed: "ab", rest: "", stack: [] }
seqA().apply("a").parse();
// {tag:"Err", error: "[literal]: Expected: b. Received: ''" }
```

### or

The or combinator matches the given parsers in sequence.

```typescript
const orA = or([literal("a"), literal("b")]);
orA().apply("a").parse();
// { tag:"Ok", parsed: "a", rest: "", stack: [] }
orA().apply("b").parse();
// { tag:"Ok", parsed: "b", rest: "", stack: [] }
orA().apply("c").parse();
// { tag:"Err", error: "[or]: Expected: Matching combinator. Received: 'c'" }
```

### until

The until combinator matches the given parser until the given literal matches.
Note: There is no until combinator that takes a combinator as input.

```typescript
const untilA = until("a");
untilA().apply("fooooooa").parse();
// { tag:"Ok", parsed: "foooooo", rest: "a", stack: [] }

const untilFail = until("a");
untilFail().apply("foooooo").parse();
// { tag:"Err", error: "[until]: Expected: a. Received: 'foooooo'" }
```

## captures

The capture combinator pushes the result of the given parser to the stack.

```typescript
const captureA = capture(literal("a"));
captureA().apply("a").parse();
// { tag:"Ok", parsed: "a", rest: "", stack: ["a"] }
const captureAB = capture(seq([literal("a"), literal("b")]));
captureAB().apply("ab").parse();
// { tag:"Ok", parsed: "ab", rest: "", stack: ["ab"] }

const captureMultiple = capture(capture(literal("a")));
captureMultiple().apply("a").parse();
// { tag:"Ok", parsed: "a", rest: "", stack: ["a","a"] }
```

There are also some custom mapper functions that can be used to transform captured values.

### capture_with_label

The capture_with_label combinator pushes the result of the given parser to the stack with the given label.

```typescript
const captureA = capture_with_label("a", literal("a"));
captureA().apply("a").parse();
// { tag:"Ok", parsed: "a", rest: "", stack: [{a:"a"}] }
const captureAB = capture_with_label("ab", seq([literal("a"), literal("b")]));
captureAB().apply("ab").parse();
// { tag:"Ok", parsed: "ab", rest: "", stack: [{ab:"ab"}] }
```

### layer

The layer combinator encapsulates all matching combinators in a new stack layer.

```typescript
const layerA = layer(literal("a")); // no combinator
layerA().apply("a").parse();
// { tag:"Ok", parsed: "a", rest: "", stack: [[]] } <- empty layer

const layerAB = layer(capture(seq([literal("a"), literal("b")])));
layerAB().apply("ab").parse();
// { tag:"Ok", parsed: "ab", rest: "", stack: [["ab"]] } <- layer with captured value
```

## Transformators

Transformators are functions that transform the captured value or a stack layer.
At this point, if a transformation fails, it will result in a runtime error and the inference will behave unexpectedly.

### to_number

The to_number transformator transforms the captured value to a number.

```typescript
import { num, to_number, capture } from "@beppobert/ts-combinator";
const number = capture(num, to_number);
number().apply("123").parse();
// { tag:"Ok", parsed: "123", rest: "", stack: [123] }
```

### identity

The identity transformator returns the captured value.

```typescript
import { num, identity, capture } from "@beppobert/ts-combinator";
const number = capture(num, identity);
number().apply("123").parse();
// { tag:"Ok", parsed: "123", rest: "", stack: ["123"] }
```

### constant

The constant transformator returns the given value.

```typescript
import { num, constant, capture } from "@beppobert/ts-combinator";
const number = capture(num, constant(42));
number().apply("123").parse();
// { tag:"Ok", parsed: "123", rest: "", stack: [42] }
```

If you don't want to infer the literal value, there is an expand util that can be used to widen the type of the literal.

```typescript
import { num, constant, capture, expand } from "@beppobert/ts-combinator";
const number = capture(num, constant(expand(42)));
number().apply("123").parse();
// { tag:"Ok", parsed: "123", rest: "", stack: [number] }
```

### widen

The widen transformator widens the return type of another transformator.

```typescript
import { num, widen, capture } from "@beppobert/ts-combinator";
const number = capture(num, widen(to_number));
number().apply("123").parse();
// { tag:"Ok", parsed: "123", rest: "", stack: [number] }
```

### lookup

The lookup transformator looks up the given key from a known dictionary.
The dictionary needs a "Default" key.

```typescript
import { num, lookup, capture } from "@beppobert/ts-combinator";
const foo = literal("foo");
const bar = literal("bar");
const fizz = literal("fizz");

const lookedUp = capture(
  or([foo, bar, fizz]),
  lookup({ foo: 42, bar: 43, Default: 44 })
);
lookedUp().apply("foo").parse();
// { tag:"Ok", parsed: "foo", rest: "", stack: [42] }
lookedUp().apply("bar").parse();
// { tag:"Ok", parsed: "bar", rest: "", stack: [43] }
lookedUp().apply("fizz").parse();
// { tag:"Ok", parsed: "fizz", rest: "", stack: [44] }
```

### from_entries

The from_entries transformator transforms an array of entries into an object.

```typescript
import { num, from_entries, capture } from "@beppobert/ts-combinator";
const str = seq([literal('"'), capture(until('"')), literal('"')]);
const record_string_string = layer(
  seq([
    l_brace,
    or([seq([one_or_more(seq([str, comma])), str]), optional(str)]),
    r_brace,
  ]),
  from_entries
)();

record_string_string().apply('{"foo":"bar"}').parse();
// { tag:"Ok", parsed: '{"foo":"bar"}', rest: "", stack: [{foo:"bar"}] }
record_string_string().apply('{"foo":"bar","fizz":"buzz"}').parse();
// { tag:"Ok", parsed: '{"foo":"bar","fizz":"buzz"}', rest: "", stack: [{foo:"bar",fizz:"buzz"}] }
```

## Error handling

Most of the combinator functions have a second parameter for a custom error message.

Your custom error message can be enriched with the expected and received values and the name of the combinator by using the string formats "%e" and "%r" and "%c".

```typescript
const literalA = literal("a", "Expected: %e. Received: %r. Combinator: %c");
literalA().apply("b").parse();
// { tag:"Err", error: "[literal]: Expected: a. Received: 'b'. Combinator: literal" }
```

## Custom combinators

You can create your own combinators. Take this dummy code example

```typescript
import { Combinator, Ok, Err, isOk } from "@beppobert/ts-combinator";

type _FooCombinator<Input extends string> = // /.../ <- your combinator as type

class FooCombinator extends Combinator<"some-name"> {
  constructor(private readonly combinator: C) {
    super("some-name");
  }
  parse():_FooCombinator<this["arg"]> //<- use this["arg"] to get the input type
  {
    const input = this.arg // <- use this.arg to get the input

    /**
     * reimplement the parse function from _FooCombinator type
    */
   return ok(parsed, rest, stack) as any // <- return Ok or Err
  }
}

// to prevent unexpected bahaviour at runtime you should create a lazy function that returns the combinator

function fooCombinator() {
  return new FooCombinator();
}
// or if you have some input
function fooCombinator(input:SomeOtherCombinator): FooCombinator {
  return ()=>new FooCombinator(input);
}

```

## Custom transformators

```typescript
import { Lazy, MapCapture } from "@beppobert/ts-combinator";

// create a type that matches your needs
type _ToNumber<T> = T extends `${infer N extends number}` ? N : never;

// create a class that extends MapCapture
export class ToNumber extends MapCapture<"to_number"> {
  constructor() {
    super("to_number" as const);
  }
  // create a "map" function that returns the type you created above
  // it will take this["arg"] as input
  map(): _ToNumber<this["arg"]> {
    // the map function body should match the type implementation you created above
    const parsed = Number(this.arg);
    if (isNaN(parsed)) {
      throw new Error(`Expected a number. Received: ${this.arg}`);
    }
    return parsed as any;
  }
}
// create a lazy function that returns the transformator
export type to_number = Lazy<ToNumber>;
export function to_number(): ReturnType<to_number> {
  return new ToNumber();
}
```

## Json parser example

```typescript
import {
  seq,
  capture,
  many,
  or,
  literal,
  num,
  to_number,
  until,
  one_or_more,
  optional,
  layer,
  from_entries,
  expand,
  constant,
} from "@beppobert/ts-combinator";

type json_string = seq<[quote, capture<until_quote>, quote]>;
function json_string(): ReturnType<json_string> {
  return seq([quote, capture(until_quote), quote])();
}

type json_null = capture<literal<"null">, constant<null>>;
function json_null(): ReturnType<json_null> {
  return capture(literal("null"), constant(null))();
}
type json_true = capture<literal<"true">, constant<boolean>>;

function json_true(): ReturnType<json_true> {
  return capture(literal("true"), constant(expand(true)))();
}
type json_false = capture<literal<"false">, constant<boolean>>;
function json_false(): ReturnType<json_false> {
  return capture(literal("false"), constant(expand(false)))();
}
type json_number = capture<typeof num, to_number>;
function json_number(): ReturnType<json_number> {
  return capture(num, to_number)();
}

type key_value = layer<seq<[json_string, colon, json]>>;
function key_value() {
  return layer(seq([json_string, colon, json]))();
}

type json_object = layer<
  seq<
    [
      l_brace,
      or<
        [
          seq<[one_or_more<seq<[key_value, comma]>>, key_value]>,
          optional<key_value>
        ]
      >,
      r_brace
    ]
  >,
  from_entries
>;

function json_object(): ReturnType<json_object> {
  return layer(
    seq([
      l_brace,
      or([
        seq([one_or_more(seq([key_value, comma])), key_value]),
        optional(key_value),
      ]),
      r_brace,
    ]),
    from_entries
  )();
}

type json_array = layer<
  seq<
    [
      l_bracket,
      optional<or<[seq<[one_or_more<seq<[json, comma]>>, json]>, json]>>,
      r_bracket
    ]
  >
>;
function json_array(): ReturnType<json_array> {
  return layer(
    seq([
      l_bracket,
      optional(or([seq([one_or_more(seq([json, comma])), json]), json])),
      r_bracket,
    ])
  )();
}

type json = or<
  [
    json_object,
    json_array,
    json_string,
    json_null,
    json_true,
    json_false,
    json_number
  ]
>;
const json = or([
  json_object,
  json_array,
  json_string,
  json_null,
  json_true,
  json_false,
  json_number,
]);

const jsonResult = json()
  .apply(
    '{"foo":"bar","fizz":"buzz","arr":[1,2,3],"obj":{"foo":"bar"},"null":null,"true":true,"false":false}'
  )
  .parse();
// jsonResult = {
//   tag: "Ok",
//   parsed: '{"foo":"bar","fizz":"buzz","arr":[1,2,3],"obj":{"foo":"bar"},"null":null,"true":boolean,"false":boolean}',
```
