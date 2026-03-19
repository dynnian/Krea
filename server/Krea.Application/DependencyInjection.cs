namespace Krea.Application {
    using Abstractions;
    using Abstractions.Feed;
    using Domain.Abstractions;
    using Features.Auth;
    using Features.Auth.ChangePassword;
    using Features.Auth.Register;
    using Features.Auth.Login;
    using Features.Auth.ConfirmEmail;
    using Features.Auth.Refresh;
    using Features.Auth.RevokeToken;
    using Features.Collections.AddPostToCollection;
    using Features.Collections.CreateCollection;
    using Features.Collections.DeleteCollection;
    using Features.Collections.Dto;
    using Features.Collections.GetCollectionById;
    using Features.Collections.GetUserCollections;
    using Features.Collections.RemovePostFromCollection;
    using Features.DirectMessages.Dto;
    using Features.DirectMessages.GetConversation;
    using Features.DirectMessages.GetConversationMessages;
    using Features.DirectMessages.GetUserConversations;
    using Features.DirectMessages.MarkMessageAsRead;
    using Features.DirectMessages.SendDirectMessage;
    using Features.Posts.Dto;
    using Features.Posts.GetAllPosts;
    using Features.Posts.GetPostsByUser;
    using Features.PostUploads.CreatePostUpload;
    using Microsoft.Extensions.DependencyInjection;
    using Features.DirectMessages.Mappings;
    using Features.Donations.CreateDonation;
    using Features.Feed;
    using Features.Follows;
    using Features.Payments.ConfirmPayment;
    using Features.User;
    using Features.Admin.Configuration;
    using Features.Admin.Dashboard;
    using Features.Admin.Reports;
    using Features.Admin.Users;
    using Features.Collections.UploadCollectionCover;
    using Features.Posts.CreatePost;
    using Features.Posts.DeletePost;
    using Features.Posts.Explore;
    using Features.Posts.GetPostById;
    using Features.Posts.Like;
    using Features.Posts.ReplyPost;
    using Features.Posts.Repost;
    using Features.Payments.ConfirmPayment;

    public static class DependencyInjection {
        public static IServiceCollection AddApplication(this IServiceCollection services) {

            services.AddAutoMapper(cfg => { }, typeof(DirectMessageProfile));

            // Auth
            services.AddScoped<IRequestHandler<RegisterCommand, AuthResponse>, RegisterCommandHandler>();
            services.AddScoped<IRequestHandler<LoginQuery, AuthResponse>, LoginQueryHandler>();
            services.AddScoped<IRequestHandler<ConfirmEmailCommand, bool>, ConfirmEmailCommandHandler>();
            services.AddScoped<IRequestHandler<ChangePasswordCommand, bool>, ChangePasswordCommandHandler>();
            services.AddScoped<IRequestHandler<RefreshTokenCommand, AuthResponse?>, RefreshTokenCommandHandler>();
            services.AddScoped<IRequestHandler<RevokeTokenCommand, bool>, RevokeTokenCommandHandler>();
            
            //User
            services.AddScoped<IRequestHandler<FollowUserCommand, Unit>, FollowUserHandler>();
            services.AddScoped<IRequestHandler<UnfollowUserCommand, Unit>, UnfollowUserHandler>();
            services.AddScoped<IRequestHandler<GetUserProfileQuery, UserDto?>, GetUserProfileQueryHandler>();
            services.AddScoped<IRequestHandler<UpdateUserProfileCommand, UserDto>, UpdateUserProfileCommandHandler>();

            // Admin
            services.AddScoped<IRequestHandler<GetAdminUsersQuery, AdminUsersPageDto>, GetAdminUsersHandler>();
            services.AddScoped<IRequestHandler<UpdateAdminUserStatusCommand, Unit>, UpdateAdminUserStatusHandler>();
            services.AddScoped<IRequestHandler<UpdateAdminUserRoleCommand, Unit>, UpdateAdminUserRoleHandler>();
            services.AddScoped<IRequestHandler<DeleteAdminUserCommand, Unit>, DeleteAdminUserHandler>();
            services.AddScoped<IRequestHandler<GetAdminDashboardQuery, AdminDashboardDto>, GetAdminDashboardHandler>();
            services.AddScoped<IRequestHandler<GetAdminReportsOverviewQuery, AdminReportsOverviewDto>, GetAdminReportsOverviewHandler>();
            services.AddScoped<IRequestHandler<GetAdminPostModerationReportsQuery, AdminPostModerationReportsPageDto>, GetAdminPostModerationReportsHandler>();
            services.AddScoped<IRequestHandler<EvaluateAdminPostModerationReportCommand, Unit>, EvaluateAdminPostModerationReportHandler>();
            services.AddScoped<IRequestHandler<GetAdminInstanceConfigurationQuery, AdminInstanceConfigurationDto>, GetAdminInstanceConfigurationHandler>();
            services.AddScoped<IRequestHandler<UpdateAdminInstanceConfigurationCommand, AdminInstanceConfigurationDto>, UpdateAdminInstanceConfigurationHandler>();
            
            //Feed
            services.AddScoped<GetRecentFeedHandler>();
            services.AddScoped<GetTrendingFeedHandler>();
            services.AddScoped<GetFollowingFeedHandler>();
            
            //Collection
            services.AddScoped<IRequestHandler<CreateCollectionCommand, CreateCollectionResponse>, CreateCollectionHandler>();
            services.AddScoped<IRequestHandler<GetUserCollectionsQuery, IReadOnlyList<UserCollectionDto>>, GetUserCollectionsHandler>();
            services.AddScoped<IRequestHandler<DeleteCollectionCommand, Unit>, DeleteCollectionHandler>();
            services.AddScoped<IRequestHandler<AddPostToCollectionCommand, AddPostToCollectionResponse>, AddPostToCollectionHandler>();
            services.AddScoped<IRequestHandler<RemovePostFromCollectionCommand, Unit>,RemovePostFromCollectionHandler>();
            services.AddScoped<IRequestHandler<GetCollectionByIdQuery, CollectionDetailDto?>, GetCollectionByIdQueryHandler>();
            services.AddScoped<IRequestHandler<UploadCollectionCoverCommand, UploadCollectionCoverResponse>, UploadCollectionCoverHandler >();
            
            // Posts
            services.AddScoped<IRequestHandler<GetAllPostsQuery, IReadOnlyList<PostDto>>, GetAllPostsHandler>();
            services.AddScoped<IRequestHandler<GetPostsByUserQuery, IReadOnlyList<PostDto>>, GetPostsByUserHandler>();
            services.AddScoped<IRequestHandler<CreatePostCommand, CreatePostResponse>, CreatePostHandler>();
            services.AddScoped<IRequestHandler<DeletePostCommand, DeletePostResponse>, DeletePostHandler>();
            services.AddScoped<IRequestHandler<GetPostByIdCommand, GetPostByIdResponse?>, GetPostByIdHandler>();
            services.AddScoped<IRequestHandler<ReplyPostCommand, Guid>, ReplyPostHandler>();
            services.AddScoped<IRequestHandler<RepostPostCommand, Guid>, RepostHandler>();
            services.AddScoped<IRequestHandler<LikePostCommand, Unit>, LikePostHandler>();
            services.AddScoped<IRequestHandler<UnlikePostCommand, Unit>, UnlikePostHandler>();
            services.AddScoped<IRequestHandler<CreatePostUploadCommand, CreatePostUploadResponse>, CreatePostUploadHandler>();
            services.AddScoped<IRequestHandler<ExploreQuery, PagedResult<ExplorePostDto>>, ExploreHandler>();
            
            // Messaging
            services.AddScoped<IRequestHandler<GetConversationQuery, ConversationDto>, GetConversationQueryHandler>();
            services.AddScoped<IRequestHandler<MarkMessageAsReadCommand, bool>, MarkMessageAsReadCommandHandler>();
            services.AddScoped<IRequestHandler<SendDirectMessageCommand, DirectMessageDto>, SendDirectMessageCommandHandler>();
            services.AddScoped<IRequestHandler<GetUserConversationsQuery, List<ConversationPreviewDto>>, GetUserConversationsQueryHandler>();
            services.AddScoped<IRequestHandler<GetConversationMessagesQuery, List<DirectMessageDto>>, GetConversationMessagesQueryHandler>();
            
            // Payments
            services.AddScoped<IRequestHandler<ConfirmPaymentCommand, Unit>, ConfirmPaymentCommandHandler>();
            services.AddScoped<IRequestHandler<CreateDonationCommand, CreateDonationResponse>, CreateDonationCommandHandler>();
            
            services.AddScoped<ISender, Sender>();
            
            return services;
        }
    }
}