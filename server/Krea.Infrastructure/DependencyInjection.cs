namespace Krea.Infrastructure;

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
using Application.Abstractions.FileStorage;
using Application.Abstractions.Filter;
using Application.Abstractions.Identity;
using Application.Abstractions.Payments;
using Configuration;
using Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Minio;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // DbContext
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));
        
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
        // Register PaymentGateway

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
        services.AddScoped<IGenreRepository, GenreRepository>();
        services.AddScoped<ICollectionRepository, CollectionRepository>();
        services.AddScoped<IMediaRepository, MediaRepository>();
        services.AddScoped<IHashtagRepository, HashtagRepository>();
        services.AddScoped<IFollowRepository, FollowRepository>();
        services.AddScoped<ICollectionRepository, CollectionRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
        services.AddScoped<IInstanceConfigurationRepository, InstanceConfigurationRepository>();
        services.AddScoped<IPostModerationReportRepository, PostModerationReportRepository>();

        // Servicios de aplicación (infraestructura)
        services.AddScoped<IIdentityService, IdentityService>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IInstanceSettingsService, InstanceSettingsService>();
        bool useFakeEmail = configuration.GetValue<bool>("UseFakeEmail");
        if (useFakeEmail)
        {
            services.AddScoped<IEmailService, FakeEmailService>();
        }
        else
        {
            services.AddScoped<IEmailService, EmailService>();
        }
        
        //MinIO
        services.AddSingleton<IMinioClient>(sp =>
        {
            var configuration = sp.GetRequiredService<IConfiguration>();

            return new MinioClient()
                .WithEndpoint(configuration["Minio:Endpoint"])
                .WithCredentials(
                    configuration["Minio:AccessKey"],
                    configuration["Minio:SecretKey"])
                .WithSSL(false)
                .Build();
        });
        
        services.AddScoped<IFileStorage>(sp =>
        {
            var minioClient = sp.GetRequiredService<IMinioClient>();
            var configuration = sp.GetRequiredService<IConfiguration>();

            var baseUrl = configuration["Minio:BaseUrl"]
                          ?? throw new Exception("Minio:BaseUrl is not configured");

            return new MinioFileStorage(minioClient, baseUrl);
        });
        services.AddScoped<IFeedQueryService, FeedQueryService>();
        //services.AddScoped<IFileStorage, LocalFileStorage>();
        services.AddScoped<ICollectionQueries, CollectionQueries>();
        services.AddScoped<ISender, Sender>();
        
        return services;
    }
}