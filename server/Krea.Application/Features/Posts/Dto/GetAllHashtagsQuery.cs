namespace Krea.Application.Features.Posts.Dto {
    using Domain.Abstractions;
    using Domain.Entities;

    public sealed class GetAllHashtagsQuery : IRequest<IReadOnlyList<Hashtag>>
    {
    }
}