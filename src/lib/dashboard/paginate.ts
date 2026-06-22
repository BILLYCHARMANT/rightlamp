export function paginateRows<T>(rows: T[], page: number, pageSize: number) {
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(Math.max(0, page), pages - 1);
  return {
    pages,
    safePage,
    slice: rows.slice(
      safePage * pageSize,
      safePage * pageSize + pageSize,
    ),
  };
}
