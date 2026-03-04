namespace Krea.Application {
    using Abstractions;
    using Domain.Abstractions;
    using Features.Auth;
    using Features.Auth.Register;
    using Features.Auth.Login;
    using Features.Auth.ConfirmEmail;
    using Features.Posts;
    using Features.Posts.Dto;
    using Features.Posts.GetAllPosts;
    using Features.Posts.GetPostsByUser;
    using Features.PostUploads.CreatePostUpload;
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
            
            // Auth
            services.AddScoped<IRequestHandler<RegisterCommand, AuthResponse>, RegisterCommandHandler>();
            services.AddScoped<IRequestHandler<LoginQuery, AuthResponse>, LoginQueryHandler>();
            services.AddScoped<IRequestHandler<ConfirmEmailCommand, bool>, ConfirmEmailCommandHandler>();
            
            // Posts
            services.AddScoped<IRequestHandler<GetAllPostsQuery, IReadOnlyList<PostDto>>, GetAllPostsHandler>();
            services.AddScoped<IRequestHandler<GetPostsByUserQuery, IReadOnlyList<PostDto>>, GetPostsByUserHandler>();
            services.AddScoped<IRequestHandler<GetPostById.Request, GetPostById.Response?>, GetPostById>();
            services.AddScoped<IRequestHandler<CreatePost.Request, CreatePost.Response>, CreatePost>();
            services.AddScoped<IRequestHandler<DeletePost.Request, DeletePost.Response>, DeletePost>();
            services.AddScoped<IRequestHandler<ReplyPostCommand, Guid>, ReplyPostHandler>();
            services.AddScoped<IRequestHandler<RepostPostCommand, Guid>, RepostHandler>();
            services.AddScoped<IRequestHandler<LikePostCommand, Unit>, LikePostHandler>();
            services.AddScoped<IRequestHandler<UnlikePostCommand, Unit>, UnlikePostHandler>();
            services.AddScoped<IRequestHandler<CreatePostUploadCommand, CreatePostUploadResponse>, CreatePostUploadHandler>();
            
            services.AddScoped<ISender, Sender>();
            return services;
        }
    }
}