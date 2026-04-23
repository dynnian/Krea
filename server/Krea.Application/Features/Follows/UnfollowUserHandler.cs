namespace Krea.Application.Features.Follows {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;

    public sealed class UnfollowUserHandler
        : IRequestHandler<UnfollowUserCommand, Unit> {
        private readonly IFollowRepository _followRepository;
        private readonly IUnitOfWork _unitOfWork;

        public UnfollowUserHandler(
            IFollowRepository followRepository,
            IUnitOfWork unitOfWork) {
            _followRepository = followRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Unit> Handle(
            UnfollowUserCommand command,
            CancellationToken cancellationToken) {
            Follow? follow = await _followRepository
                .GetAsync(command.SourceId, command.TargetId, cancellationToken);

            if (follow is null)
                return Unit.Value;

            _followRepository.Remove(follow);

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}