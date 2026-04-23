namespace Krea.Infrastructure {
    using System;
    using Data;
    using Identity;
    using Repositories;
    using Services;
    using Domain.Abstractions;
    using Domain.Repositories;
    using Application.Abstractions;
    using Application.Abstractions.Admin;
    using Application.Abstractions.Auth;
    using Application.Abstractions.Collection;
    using Application.Abstractions.Email;
    using Application.Abstractions.Feed;
    using Application.Abstractions.Files;
    using Application.Abstractions.FileStorage;
    using Application.Abstractions.Filter;
    using Application.Abstractions.Identity;
    using Application.Abstractions.Payments;
    using Configuration;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.Extensions.Hosting;
    using Minio;

    public static class DependencyInjection {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services,
                                                           IConfiguration configuration) {
            string environment = configuration["ASPNETCORE_ENVIRONMENT"]
                                 ?? configuration["DOTNET_ENVIRONMENT"]
                                 ?? Environments.Production;
            bool isDevelopment = environment.Equals(Environments.Development, StringComparison.OrdinalIgnoreCase);

            string connectionString = configuration.GetConnectionString("DefaultConnection")
                                      ?? throw new InvalidOperationException(
                                          "ConnectionStrings:DefaultConnection is required.");

            // DbContext
            services.AddDbContext<AppDbContext>(options => {
                options.UseNpgsql(connectionString,
                    npgsql => npgsql.EnableRetryOnFailure(maxRetryCount: 5, maxRetryDelay: TimeSpan.FromSeconds(10),
                        errorCodesToAdd: null));

                if (isDevelopment) {
                    options.EnableDetailedErrors();
                    options.EnableSensitiveDataLogging();
                }
            });

            // Seeding
            services.Configure<SeedingOptions>(
                configuration.GetSection("Seeding")
            );

            services.Configure<InstanceSettingsOptions>(
                configuration.GetSection("InstanceSettings")
            );

            // Unit Of Work
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            // Identity
            services.AddIdentity<AppUser, IdentityRole<Guid>>(options =>
                {
                    options.Password.RequireDigit = true;
                    options.Password.RequiredLength = 6;
                    options.Password.RequireNonAlphanumeric = false;
                    options.Password.RequireUppercase = true;
                    options.Password.RequireLowercase = true;
                    options.User.RequireUniqueEmail = true;
                    options.SignIn.RequireConfirmedEmail = false;
                })
                .AddRoles<IdentityRole<Guid>>()
                .AddEntityFrameworkStores<AppDbContext>()
                .AddDefaultTokenProviders();
            
            // Pagos
            services.AddScoped<IPaymentQueryService, PaymentQueryService>();
            // Identity
            services.AddIdentity<AppUser, IdentityRole<Guid>>(options =>
                {
                    options.Password.RequireDigit = true;
                    options.Password.RequiredLength = 6;
                    options.Password.RequireNonAlphanumeric = false;
                    options.Password.RequireUppercase = true;
                    options.Password.RequireLowercase = true;
                    options.User.RequireUniqueEmail = true;
                    options.SignIn.RequireConfirmedEmail = false;
                })
                .AddRoles<IdentityRole<Guid>>()
                .AddEntityFrameworkStores<AppDbContext>()
                .AddDefaultTokenProviders();
            
            // Pagos
            services.AddScoped<IPaymentQueryService, PaymentQueryService>();

            // Repositorios
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IDonationRepository, DonationRepository>();
            services.AddScoped<IMembershipPlanRepository, MembershipPlanRepository>();
            services.AddScoped<ISubscriptionRepository, SubscriptionRepository>();
            services.AddScoped<ICommissionOfferingRepository, CommissionOfferingRepository>();
            services.AddScoped<ICommissionRequestRepository, CommissionRequestRepository>();
            services.AddScoped<IConversationRepository, ConversationRepository>();
            services.AddScoped<IMessageRepository, MessageRepository>();
            services.AddScoped<IPostRepository, PostRepository>();
            services.AddScoped<IPostUploadRepository, PostUploadRepository>();
            services.AddScoped<IPostReadRepository, PostReadRepository>();
            services.AddScoped<IPostFavoriteRepository, PostFavoriteRepository>();
            services.AddScoped<IGenreRepository, GenreRepository>();
            services.AddScoped<ICollectionRepository, CollectionRepository>();
            services.AddScoped<IMediaRepository, MediaRepository>();
            services.AddScoped<IHashtagRepository, HashtagRepository>();
            services.AddScoped<IFollowRepository, FollowRepository>();
            services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
            services.AddScoped<IInstanceConfigurationRepository, InstanceConfigurationRepository>();
            services.AddScoped<IPostModerationReportRepository, PostModerationReportRepository>();
            

            // Servicios de aplicación (infraestructura)
            services.AddScoped<IIdentityService, IdentityService>();
            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<IInstanceSettingsService, InstanceSettingsService>();
            bool useFakeEmail = configuration.GetValue<bool?>("UseFakeEmail") ?? isDevelopment;
            if (useFakeEmail) {
                services.AddScoped<IEmailService, FakeEmailService>();
            }
            else {
                services.AddScoped<IEmailService, EmailService>();
            }

            string minioEndpoint = GetRequiredConfiguration(configuration, "Minio:Endpoint");
            string minioAccessKey = GetRequiredConfiguration(configuration, "Minio:AccessKey");
            string minioSecretKey = GetRequiredConfiguration(configuration, "Minio:SecretKey");
            string minioBaseUrl = GetRequiredConfiguration(configuration, "Minio:BaseUrl");
            string minioBucket = configuration["Minio:Bucket"] ?? "uploads";
            bool minioUseSsl = configuration.GetValue<bool>("Minio:UseSsl");

            // MinIO
            services.AddSingleton<IMinioClient>(sp => {
                return new MinioClient()
                       .WithEndpoint(minioEndpoint)
                       .WithCredentials(minioAccessKey, minioSecretKey)
                       .WithSSL(minioUseSsl)
                       .Build();
            });

            services.AddScoped<IFileStorage>(sp => {
                var minioClient = sp.GetRequiredService<IMinioClient>();
                return new MinioFileStorage(minioClient, minioBaseUrl, minioBucket);
            });

            services.AddScoped<IFeedQueryService, FeedQueryService>();
            services.AddScoped<ICollectionQueries, CollectionQueries>();
            services.AddScoped<IFileMetadataReader, FileMetadataReader>();
            services.AddScoped<IFileCoverExtractor, FileCoverExtractor>();
            services.AddScoped<ISender, Sender>();

            return services;
        }

        private static string GetRequiredConfiguration(IConfiguration configuration, string key) {
            string? value = configuration[key];
            if (string.IsNullOrWhiteSpace(value)) {
                throw new InvalidOperationException($"Missing required configuration value: {key}");
            }

            return value;
        }
    }
}