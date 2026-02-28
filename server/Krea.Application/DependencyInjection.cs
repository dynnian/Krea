namespace Krea.Application {
    using Microsoft.Extensions.DependencyInjection;

    public static class DependencyInjection {
        public static IServiceCollection AddApplication(this IServiceCollection services) {
            // Add application services here
            // When services are written do something like this:
            // services.Scan(scan => scan
            //   // look in this assembly (or specify the one containing your services)
            //   .FromAssemblyOf<Service>()
            //   // find all concrete classes that implement IRequestHandler<,>
            //   .AddClasses(classes => classes.AssignableTo(typeof(IRequestHandler<,>)))
            //   // register them as the interface(s) they implement
            //   .AsImplementedInterfaces()
            //   // give them a scoped lifetime
            //   .WithScopedLifetime()
            // );
            return services;
        }
    }
}