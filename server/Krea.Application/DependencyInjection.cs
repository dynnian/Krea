namespace Krea.Application {
    using Abstractions;
    using Domain.Abstractions;
    using Features.Posts;
    using Features.Posts.Dto;
    using Features.Posts.GetAllPosts;
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

            services.AddScoped<IRequestHandler<GetAllPostsQuery, IReadOnlyList<PostDto>>, GetAllPostsHandler>();
            services.AddScoped<IRequestHandler<CreatePost.Request, CreatePost.Response>, CreatePost>();
            services.AddScoped<IRequestHandler<AddUpload.Request, AddUpload.Response>, AddUpload>();
            services.AddScoped<ISender, Sender>();
            return services;
        }
    }
}