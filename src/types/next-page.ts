/** Shared Next.js App Router page prop types (Next.js 15+ async params). */

export type PageParams<T extends Record<string, string> = Record<string, string>> =
  Promise<T>;

export type PageSearchParams<
  T extends Record<string, string | string[] | undefined> = Record<
    string,
    string | string[] | undefined
  >,
> = Promise<T>;
