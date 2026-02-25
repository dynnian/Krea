using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Krea.Infrastructure.Data {
    public static class DependencyInjection {
        public static IServiceCollection AddPersistence(
            this IServiceCollection services,
            IConfiguration configuration) {
            services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(
                    configuration.GetConnectionString("DefaultConnection")));

            return services;
        }
    }
}