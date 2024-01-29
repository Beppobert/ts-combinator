import { Err, Ok } from "./result";

export const $ = (v: Ok | Err): any => v;
