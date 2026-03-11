namespace Krea.Application.Features.Collections.CreateCollection {
    using Domain.Abstractions;

    public sealed record CreateCollectionCommand(
        Guid OwnerId,
        string Title,
        string? Description
    ) : IRequest<CreateCollectionResponse>;}