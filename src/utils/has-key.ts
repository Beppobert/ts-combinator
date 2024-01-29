export function hasKey<T, K extends string>(
  v: T,
  key: K
): v is T & { [k in K]: unknown } {
  return v !== null && typeof v === "object" && key in v;
}
