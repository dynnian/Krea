namespace Krea.Application.Features.Posts.Dto;

public sealed record RemoveHashtagCommand(
    Guid PostId,
    Guid HashtagId
);