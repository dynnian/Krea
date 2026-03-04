namespace Krea.Application.Features.Posts.Dto;

public sealed record AddHashtagCommand(
    Guid PostId,
    string Name
);