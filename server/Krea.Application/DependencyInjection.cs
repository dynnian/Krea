namespace Krea.Application {
    using Abstractions;
    using Abstractions.Feed;
    using Domain.Abstractions;
    using Domain.Entities;
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
    using Features.Favorites.Dto;
    using Features.Posts.GetAllPosts;
    using Features.Posts.GetPostsByUser;
    using Features.PostUploads.CreatePostUpload;
    using Microsoft.Extensions.DependencyInjection;
    using Features.DirectMessages.Mappings;
    using Features.Feed;
    using Features.Follows;
    using Features.User;
    using Features.Admin.Configuration;
    using Features.Admin.Dashboard;
    using Features.Admin.Reports;
    using Features.Admin.Users;
    using Features.Collections.UploadCollectionCover;
    using Features.Favorites.AddPostToFavorites;
    using Features.Favorites.GetUserFavorites;
    using Features.Favorites.RemovePostFromFavorites;
    using Features.Favorites.TogglePostFavorite;
    using Features.Genres;
    using Features.Posts.CreatePost;
    using Features.Posts.DeletePost;
    using Features.Posts.Explore;
    using Features.Posts.GetPostById;
    using Features.Posts.Hashtag;
    using Features.Posts.Like;
    using Features.Posts.ReplyPost;
    using Features.Posts.ReplyPost.GetReplies;
    using Features.Posts.Repost;
    using Features.Posts.UserReports;
    using Features.User.GetReportsByUser;
    using Features.User.SearchUser;

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
            services.AddScoped<IRequestHandler<GetUserProfileQuery, UserProfileDto?>, GetUserProfileQueryHandler>();
            services.AddScoped<IRequestHandler<GetPublicUserProfileQuery, PublicUserProfileResponse?>, GetPublicUserProfileQueryHandler>();
            services.AddScoped<IRequestHandler<UpdateUserProfileCommand, UserDto>, UpdateUserProfileCommandHandler>();
            services.AddScoped<IRequestHandler<GetPublicUserProfileQuery, PublicUserProfileResponse?>, GetPublicUserProfileQueryHandler>();
            services.AddScoped<IRequestHandler<GetFollowersQuery, FollowListResponse>, GetFollowersQueryHandler>();
            services.AddScoped<IRequestHandler<GetFollowingUsersQuery, FollowListResponse>, GetFollowingUsersQueryHandler>();
            services.AddScoped<IRequestHandler<SearchUsersQuery, PaginatedList<UserSearchItemDto>>, SearchUsersHandler>();

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
            services.AddScoped<IRequestHandler<GetRepliesQuery, RepliesResponse>, GetRepliesHandler>();
            services.AddScoped<IRequestHandler<RepostPostCommand, Guid>, RepostHandler>();
            services.AddScoped<IRequestHandler<LikePostCommand, Unit>, LikePostHandler>();
            services.AddScoped<IRequestHandler<UnlikePostCommand, Unit>, UnlikePostHandler>();
            services.AddScoped<IRequestHandler<CreatePostUploadCommand, CreatePostUploadResponse>, CreatePostUploadHandler>();
            services.AddScoped<IRequestHandler<ExploreQuery, PagedResult<ExplorePostDto>>, ExploreHandler>();
            services.AddScoped<IRequestHandler<AssignGenresToUploadCommand, Unit>, AssignGenresToUploadHandler>();
            services.AddScoped<IRequestHandler<AddHashtagCommand, Unit>, AddHashtagHandler>();
            services.AddScoped<IRequestHandler<RemoveHashtagCommand, Unit>, RemoveHashtagHandler>();
            services.AddScoped<IRequestHandler<GetAllHashtagsQuery, IReadOnlyList<Hashtag>>, GetAllHashtagsHandler>();
            services.AddScoped<IRequestHandler<AddPostToFavoritesCommand, bool>, AddPostToFavoritesHandler>();
            services.AddScoped<IRequestHandler<RemovePostFromFavoritesCommand, bool>, RemovePostFromFavoritesHandler>();
            services.AddScoped<IRequestHandler<GetUserFavoritesQuery, FavoritePostsResponse>, GetUserFavoritesHandler>();
            services.AddScoped<IRequestHandler<TogglePostFavoriteCommand, bool>, TogglePostFavoriteHandler>();

            // Reports
            services.AddScoped<IRequestHandler<CreatePostModerationReportCommand, CreatePostModerationReportResponse>, CreatePostModerationReportHandler>();
            services.AddScoped< IRequestHandler<GetMyPostModerationReportsQuery, GetMyPostModerationReportsResponse>, GetMyPostModerationReportsHandler>();
            
            services.AddScoped<ISender, Sender>();
            
            // Messaging
            services.AddScoped< IRequestHandler<GetConversationQuery, ConversationDto>, GetConversationQueryHandler>();
            services.AddScoped< IRequestHandler<MarkMessageAsReadCommand, bool>, MarkMessageAsReadCommandHandler>();
            services.AddScoped< IRequestHandler<SendDirectMessageCommand, DirectMessageDto>, SendDirectMessageCommandHandler>();
            services.AddScoped<IRequestHandler<GetUserConversationsQuery, List<ConversationPreviewDto>>, GetUserConversationsQueryHandler>();
            services.AddScoped<IRequestHandler<GetConversationMessagesQuery, List<DirectMessageDto>>, GetConversationMessagesQueryHandler>();
            
            return services;
        }
    }
}