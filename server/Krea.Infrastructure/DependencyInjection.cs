namespace Krea.Infrastructure;

using Data;
using Identity;
using Repositories;
using Services;
using Domain.Abstractions;
using Domain.Repositories;
using Application.Abstractions;
using Application.Abstractions.Auth;
using Application.Abstractions.Email;
using Application.Abstractions.Feed;
using Application.Abstractions.FileStorage;
using Application.Abstractions.Identity;
using Configuration;
using Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

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

        // Repositorios
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IPaymentRepository, PaymentRepository>();
        services.AddScoped<IDonationRepository, DonationRepository>();
        services.AddScoped<IMembershipPlanRepository, MembershipPlanRepository>();
        services.AddScoped<ISubscriptionRepository, SubscriptionRepository>();
        services.AddScoped<ICommissionOfferingRepository, CommissionOfferingRepository>();
        services.AddScoped<ICommissionRequestRepository, CommissionRequestRepository>();
        services.AddScoped<IConversationRepository, ConversationRepository>();
        services.AddScoped<IMessageRepository, MessageRepository>();
        services.AddScoped<IPostRepository, PostRepository>();
        services.AddScoped<IPostUploadRepository, PostUploadRepository>();
        services.AddScoped<IGenreRepository, GenreRepository>();
        services.AddScoped<ICollectionRepository, CollectionRepository>();
        services.AddScoped<IMediaRepository, MediaRepository>();
        services.AddScoped<IHashtagRepository, HashtagRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();

        // Servicios de aplicación (infraestructura)
        services.AddScoped<IIdentityService, IdentityService>();
        services.AddScoped<ITokenService, TokenService>();
        bool useFakeEmail = configuration.GetValue<bool>("UseFakeEmail");
        if (useFakeEmail)
        {
            services.AddScoped<IEmailService, FakeEmailService>();
        }
        else
        {
            services.AddScoped<IEmailService, EmailService>();
        }

        services.AddScoped<IFeedQueryService, FeedQueryService>();
        services.AddScoped<IFileStorage, LocalFileStorage>();
        services.AddScoped<ISender, Sender>();
        
        return services;
    }
}