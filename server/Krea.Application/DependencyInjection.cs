namespace Krea.Application {
    using Abstractions;
    using Domain.Abstractions;
    using Features.Auth;
    using Features.Auth.Register;
    using Features.Auth.Login;
    using Features.Auth.ConfirmEmail;
    using Features.DirectMessages.Dto;
    using Features.DirectMessages.GetConversation;
    using Features.DirectMessages.MarkMessageAsRead;
    using Features.DirectMessages.SendDirectMessage;
    using Features.Posts;
    using Features.Posts.Dto;
    using Features.Posts.GetAllPosts;
    using Microsoft.Extensions.DependencyInjection;
    using Features.DirectMessages.Mappings;

    public static class DependencyInjection {
        public static IServiceCollection AddApplication(this IServiceCollection services) {

            services.AddAutoMapper(cfg => { }, typeof(DirectMessageProfile));

            // Auth
            services.AddScoped<IRequestHandler<RegisterCommand, AuthResponse>, RegisterCommandHandler>();
            services.AddScoped<IRequestHandler<LoginQuery, AuthResponse>, LoginQueryHandler>();
            services.AddScoped<IRequestHandler<ConfirmEmailCommand, bool>, ConfirmEmailCommandHandler>();
            
            // Posts
            services.AddScoped< IRequestHandler<GetAllPostsQuery, IReadOnlyList<PostDto>>, GetAllPostsHandler>();
            services.AddScoped< IRequestHandler<CreatePost.Request, CreatePost.Response>, CreatePost>();
            services.AddScoped< IRequestHandler<AddUpload.Request, AddUpload.Response>, AddUpload>();
            services.AddScoped<ISender, Sender>();
            
            // Messaging
            services.AddScoped< IRequestHandler<GetConversationQuery, ConversationDto>, GetConversationQueryHandler>();
            services.AddScoped< IRequestHandler<MarkMessageAsReadCommand, bool>, MarkMessageAsReadCommandHandler>();
            services.AddScoped< IRequestHandler<SendDirectMessageCommand, DirectMessageDto>, SendDirectMessageCommandHandler>();
            return services;
        }
    }
}