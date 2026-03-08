namespace Krea.Application.Features.Follows {
    using Domain.Abstractions;
    using Domain.Entities;
    using Domain.Repositories;

    public sealed class FollowUserHandler 
        : IRequestHandler<FollowUserCommand, Unit>
    {
        private readonly IFollowRepository _followRepository;
        private readonly IUnitOfWork _unitOfWork;

        public FollowUserHandler(
            IFollowRepository followRepository,
            IUnitOfWork unitOfWork)
        {
            _followRepository = followRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Unit> Handle(
            FollowUserCommand command,
            CancellationToken cancellationToken)
        {
            if (command.SourceId == command.TargetId)
                throw new InvalidOperationException("User cannot follow himself.");

            bool alreadyFollowing = await _followRepository
                .ExistsAsync(command.SourceId, command.TargetId, cancellationToken);

            if (alreadyFollowing)
                return Unit.Value;

            var follow = new Follow(command.SourceId, command.TargetId);

            await _followRepository.AddAsync(follow, cancellationToken);

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}