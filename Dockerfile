FROM node:20-alpine AS client-build
WORKDIR /src/client

COPY client/package.json client/package-lock.json ./
RUN npm ci

COPY client/ ./

RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS server-build
WORKDIR /src

COPY server/Krea.slnx server/Krea.slnx
COPY server/Krea.API/Krea.API.csproj server/Krea.API/
COPY server/Krea.Application/Krea.Application.csproj server/Krea.Application/
COPY server/Krea.Domain/Krea.Domain.csproj server/Krea.Domain/
COPY server/Krea.Infrastructure/Krea.Infrastructure.csproj server/Krea.Infrastructure/

RUN dotnet restore server/Krea.API/Krea.API.csproj

COPY server/ ./server/
COPY --from=client-build /src/client/build/client/ /src/server/Krea.API/wwwroot/

RUN dotnet publish server/Krea.API/Krea.API.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=server-build /app/publish ./
ENTRYPOINT ["dotnet", "Krea.API.dll"]
