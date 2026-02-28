using Krea.Application.Features.Auth;
using Krea.Domain.Abstractions;
using Krea.Domain.Repositories;
using Krea.Infrastructure.Identity;
using Krea.Infrastructure.Repositories;
using Krea.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Krea.Infrastructure.Data;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // DbContext
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));
        
        //Unit Of Work
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
                //options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(30);
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
        services.AddScoped<ICollectionRepository, CollectionRepository>();
        services.AddScoped<IMediaRepository, MediaRepository>();
        
        
        // Servicios de aplicación
        services.AddScoped<IAuthService, AuthService>();

        return services;
    }
}