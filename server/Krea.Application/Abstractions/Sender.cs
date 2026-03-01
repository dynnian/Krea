namespace Krea.Application.Abstractions {
    using Domain.Abstractions;
    using Microsoft.Extensions.DependencyInjection;

    public sealed class Sender : ISender {
        private readonly IServiceProvider _provider;

        public Sender(IServiceProvider provider) => _provider = provider;

        public Task<TResponse> Send<TResponse>(
            IRequest<TResponse> request,
            CancellationToken cancellationToken = default) {
            Type handlerType = typeof(IRequestHandler<,>)
                .MakeGenericType(request.GetType(), typeof(TResponse));

            dynamic handler = _provider.GetRequiredService(handlerType);

            return handler.Handle((dynamic)request, cancellationToken);
        }
    }
}