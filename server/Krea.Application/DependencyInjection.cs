namespace Krea.Application {
    using Abstractions;
    using Abstractions.Feed;
    using Domain.Abstractions;
    using Features.Auth;
    using Features.Auth.Register;
    using Features.Auth.Login;
    using Features.Auth.ConfirmEmail;
    using Features.Auth.Refresh;
    using Features.Auth.RevokeToken;
    using Features.DirectMessages.Dto;
    using Features.DirectMessages.GetConversation;
    using Features.DirectMessages.MarkMessageAsRead;
    using Features.DirectMessages.SendDirectMessage;
    using Features.Posts;
    using Features.Posts.Dto;
    using Features.Posts.GetAllPosts;
    using Features.Posts.GetPostsByUser;
    using Features.PostUploads.CreatePostUpload;
    using Microsoft.Extensions.DependencyInjection;
    using Features.DirectMessages.Mappings;
    using Features.Feed;
    using Features.Follows;

    public static class DependencyInjection {
        public static IServiceCollection AddApplication(this IServiceCollection services) {

            services.AddAutoMapper(cfg => { }, typeof(DirectMessageProfile));

            // Auth
            services.AddScoped<IRequestHandler<RegisterCommand, AuthResponse>, RegisterCommandHandler>();
            services.AddScoped<IRequestHandler<LoginQuery, AuthResponse>, LoginQueryHandler>();
            services.AddScoped<IRequestHandler<ConfirmEmailCommand, bool>, ConfirmEmailCommandHandler>();
            services.AddScoped<IRequestHandler<RefreshTokenCommand, AuthResponse?>, RefreshTokenCommandHandler>();
            services.AddScoped<IRequestHandler<RevokeTokenCommand, bool>, RevokeTokenCommandHandler>();
            
            //User
            services.AddScoped<IRequestHandler<FollowUserCommand, Unit>, FollowUserHandler>();
            services.AddScoped<IRequestHandler<UnfollowUserCommand, Unit>, UnfollowUserHandler>();
            
            //Feed
            services.AddScoped<GetRecentFeedHandler>();
            services.AddScoped<GetTrendingFeedHandler>();
            services.AddScoped<GetFollowingFeedHandler>();
            
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
            
            // Messaging
            services.AddScoped< IRequestHandler<GetConversationQuery, ConversationDto>, GetConversationQueryHandler>();
            services.AddScoped< IRequestHandler<MarkMessageAsReadCommand, bool>, MarkMessageAsReadCommandHandler>();
            services.AddScoped< IRequestHandler<SendDirectMessageCommand, DirectMessageDto>, SendDirectMessageCommandHandler>();
            
            return services;
        }
    }
}