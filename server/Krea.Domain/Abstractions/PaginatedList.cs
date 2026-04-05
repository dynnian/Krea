namespace Krea.Domain.Abstractions {
    using Microsoft.EntityFrameworkCore;

    public class PaginatedList<T>
    {
        public IReadOnlyList<T> Items { get; }
        public int Page { get; }
        public int PageSize { get; }
        public int TotalCount { get; }

        public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);

        private PaginatedList(
            IReadOnlyList<T> items,
            int count,
            int page,
            int pageSize)
        {
            Items = items;
            TotalCount = count;
            Page = page;
            PageSize = pageSize;
        }

        public static async Task<PaginatedList<T>> CreateAsync(
            IQueryable<T> source,
            int page,
            int pageSize,
            CancellationToken ct = default)
        {
            var count = await source.CountAsync(ct);

            var items = await source
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            return new PaginatedList<T>(items, count, page, pageSize);
        }

        public static PaginatedList<T> FromItems(
            IReadOnlyList<T> items,
            int totalCount,
            int page,
            int pageSize)
        {
            return new PaginatedList<T>(items, totalCount, page, pageSize);
        }
    }
}