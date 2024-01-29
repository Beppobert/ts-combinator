import { literal } from "./literal";
import { many } from "./many";
import { one_or_more } from "./one-or-more";
import { or } from "./or";
import { seq } from "./sequence";
import { until } from "./until";

export type zero = typeof zero;
export const zero = literal("0");
export type one = typeof one;
export const one = literal("1");
export type two = typeof two;
export const two = literal("2");
export type three = typeof three;
export const three = literal("3");
export type four = typeof four;
export const four = literal("4");
export type five = typeof five;
export const five = literal("5");
export type six = typeof six;
export const six = literal("6");
export type seven = typeof seven;
export const seven = literal("7");
export type eight = typeof eight;
export const eight = literal("8");
export type nine = typeof nine;
export const nine = literal("9");

export type digit = typeof digit;
export const digit = or([
  zero,
  one,
  two,
  three,
  four,
  five,
  six,
  seven,
  eight,
  nine,
]);

export type dot = typeof dot;
export const dot = literal(".");

export type num = typeof num;
export const num = or([
  one_or_more(digit),
  seq([one_or_more(digit), dot, one_or_more(digit)]),
]);

export type comma = typeof comma;
export const comma = literal(",");
export type colon = typeof colon;
export const colon = literal(":");
export type l_brace = typeof l_brace;
export const l_brace = literal("{");
export type r_brace = typeof r_brace;
export const r_brace = literal("}");
export type l_bracket = typeof l_bracket;
export const l_bracket = literal("[");
export type r_bracket = typeof r_bracket;
export const r_bracket = literal("]");

export type quote = typeof quote;
export const quote = literal(`"`);
export type until_quote = typeof until_quote;
export const until_quote = until(`"`);
export type space = typeof space;
export const space = literal(" ");
export type tab = typeof tab;
export const tab = literal("\t");
export type newline = typeof newline;
export const newline = literal("\n");
export type cr = typeof cr;
export const cr = literal("\r");
export type whitespace = typeof whitespace;
export const whitespace = or([space, tab, newline, cr]);
export type whitespaces = typeof whitespaces;
export const whitespaces = many(whitespace);
