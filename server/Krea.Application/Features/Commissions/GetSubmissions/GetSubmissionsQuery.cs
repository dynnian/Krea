namespace Krea.Application.Features.Commissions.GetSubmissions {
    using Domain.Abstractions;
    using Dtos;

    public record GetSubmissionsQuery(Guid RequestId, int Page = 1, int PageSize = 20) : IRequest<PagedResult<SubmissionDto>>;

    public record PagedResult<T>(IReadOnlyList<T> Items, int TotalCount, int Page, int PageSize);
}