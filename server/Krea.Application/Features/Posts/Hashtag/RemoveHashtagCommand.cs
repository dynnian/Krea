namespace Krea.Application.Features.Posts.Hashtag;

public sealed record RemoveHashtagCommand(
    Guid PostId,
    Guid HashtagId
);