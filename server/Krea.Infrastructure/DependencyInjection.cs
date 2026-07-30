namespace Krea.Infrastructure {
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
    using Application.Abstractions.Notification;
    using Application.Abstractions.Payments;
    using Configuration;
    using Data;
    using Domain.Abstractions;
    using Domain.Repositories;
    using Identity;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.Extensions.Hosting;
    using Microsoft.Extensions.Logging;
    using Minio;
    using Repositories;
    using Services;
    using System;
    using System.Globalization;

    public static class DependencyInjection {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services,
                                                           IConfiguration configuration,
                                                           IHostEnvironment environment) {
            bool isDevelopment = environment.IsDevelopment();
            IConfiguration infrastructureConfiguration = BuildInfrastructureConfiguration(configuration, isDevelopment);

            string connectionString = GetRequiredConfiguration(
                infrastructureConfiguration,
                "ConnectionStrings:DefaultConnection");

            // DbContext
            services.AddDbContext<AppDbContext>(options => {
                options.UseNpgsql(connectionString,
                    npgsql => npgsql.EnableRetryOnFailure(5, TimeSpan.FromSeconds(10),
                        null));

                if (isDevelopment) {
                    options.EnableDetailedErrors();
                }
            });

            // Seeding
            services.Configure<SeedingOptions>(
                infrastructureConfiguration.GetSection("Seeding")
            );

            services.Configure<AdminUserOptions>(
                infrastructureConfiguration.GetSection("AdminUser")
            );

            services.Configure<InstanceSettingsOptions>(
                infrastructureConfiguration.GetSection("InstanceSettings")
            );

            services.Configure<EmailOptions>(
                infrastructureConfiguration.GetSection("Email")
            );

            services.Configure<JwtOptions>(
                infrastructureConfiguration.GetSection("Jwt")
            );

            services.Configure<MinioOptions>(
                infrastructureConfiguration.GetSection("Minio")
            );

            // Unit Of Work
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            // Identity
            services.AddIdentity<AppUser, IdentityRole<Guid>>(options => {
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
            services.AddScoped<IPaymentReadService, PaymentReadService>();

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
            services.AddScoped<INotificationRepository, NotificationRepository>();
            services.AddScoped<INotificationPreferenceRepository, NotificationPreferenceRepository>();
            services.AddScoped<INotificationGlobalPreferenceRepository, NotificationGlobalPreferenceRepository>();

            // Servicios de aplicación (infraestructura)
            services.AddScoped<IIdentityService, IdentityService>();
            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<IInstanceSettingsService, InstanceSettingsService>();

            bool useFakeEmail = infrastructureConfiguration.GetValue<bool?>("UseFakeEmail") ?? isDevelopment;
            if (useFakeEmail) {
                services.AddScoped<IEmailService, FakeEmailService>();
            }
            else {
                ValidateEmailConfiguration(infrastructureConfiguration);
                services.AddScoped<IEmailService, EmailService>();
            }

            string? rawMinioEndpoint = infrastructureConfiguration["Minio:Endpoint"];
            string minioEndpoint = NormalizeMinioEndpoint(!string.IsNullOrWhiteSpace(rawMinioEndpoint)
                ? rawMinioEndpoint
                : isDevelopment
                    ? "localhost:9000"
                    : "minio:9000");

            if (string.IsNullOrWhiteSpace(minioEndpoint)) {
                minioEndpoint = isDevelopment ? "localhost:9000" : "minio:9000";
            }

            string minioAccessKey = infrastructureConfiguration["Minio:AccessKey"] ?? "minioadmin";
            string minioSecretKey = infrastructureConfiguration["Minio:SecretKey"] ?? "minioadmin";
            string minioBaseUrl = infrastructureConfiguration["Minio:BaseUrl"] ?? "";
            string minioBucket = infrastructureConfiguration["Minio:Bucket"] ?? "uploads";
            bool minioUseSsl = ResolveBooleanConfiguration(infrastructureConfiguration["Minio:UseSsl"], false);

            if (string.IsNullOrWhiteSpace(minioBaseUrl)) {
                // If BaseUrl is empty, it means we want to use the backend proxy.
                // We default to /uploads which is handled by MapUploadsProxy in Program.cs
                minioBaseUrl = "/uploads";
            }

            // MinIO
            services.AddSingleton<IMinioClient>(sp => {
                if (string.IsNullOrWhiteSpace(minioEndpoint)) {
                    throw new InvalidOperationException("MinIO endpoint is not configured.");
                }

                return new MinioClient()
                       .WithEndpoint(minioEndpoint)
                       .WithCredentials(minioAccessKey, minioSecretKey)
                       .WithSSL(minioUseSsl)
                       .Build();
            });

            services.AddScoped<IFileStorage>(sp => {
                var minioClient = sp.GetRequiredService<IMinioClient>();
                var logger = sp.GetRequiredService<ILogger<MinioFileStorage>>();
                return new MinioFileStorage(minioClient, minioBaseUrl, minioBucket, logger);
            });

            services.AddScoped<IFeedQueryService, FeedQueryService>();
            services.AddScoped<ICollectionQueries, CollectionQueries>();
            services.AddScoped<IFileMetadataReader, FileMetadataReader>();
            services.AddScoped<IFileCoverExtractor, FileCoverExtractor>();
            services.AddSingleton<INotificationStream, InMemoryNotificationStream>();
            services.AddScoped<ISender, Sender>();

            return services;
        }

        private static IConfiguration BuildInfrastructureConfiguration(
            IConfiguration configuration,
            bool isDevelopment) {
            bool minioUseSsl = ResolveBooleanConfiguration(
                ReadFirstNonEmptyEnvironmentVariable("MINIO_USE_SSL"),
                configuration.GetValue<bool?>("Minio:UseSsl") ?? false);

            string publicUrl =
                configuration["PublicUrl"]
                ?? (isDevelopment ? "http://localhost:5173" : "http://localhost:3000");

            string minioEndpoint =
                ReadFirstNonEmptyEnvironmentVariable("MINIO_ENDPOINT")
                ?? configuration["Minio:Endpoint"]
                ?? (isDevelopment ? "localhost:9000" : "minio:9000");

            string normalizedMinioEndpoint = NormalizeMinioEndpoint(minioEndpoint);

            string? minioBaseUrl =
                ReadFirstNonEmptyEnvironmentVariable("MINIO_BASE_URL")
                ?? configuration["Minio:BaseUrl"];

            string connectionString = ResolveConnectionString(configuration, isDevelopment);

            var overrides = new Dictionary<string, string?> {
                ["ConnectionStrings:DefaultConnection"] = connectionString,
                ["UseFakeEmail"] = ResolveBooleanConfiguration(
                    ReadFirstNonEmptyEnvironmentVariable("USE_FAKE_EMAIL"),
                    configuration.GetValue<bool?>("UseFakeEmail") ?? isDevelopment)
                    ? "true"
                    : "false",
                ["Jwt:Issuer"] =
                    configuration["Jwt:Issuer"]
                    ?? "KreaAPI",
                ["Jwt:Audience"] =
                    configuration["Jwt:Audience"]
                    ?? "KreaClient",
                ["Jwt:Key"] =
                    ReadFirstNonEmptyEnvironmentVariable("JWT_KEY")
                    ?? configuration["Jwt:Key"]
                    ?? Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(64)),
                ["Seeding:Enabled"] = ResolveBooleanConfiguration(
                    ReadFirstNonEmptyEnvironmentVariable("SEEDING_ENABLED"),
                    configuration.GetValue<bool?>("Seeding:Enabled") ?? false)
                    ? "true"
                    : "false",
                ["AdminUser:Email"] =
                    ReadFirstNonEmptyEnvironmentVariable("ADMIN_EMAIL")
                    ?? configuration["AdminUser:Email"]
                    ?? "admin@krea.local",
                ["AdminUser:Username"] =
                    ReadFirstNonEmptyEnvironmentVariable("ADMIN_USERNAME")
                    ?? configuration["AdminUser:Username"]
                    ?? "admin",
                ["AdminUser:Password"] =
                    ReadFirstNonEmptyEnvironmentVariable("ADMIN_PASSWORD")
                    ?? configuration["AdminUser:Password"],
                ["AdminUser:DisplayName"] =
                    ReadFirstNonEmptyEnvironmentVariable("ADMIN_DISPLAY_NAME")
                    ?? configuration["AdminUser:DisplayName"]
                    ?? "Administrator",
                ["InstanceSettings:PlatformName"] =
                    ReadFirstNonEmptyEnvironmentVariable("INSTANCE_PLATFORM_NAME")
                    ?? configuration["InstanceSettings:PlatformName"]
                    ?? "Krea",
                ["InstanceSettings:Description"] =
                    ReadFirstNonEmptyEnvironmentVariable("INSTANCE_DESCRIPTION")
                    ?? configuration["InstanceSettings:Description"]
                    ?? "A federated platform for artists and creators",
                ["InstanceSettings:AdministratorEmail"] =
                    ReadFirstNonEmptyEnvironmentVariable("INSTANCE_ADMIN_EMAIL")
                    ?? configuration["InstanceSettings:AdministratorEmail"]
                    ?? "admin@krea.local",
                ["Logging:LogLevel:Default"] =
                    ReadFirstNonEmptyEnvironmentVariable("LOG_LEVEL")
                    ?? configuration["Logging:LogLevel:Default"]
                    ?? "Information",
                ["Email:SmtpHost"] =
                    ReadFirstNonEmptyEnvironmentVariable("EMAIL_SMTP_HOST")
                    ?? configuration["Email:SmtpHost"],
                ["Email:SmtpPort"] = ResolveIntegerConfiguration(
                    ReadFirstNonEmptyEnvironmentVariable("EMAIL_SMTP_PORT"),
                    configuration.GetValue<int?>("Email:SmtpPort") ?? 587).ToString(CultureInfo.InvariantCulture),
                ["Email:SmtpUser"] =
                    ReadFirstNonEmptyEnvironmentVariable("EMAIL_SMTP_USER")
                    ?? configuration["Email:SmtpUser"],
                ["Email:SmtpPassword"] =
                    ReadFirstNonEmptyEnvironmentVariable("EMAIL_SMTP_PASSWORD")
                    ?? configuration["Email:SmtpPassword"],
                ["Email:FromAddress"] =
                    ReadFirstNonEmptyEnvironmentVariable("EMAIL_FROM_ADDRESS")
                    ?? configuration["Email:FromAddress"],
                ["Email:UseSsl"] = ResolveBooleanConfiguration(
                    ReadFirstNonEmptyEnvironmentVariable("EMAIL_USE_SSL"),
                    configuration.GetValue<bool?>("Email:UseSsl") ?? true)
                    ? "true"
                    : "false",
                ["Minio:Endpoint"] = normalizedMinioEndpoint,
                ["Minio:AccessKey"] =
                    ReadFirstNonEmptyEnvironmentVariable("MINIO_ACCESS_KEY", "MINIO_ROOT_USER")
                    ?? configuration["Minio:AccessKey"]
                    ?? "minioadmin",
                ["Minio:SecretKey"] =
                    ReadFirstNonEmptyEnvironmentVariable("MINIO_SECRET_KEY", "MINIO_ROOT_PASSWORD")
                    ?? configuration["Minio:SecretKey"]
                    ?? "minioadmin",
                ["Minio:BaseUrl"] = minioBaseUrl!,
                ["Minio:UseSsl"] = minioUseSsl ? "true" : "false",
                ["Minio:Bucket"] =
                    ReadFirstNonEmptyEnvironmentVariable("MINIO_BUCKET")
                    ?? configuration["Minio:Bucket"]
                    ?? "uploads"
            };

            var normalizedOverrides = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);
            foreach ((string key, string? value) in overrides) {
                if (string.IsNullOrWhiteSpace(value)) {
                    continue;
                }

                normalizedOverrides[key] = value;
            }

            return new ConfigurationBuilder()
                   .AddConfiguration(configuration)
                   .AddInMemoryCollection(normalizedOverrides)
                   .Build();
        }

        private static string ResolveConnectionString(IConfiguration configuration, bool isDevelopment) {
            string? explicitConnectionString = ReadFirstNonEmptyEnvironmentVariable(
                "DB_CONNECTION_STRING",
                "DATABASE_URL");

            if (!string.IsNullOrWhiteSpace(explicitConnectionString)) {
                return explicitConnectionString;
            }

            string? configuredConnectionString = configuration.GetConnectionString("DefaultConnection");
            bool hasDbEnvironmentOverride = HasAnyEnvironmentValue(
                "DB_HOST",
                "DB_PORT",
                "DB_NAME",
                "DB_USER",
                "DB_PASSWORD",
                "POSTGRES_DB",
                "POSTGRES_USER",
                "POSTGRES_PASSWORD");

            if (!hasDbEnvironmentOverride && !string.IsNullOrWhiteSpace(configuredConnectionString)) {
                return configuredConnectionString;
            }

            string host =
                ReadFirstNonEmptyEnvironmentVariable("DB_HOST")
                ?? (isDevelopment ? "localhost" : "postgres");

            int port = ResolveIntegerConfiguration(
                ReadFirstNonEmptyEnvironmentVariable("DB_PORT"),
                5432);

            string database =
                ReadFirstNonEmptyEnvironmentVariable("DB_NAME", "POSTGRES_DB")
                ?? (isDevelopment ? "krea_dev" : "krea");

            string username =
                ReadFirstNonEmptyEnvironmentVariable("DB_USER", "POSTGRES_USER")
                ?? "postgres";

            string password =
                ReadFirstNonEmptyEnvironmentVariable("DB_PASSWORD", "POSTGRES_PASSWORD")
                ?? (isDevelopment ? "1234" : "postgres");

            return $"Host={host};Port={port};Database={database};Username={username};Password={password}";
        }

        private static string NormalizeMinioEndpoint(string endpoint) {
            string trimmedEndpoint = endpoint.Trim();
            if (Uri.TryCreate(trimmedEndpoint, UriKind.Absolute, out Uri? uri)) {
                return uri.IsDefaultPort ? uri.Host : $"{uri.Host}:{uri.Port}";
            }

            return trimmedEndpoint.Trim('/');
        }

        private static string BuildUrlFromEndpoint(string endpoint, bool useSsl) {
            string scheme = useSsl ? "https" : "http";
            return $"{scheme}://{endpoint}";
        }

        private static bool HasAnyEnvironmentValue(params string[] variableNames) {
            foreach (string variableName in variableNames) {
                if (!string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable(variableName))) {
                    return true;
                }
            }

            return false;
        }

        private static string? ReadFirstNonEmptyEnvironmentVariable(params string[] variableNames) {
            foreach (string variableName in variableNames) {
                string? value = Environment.GetEnvironmentVariable(variableName);
                if (!string.IsNullOrWhiteSpace(value)) {
                    return value;
                }
            }

            return null;
        }

        private static bool ResolveBooleanConfiguration(string? rawValue, bool fallback) {
            if (string.IsNullOrWhiteSpace(rawValue)) {
                return fallback;
            }

            if (rawValue == "1") {
                return true;
            }

            if (rawValue == "0") {
                return false;
            }

            return bool.TryParse(rawValue, out bool parsed) ? parsed : fallback;
        }

        private static int ResolveIntegerConfiguration(string? rawValue, int fallback) {
            if (string.IsNullOrWhiteSpace(rawValue)) {
                return fallback;
            }

            return int.TryParse(rawValue, NumberStyles.Integer, CultureInfo.InvariantCulture, out int parsed)
                ? parsed
                : fallback;
        }

        private static void ValidateEmailConfiguration(IConfiguration configuration) {
            string[] requiredKeys = [
                "Email:SmtpHost",
                "Email:SmtpUser",
                "Email:SmtpPassword",
                "Email:FromAddress"
            ];

            foreach (string key in requiredKeys) {
                if (string.IsNullOrWhiteSpace(configuration[key])) {
                    throw new InvalidOperationException(
                        $"Missing required configuration value: {key}. Configure SMTP values or enable USE_FAKE_EMAIL.");
                }
            }
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