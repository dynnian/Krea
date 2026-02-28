namespace Krea.Infrastructure.Setup {
    using Microsoft.AspNetCore.Builder;
    using Microsoft.Extensions.Hosting;
    using Microsoft.Extensions.Logging;
    using NLog;
    using NLog.Config;
    using NLog.Targets;
    using NLog.Web;

    /// <summary>
    /// Configures NLog as the logging provider for the application.
    /// </summary>
    /// <remarks>This method performs the following steps to set up NLog: <list type="number"> <item>Removes
    /// the default logging providers.</item> <item>Configures NLog to log to both the console and a file, with
    /// appropriate layouts and file paths based on the environment.</item> <item>Defines logging rules to capture log
    /// messages with levels from <see cref="NLog.LogLevel.Info"/> to <see cref="NLog.LogLevel.Fatal"/>.</item>
    /// <item>Applies the NLog configuration and integrates it with the application's host.</item> </list> In a
    /// development environment, log files are stored in the application's base directory under a "logs" folder.  In a
    /// production environment, log files are stored in the "/data" directory.</remarks>
    internal static class LoggingSetup {
        /// <summary>
        /// Configures NLog as the logging provider for the application.
        /// </summary>
        /// <remarks>This method performs the following actions: <list type="bullet">
        /// <item><description>Clears the default logging providers.</description></item> <item><description>Configures
        /// NLog to log messages to both the console and a file.</description></item> <item><description>Sets up logging
        /// rules to log messages with a severity of <see cref="NLog.LogLevel.Info"/> or higher.</description></item>
        /// </list> The file logging path differs based on the environment: <list type="bullet"> <item><description>In
        /// development, logs are stored in the "logs" directory under the application's base
        /// directory.</description></item> <item><description>In production, logs are stored in the "/data"
        /// directory.</description></item> </list></remarks>
        /// <param name="builder">The <see cref="WebApplicationBuilder"/> used to configure the application's services and middleware.</param>
        public static void ConfigureNLog(WebApplicationBuilder builder) {
            // 1) Remove default providers
            builder.Logging.ClearProviders();

            // 2) Build config in code
            var config = new LoggingConfiguration();

            // console
            var console = new ConsoleTarget("console") {
                Layout = "${longdate}|${level:uppercase=true}|${logger}|${message} ${exception}"
            };
            config.AddTarget(console);

            // file
            string filePath = builder.Environment.IsDevelopment()
                ? Path.Combine(AppContext.BaseDirectory, "logs", "${shortdate}.log")
                : "/data/${shortdate}.log";
            var file = new FileTarget("file") {
                FileName = filePath,
                Layout = console.Layout,
                CreateDirs = true,
                KeepFileOpen = false,
                Encoding = System.Text.Encoding.UTF8
            };
            config.AddTarget(file);

            // rules
            config.AddRule(NLog.LogLevel.Info, NLog.LogLevel.Fatal, console);
            config.AddRule(NLog.LogLevel.Info, NLog.LogLevel.Fatal, file);

            // apply
            LogManager.Configuration = config;
            builder.Host.UseNLog();
        }
    }
}