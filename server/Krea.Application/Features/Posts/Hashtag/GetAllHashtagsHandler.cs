namespace Krea.Application.Features.Posts.Hashtag {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;
    using Dto;

    public sealed class GetAllHashtagsHandler
        : IRequestHandler<GetAllHashtagsQuery, IReadOnlyList<Hashtag>> {
        private readonly IHashtagRepository _repository;

        public GetAllHashtagsHandler(IHashtagRepository repository) => _repository = repository;

        public async Task<IReadOnlyList<Hashtag>> Handle(
            GetAllHashtagsQuery request,
            CancellationToken cancellationToken) =>
            await _repository.GetAllAsync(cancellationToken);
    }
}