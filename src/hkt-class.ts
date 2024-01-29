export class Type<T = unknown> {
  arg: T = null as T;
  apply<const T>(input: T) {
    return Object.assign(this, { arg: input });
  }
}
