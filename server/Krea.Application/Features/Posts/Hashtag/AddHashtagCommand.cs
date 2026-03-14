namespace Krea.Application.Features.Posts.Hashtag;

public sealed record AddHashtagCommand(
    Guid PostId,
    string Name
);