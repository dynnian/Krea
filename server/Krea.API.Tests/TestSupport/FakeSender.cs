namespace Krea.API.Tests.TestSupport {
    using Domain.Abstractions;

    public sealed class FakeSender : ISender {
        private readonly Dictionary<Type, Func<object, CancellationToken, object?>> _handlers = new();

        public void Register<TRequest, TResponse>(Func<TRequest, CancellationToken, TResponse> handler)
            where TRequest : IRequest<TResponse> =>
            _handlers[typeof(TRequest)] = (request, ct) => handler((TRequest)request, ct);

        public void RegisterAsync<TRequest, TResponse>(Func<TRequest, CancellationToken, Task<TResponse>> handler)
            where TRequest : IRequest<TResponse> =>
            _handlers[typeof(TRequest)] = (request, ct) => handler((TRequest)request, ct);

        public async Task<TResponse> Send<TResponse>(IRequest<TResponse> request,
                                                     CancellationToken cancellationToken = default) {
            if (!_handlers.TryGetValue(request.GetType(), out Func<object, CancellationToken, object?>? handler)) {
                throw new InvalidOperationException(
                    $"No fake handler configured for request type {request.GetType().Name}.");
            }

            object? result = handler(request, cancellationToken);
            if (result is Task<TResponse> typedTask) {
                return await typedTask;
            }

            if (result is TResponse typedResult) {
                return typedResult;
            }

            throw new InvalidOperationException(
                $"Configured fake handler returned incompatible result for {request.GetType().Name}.");
        }
    }
}