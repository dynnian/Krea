namespace Krea.API {
    using Infrastructure;
    using Application;

    internal class Program {
        private static void Main(string[] args) {
            WebApplicationBuilder builder = WebApplication.CreateBuilder(args).AddInfrastructure();
            
            builder.Services.AddApplication();
            builder.Services.AddControllers();
            builder.Services.AddOpenApi();

            WebApplication app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment()) {
                app.MapOpenApi();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
