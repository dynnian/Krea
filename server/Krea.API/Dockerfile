FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Krea.slnx ./
COPY Krea.API/Krea.API.csproj Krea.API/
COPY Krea.Application/Krea.Application.csproj Krea.Application/
COPY Krea.Domain/Krea.Domain.csproj Krea.Domain/
COPY Krea.Infrastructure/Krea.Infrastructure.csproj Krea.Infrastructure/

RUN dotnet restore Krea.API/Krea.API.csproj

COPY . .
RUN dotnet publish Krea.API/Krea.API.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Krea.API.dll"]
