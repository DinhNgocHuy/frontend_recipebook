export function normalizePagePayload(payload) {
    // Hỗ trợ các kiểu: {data, pagination} hoặc {items,total,page,limit} hoặc {results,meta}
    const items =
        payload?.data ??
        payload?.items ??
        payload?.results ??
        [];
    const p = payload?.pagination || payload?.meta || payload || {};
    const page = Number(p.page ?? p.currentPage ?? 1);
    const limit = Number(p.limit ?? p.perPage ?? items.length ?? 0);
    const total = Number(p.total ?? p.totalItems ?? 0);
    return { items, pagination: { page, limit, total } };
}
