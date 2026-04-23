namespace Krea.Domain.Abstractions {
    using Microsoft.EntityFrameworkCore;

    public class PaginatedList<T> {
        public IReadOnlyList<T> Items { get; }
        public int Page { get; }
        public int PageSize { get; }
        public int TotalCount { get; }

        public int TotalPages => PageSize <= 0
            ? 0
            : (int)Math.Ceiling(TotalCount / (double)PageSize);

        private PaginatedList(
            IReadOnlyList<T> items,
            int count,
            int page,
            int pageSize) {
            Items = items;
            TotalCount = count;
            Page = page;
            PageSize = pageSize;
        }

        public static async Task<PaginatedList<T>> CreateAsync(
            IQueryable<T> source,
            int page,
            int pageSize,
            CancellationToken ct = default) {
            page = page < 1 ? 1 : page;
            pageSize = pageSize < 1 ? 10 : pageSize;

            int count = await source.CountAsync(ct);

            List<T> items = await source
                                  .Skip((page - 1) * pageSize)
                                  .Take(pageSize)
                                  .ToListAsync(ct);

            return new PaginatedList<T>(items, count, page, pageSize);
        }

        public static PaginatedList<T> FromItems(
            IReadOnlyList<T> items,
            int totalCount,
            int page,
            int pageSize) {
            page = page < 1 ? 1 : page;
            pageSize = pageSize < 1 ? 10 : pageSize;

            return new PaginatedList<T>(items, totalCount, page, pageSize);
        }
    }
}