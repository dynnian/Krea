namespace Krea.Application.Features.Notifications.GetUnreadCount {
    using Domain.Abstractions;
    using Domain.Repositories;

    public sealed class GetUnreadCountHandler : IRequestHandler<GetUnreadCountQuery, int> {
        private readonly INotificationRepository _repository;

        public GetUnreadCountHandler(INotificationRepository repository) => _repository = repository;

        public async Task<int> Handle(
            GetUnreadCountQuery request,
            CancellationToken cancellationToken) =>
            await _repository.CountUnreadAsync(request.UserId, cancellationToken);
    }
}