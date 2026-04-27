namespace Krea.Infrastructure.Setup {
    using Microsoft.AspNetCore.Builder;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.Hosting;
    using Microsoft.Extensions.Logging;
    using NLog;
    using NLog.Config;
    using NLog.Targets;
    using NLog.Web;

    /// <summary>
    /// Configures NLog as the logging provider for the application.
    /// </summary>
    internal static class LoggingSetup {
        /// <summary>
        /// Configures NLog as the logging provider for the application.
        /// </summary>
        /// <param name="builder">The <see cref="WebApplicationBuilder"/> used to configure the application's services and middleware.</param>
        public static void ConfigureNLog(WebApplicationBuilder builder) {
            // 1) Remove default providers
            builder.Logging.ClearProviders();

            // 2) Build config in code
            var config = new LoggingConfiguration();

            // console
            var console = new ConsoleTarget("console") {
                Layout = "${longdate}|${level:uppercase=true}|${logger}|${message} ${exception:format=tostring}"
            };
            config.AddTarget(console);

            // file
            string filePath = builder.Environment.IsDevelopment()
                ? Path.Combine(AppContext.BaseDirectory, "logs", "${shortdate}.log")
                : "/data/logs/${shortdate}.log";
            var file = new FileTarget("file") {
                FileName = filePath,
                Layout = console.Layout,
                CreateDirs = true,
                KeepFileOpen = false,
                Encoding = System.Text.Encoding.UTF8
            };
            config.AddTarget(file);

            // Get level from config
            string minLevelStr = builder.Configuration["Logging:LogLevel:Default"] ?? "Information";
            NLog.LogLevel minLevel = MapLogLevel(minLevelStr);

            // EF Core SQL queries rule: Limit to Trace as per requirement.
            // If the global level is Trace, we show them. Otherwise, we hide them.
            if (minLevel <= NLog.LogLevel.Trace) {
                config.AddRule(NLog.LogLevel.Info, NLog.LogLevel.Fatal, console, "Microsoft.EntityFrameworkCore.Database.Command", true);
                config.AddRule(NLog.LogLevel.Info, NLog.LogLevel.Fatal, file, "Microsoft.EntityFrameworkCore.Database.Command", true);
            } else {
                var nullTarget = new NullTarget("null");
                config.AddTarget(nullTarget);
                config.AddRule(NLog.LogLevel.Trace, NLog.LogLevel.Fatal, nullTarget, "Microsoft.EntityFrameworkCore.Database.Command", true);
            }

            // Default rules for everything else
            config.AddRule(minLevel, NLog.LogLevel.Fatal, console);
            config.AddRule(minLevel, NLog.LogLevel.Fatal, file);

            // apply
            LogManager.Configuration = config;
            builder.Host.UseNLog();
            }

            private static NLog.LogLevel MapLogLevel(string level) {
            return level.ToLowerInvariant() switch {
                "trace" => NLog.LogLevel.Trace,
                "debug" => NLog.LogLevel.Debug,
                "information" => NLog.LogLevel.Info,
                "warning" => NLog.LogLevel.Warn,
                "error" => NLog.LogLevel.Error,
                "critical" => NLog.LogLevel.Fatal,
                "none" => NLog.LogLevel.Off,
                _ => NLog.LogLevel.Info
            };
        }
    }
}