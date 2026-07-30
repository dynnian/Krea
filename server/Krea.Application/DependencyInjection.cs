namespace Krea.Application {
    using Abstractions;
    using Abstractions.Notification;
    using Domain.Abstractions;
    using Domain.Entities;
    using Features.Admin.Configuration;
    using Features.Admin.Dashboard;
    using Features.Admin.Reports;
    using Features.Admin.Users;
    using Features.Auth;
    using Features.Auth.ChangePassword;
    using Features.Auth.ConfirmEmail;
    using Features.Auth.Login;
    using Features.Auth.Refresh;
    using Features.Auth.Register;
    using Features.Auth.RevokeToken;
    using Features.Collections.AddPostToCollection;
    using Features.Collections.CreateCollection;
    using Features.Collections.DeleteCollection;
    using Features.Collections.Dto;
    using Features.Collections.ExploreCollections;
    using Features.Collections.GetCollectionById;
    using Features.Collections.GetUserCollections;
    using Features.Collections.RemovePostFromCollection;
    using Features.Collections.UpdateCollectionTitle;
    using Features.Collections.UploadCollectionCover;
    using Features.Commissions.AcceptCommissionRequest;
    using Features.Commissions.ActivateOffering;
    using Features.Commissions.AddSubmission;
    using Features.Commissions.AddSubmissionFeedback;
    using Features.Commissions.ApproveCommission;
    using Features.Commissions.CancelCommission;
    using Features.Commissions.CreateCommissionOffering;
    using Features.Commissions.CreateCommissionRequest;
    using Features.Commissions.CreatePaymentForCommission;
    using Features.Commissions.DeactivateOffering;
    using Features.Commissions.DeleteOffering;
    using Features.Commissions.DeliverCommission;
    using Features.Commissions.Dtos;
    using Features.Commissions.EditSubmissionFeedback;
    using Features.Commissions.GetCommissionRequests;
    using Features.Commissions.GetFeedback;
    using Features.Commissions.GetOfferingDetails;
    using Features.Commissions.GetOfferings;
    using Features.Commissions.GetRequestDetails;
    using Features.Commissions.GetSubmissions;
    using Features.Commissions.RequestChanges;
    using Features.Commissions.UpdateCommissionOffering;
    using Features.DirectMessages.Dto;
    using Features.DirectMessages.GetConversation;
    using Features.DirectMessages.GetConversationMessages;
    using Features.DirectMessages.GetUserConversations;
    using Features.DirectMessages.Mappings;
    using Features.DirectMessages.MarkMessageAsRead;
    using Features.DirectMessages.SendDirectMessage;
    using Features.Donations.CreateDonation;
    using Features.Donations.Dtos;
    using Features.Donations.GetUserDonations;
    using Features.Favorites.AddPostToFavorites;
    using Features.Favorites.Dto;
    using Features.Favorites.GetUserFavorites;
    using Features.Favorites.RemovePostFromFavorites;
    using Features.Favorites.TogglePostFavorite;
    using Features.Feed;
    using Features.Follows;
    using Features.Genres;
    using Features.Genres.GetAllGenres;
    using Features.Notifications;
    using Features.Notifications.DeleteNotification;
    using Features.Notifications.Dto;
    using Features.Notifications.GetNotifications;
    using Features.Notifications.GetPreferences;
    using Features.Notifications.GetUnreadCount;
    using Features.Notifications.MarkAllNotificationsAsRead;
    using Features.Notifications.MarkNotificationAsRead;
    using Features.Notifications.UpdateReferences;
    using Features.Payments.ConfirmPayment;
    using Features.Payments.Dtos;
    using Features.Payments.GetReceivedPayments;
    using Features.Payments.GetSentPayments;
    using Features.Posts.CreatePost;
    using Features.Posts.DeletePost;
    using Features.Posts.Dto;
    using Features.Posts.Explore;
    using Features.Posts.GetAllPosts;
    using Features.Posts.GetPostById;
    using Features.Posts.GetPostsByUser;
    using Features.Posts.Hashtag;
    using Features.Posts.Like;
    using Features.Posts.ReplyPost;
    using Features.Posts.ReplyPost.GetReplies;
    using Features.Posts.Repost;
    using Features.Posts.SearchPosts;
    using Features.Posts.UserReports;
    using Features.PostUploads.CreatePostUpload;
    using Features.User;
    using Features.User.GetReportsByUser;
    using Features.User.SearchUser;
    using Features.User.UploadUserProfilePicture;
    using Microsoft.Extensions.DependencyInjection;
    using CommissionsPagedResult =
        Features.Commissions.GetSubmissions.PagedResult<Features.Commissions.Dtos.SubmissionDto>;
    using PostsPagedResult = Features.Posts.Explore.PagedResult<Features.Posts.Dto.ExplorePostDto>;

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
            services
                .AddScoped<IRequestHandler<GetPublicUserProfileQuery, PublicUserProfileResponse?>,
                    GetPublicUserProfileQueryHandler>();
            services.AddScoped<IRequestHandler<UpdateUserProfileCommand, UserDto>, UpdateUserProfileCommandHandler>();
            services
                .AddScoped<IRequestHandler<GetPublicUserProfileQuery, PublicUserProfileResponse?>,
                    GetPublicUserProfileQueryHandler>();
            services.AddScoped<IRequestHandler<GetFollowersQuery, FollowListResponse>, GetFollowersQueryHandler>();
            services
                .AddScoped<IRequestHandler<GetFollowingUsersQuery, FollowListResponse>,
                    GetFollowingUsersQueryHandler>();
            services
                .AddScoped<IRequestHandler<SearchUsersQuery, PaginatedList<UserSearchItemDto>>, SearchUsersHandler>();
            services
                .AddScoped<IRequestHandler<UploadUserProfilePictureCommand, UploadUserProfilePictureResponse>,
                    UploadUserProfilePictureCommandHandler>();

            // Admin
            services.AddScoped<IRequestHandler<GetAdminUsersQuery, AdminUsersPageDto>, GetAdminUsersHandler>();
            services.AddScoped<IRequestHandler<UpdateAdminUserStatusCommand, Unit>, UpdateAdminUserStatusHandler>();
            services.AddScoped<IRequestHandler<UpdateAdminUserRoleCommand, Unit>, UpdateAdminUserRoleHandler>();
            services.AddScoped<IRequestHandler<DeleteAdminUserCommand, Unit>, DeleteAdminUserHandler>();
            services.AddScoped<IRequestHandler<GetAdminDashboardQuery, AdminDashboardDto>, GetAdminDashboardHandler>();
            services
                .AddScoped<IRequestHandler<GetAdminReportsOverviewQuery, AdminReportsOverviewDto>,
                    GetAdminReportsOverviewHandler>();
            services
                .AddScoped<IRequestHandler<GetAdminPostModerationReportsQuery, AdminPostModerationReportsPageDto>,
                    GetAdminPostModerationReportsHandler>();
            services
                .AddScoped<IRequestHandler<EvaluateAdminPostModerationReportCommand, Unit>,
                    EvaluateAdminPostModerationReportHandler>();
            services
                .AddScoped<IRequestHandler<GetAdminInstanceConfigurationQuery, AdminInstanceConfigurationDto>,
                    GetAdminInstanceConfigurationHandler>();
            services
                .AddScoped<IRequestHandler<UpdateAdminInstanceConfigurationCommand, AdminInstanceConfigurationDto>,
                    UpdateAdminInstanceConfigurationHandler>();

            //Feed
            services.AddScoped<GetRecentFeedHandler>();
            services.AddScoped<GetTrendingFeedHandler>();
            services.AddScoped<GetFollowingFeedHandler>();

            //Collection
            services
                .AddScoped<IRequestHandler<CreateCollectionCommand, CreateCollectionResponse>,
                    CreateCollectionHandler>();
            services
                .AddScoped<IRequestHandler<GetUserCollectionsQuery, IReadOnlyList<UserCollectionDto>>,
                    GetUserCollectionsHandler>();
            services.AddScoped<IRequestHandler<DeleteCollectionCommand, Unit>, DeleteCollectionHandler>();
            services
                .AddScoped<IRequestHandler<AddPostToCollectionCommand, AddPostToCollectionResponse>,
                    AddPostToCollectionHandler>();
            services
                .AddScoped<IRequestHandler<RemovePostFromCollectionCommand, Unit>, RemovePostFromCollectionHandler>();
            services
                .AddScoped<IRequestHandler<GetCollectionByIdQuery, CollectionDetailDto?>,
                    GetCollectionByIdQueryHandler>();
            services
                .AddScoped<IRequestHandler<UploadCollectionCoverCommand, UploadCollectionCoverResponse>,
                    UploadCollectionCoverHandler>();
            services
                .AddScoped<IRequestHandler<UpdateCollectionTitleCommand, UpdateCollectionTitleResponse>,
                    UpdateCollectionTitleCommandHandler>();
            services.AddScoped<
                IRequestHandler<ExploreCollectionsQuery, PaginatedList<CollectionExploreDto>>,
                ExploreCollectionsHandler>();

            // Posts
            services.AddScoped<IRequestHandler<GetAllPostsQuery, IReadOnlyList<PostDto>>, GetAllPostsHandler>();
            services.AddScoped<IRequestHandler<GetPostsByUserQuery, IReadOnlyList<PostDtoV2>>, GetPostsByUserHandler>();
            services.AddScoped<IRequestHandler<CreatePostCommand, CreatePostResponse>, CreatePostHandler>();
            services.AddScoped<IRequestHandler<DeletePostCommand, DeletePostResponse>, DeletePostHandler>();
            services.AddScoped<IRequestHandler<GetPostByIdCommand, GetPostByIdResponse?>, GetPostByIdHandler>();
            services.AddScoped<IRequestHandler<ReplyPostCommand, Guid>, ReplyPostHandler>();
            services.AddScoped<IRequestHandler<GetRepliesQuery, RepliesResponse>, GetRepliesHandler>();
            services.AddScoped<IRequestHandler<RepostPostCommand, Guid>, RepostHandler>();
            services.AddScoped<IRequestHandler<LikePostCommand, Unit>, LikePostHandler>();
            services.AddScoped<IRequestHandler<UnlikePostCommand, Unit>, UnlikePostHandler>();
            services
                .AddScoped<IRequestHandler<CreatePostUploadCommand, CreatePostUploadResponse>,
                    CreatePostUploadHandler>();
            services.AddScoped<IRequestHandler<ExploreQuery, PostsPagedResult>, ExploreHandler>();
            services.AddScoped<IRequestHandler<AssignGenresToUploadCommand, Unit>, AssignGenresToUploadHandler>();
            services.AddScoped<IRequestHandler<GetAllGenresCommand, IReadOnlyList<GenreDto>>, GetAllGenresHandler>();
            services.AddScoped<IRequestHandler<AddHashtagCommand, Unit>, AddHashtagHandler>();
            services.AddScoped<IRequestHandler<RemoveHashtagCommand, Unit>, RemoveHashtagHandler>();
            services.AddScoped<IRequestHandler<GetAllHashtagsQuery, IReadOnlyList<Hashtag>>, GetAllHashtagsHandler>();
            services.AddScoped<IRequestHandler<AddPostToFavoritesCommand, bool>, AddPostToFavoritesHandler>();
            services.AddScoped<IRequestHandler<RemovePostFromFavoritesCommand, bool>, RemovePostFromFavoritesHandler>();
            services
                .AddScoped<IRequestHandler<GetUserFavoritesQuery, FavoritePostsResponse>, GetUserFavoritesHandler>();
            services.AddScoped<IRequestHandler<TogglePostFavoriteCommand, bool>, TogglePostFavoriteHandler>();
            services
                .AddScoped<IRequestHandler<SearchPostsQuery, PaginatedList<PostSearchItemDto>>, SearchPostsHandler>();

            // Reports
            services
                .AddScoped<IRequestHandler<CreatePostModerationReportCommand, CreatePostModerationReportResponse>,
                    CreatePostModerationReportHandler>();
            services
                .AddScoped<IRequestHandler<GetMyPostModerationReportsQuery, GetMyPostModerationReportsResponse>,
                    GetMyPostModerationReportsHandler>();

            services.AddScoped<ISender, Sender>();

            services
                .AddScoped<IRequestHandler<ExploreQuery, Features.Posts.Explore.PagedResult<ExplorePostDto>>,
                    ExploreHandler>();

            // Messaging
            services.AddScoped<IRequestHandler<GetConversationQuery, ConversationDto>, GetConversationQueryHandler>();
            services.AddScoped<IRequestHandler<MarkMessageAsReadCommand, bool>, MarkMessageAsReadCommandHandler>();
            services
                .AddScoped<IRequestHandler<SendDirectMessageCommand, DirectMessageDto>,
                    SendDirectMessageCommandHandler>();
            services
                .AddScoped<IRequestHandler<GetUserConversationsQuery, List<ConversationPreviewDto>>,
                    GetUserConversationsQueryHandler>();
            services
                .AddScoped<IRequestHandler<GetConversationMessagesQuery, List<DirectMessageDto>>,
                    GetConversationMessagesQueryHandler>();

            //Notifications
            services
                .AddScoped<IRequestHandler<GetMyNotificationsQuery, IReadOnlyList<NotificationDto>>,
                    GetMyNotificationsHandler>();
            services.AddScoped<IRequestHandler<GetUnreadCountQuery, int>, GetUnreadCountHandler>();
            services.AddScoped<IRequestHandler<MarkNotificationAsReadCommand, Unit>, MarkNotificationAsReadHandler>();
            services
                .AddScoped<IRequestHandler<MarkAllNotificationsAsReadCommand, Unit>,
                    MarkAllNotificationsAsReadHandler>();
            services.AddScoped<IRequestHandler<DeleteNotificationCommand, Unit>, DeleteNotificationHandler>();
            services
                .AddScoped<IRequestHandler<GetNotificationPreferencesQuery, NotificationPreferencesDto>,
                    GetNotificationPreferencesHandler>();
            services
                .AddScoped<IRequestHandler<UpdateNotificationPreferencesCommand, Unit>,
                    UpdateNotificationPreferencesHandler>();
            services.AddScoped<INotificationService, NotificationService>();
            services
                .AddScoped<IRequestHandler<SendDirectMessageCommand, DirectMessageDto>,
                    SendDirectMessageCommandHandler>();
            services
                .AddScoped<IRequestHandler<GetUserConversationsQuery, List<ConversationPreviewDto>>,
                    GetUserConversationsQueryHandler>();
            services
                .AddScoped<IRequestHandler<GetConversationMessagesQuery, List<DirectMessageDto>>,
                    GetConversationMessagesQueryHandler>();

            // Payments
            services.AddScoped<IRequestHandler<ConfirmPaymentCommand, Unit>, ConfirmPaymentCommandHandler>();
            services
                .AddScoped<IRequestHandler<GetSentPaymentsQuery, Abstractions.Payments.PagedResult<PaymentSummaryDto>>,
                    GetSentPaymentsQueryHandler>();
            services
                .AddScoped<IRequestHandler<GetReceivedPaymentsQuery,
                    Abstractions.Payments.PagedResult<PaymentSummaryDto>>, GetReceivedPaymentsQueryHandler>();

            // Donations
            services
                .AddScoped<IRequestHandler<CreateDonationCommand, CreateDonationResponse>,
                    CreateDonationCommandHandler>();
            services
                .AddScoped<IRequestHandler<GetUserDonationsQuery, Abstractions.Payments.PagedResult<DonationDto>>,
                    GetUserDonationsQueryHandler>();

            // Commission Offering
            services
                .AddScoped<IRequestHandler<CreateCommissionOfferingCommand, CreateCommissionOfferingResponse>,
                    CreateCommissionOfferingCommandHandler>();
            services
                .AddScoped<IRequestHandler<UpdateCommissionOfferingCommand, Unit>,
                    UpdateCommissionOfferingCommandHandler>();
            services.AddScoped<IRequestHandler<ActivateOfferingCommand, Unit>, ActivateOfferingCommandHandler>();
            services.AddScoped<IRequestHandler<DeactivateOfferingCommand, Unit>, DeactivateOfferingCommandHandler>();
            services.AddScoped<IRequestHandler<DeleteOfferingCommand, Unit>, DeleteOfferingCommandHandler>();
            services
                .AddScoped<IRequestHandler<GetOfferingsQuery, IReadOnlyList<CommissionOfferingDto>>,
                    GetOfferingsQueryHandler>();
            services
                .AddScoped<IRequestHandler<GetOfferingDetailsQuery, CommissionOfferingDto>,
                    GetOfferingDetailsQueryHandler>();

            // Commission Request
            services
                .AddScoped<IRequestHandler<CreateCommissionRequestCommand, CreateCommissionRequestResponse>,
                    CreateCommissionRequestCommandHandler>();
            services
                .AddScoped<IRequestHandler<AcceptCommissionRequestCommand, Unit>,
                    AcceptCommissionRequestCommandHandler>();
            services
                .AddScoped<IRequestHandler<CreatePaymentForCommissionCommand, CreatePaymentForCommissionResponse>,
                    CreatePaymentForCommissionCommandHandler>();
            services.AddScoped<IRequestHandler<AddSubmissionCommand, Unit>, AddSubmissionCommandHandler>();
            services.AddScoped<IRequestHandler<DeliverCommissionCommand, Unit>, DeliverCommissionCommandHandler>();
            services.AddScoped<IRequestHandler<ApproveCommissionCommand, Unit>, ApproveCommissionCommandHandler>();
            services.AddScoped<IRequestHandler<RequestChangesCommand, Unit>, RequestChangesCommandHandler>();
            services.AddScoped<IRequestHandler<CancelCommissionCommand, Unit>, CancelCommissionCommandHandler>();
            services
                .AddScoped<IRequestHandler<GetCommissionRequestsQuery, IReadOnlyList<CommissionRequestDto>>,
                    GetCommissionRequestsQueryHandler>();
            services
                .AddScoped<IRequestHandler<GetRequestDetailsQuery, CommissionRequestDto>,
                    GetRequestDetailsQueryHandler>();
            services
                .AddScoped<IRequestHandler<GetSubmissionsQuery, CommissionsPagedResult>, GetSubmissionsQueryHandler>();

            // Submission Feedback
            services
                .AddScoped<IRequestHandler<AddSubmissionFeedbackCommand, Unit>, AddSubmissionFeedbackCommandHandler>();
            services
                .AddScoped<IRequestHandler<EditSubmissionFeedbackCommand, Unit>,
                    EditSubmissionFeedbackCommandHandler>();
            services
                .AddScoped<IRequestHandler<GetFeedbackQuery, IReadOnlyList<SubmissionFeedbackDto>>,
                    GetFeedbackQueryHandler>();

            services.AddScoped<ISender, Sender>();

            return services;
        }
    }
}