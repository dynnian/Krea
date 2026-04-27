<div align="center">
  <img src="./assets/logo_light_mode.png#light-mode-only" alt="Krea Logo" width="300px">
  <img src="./assets/logo_dark_mode.png#dark-mode-only" alt="Krea Logo" width="300px">
  <h4>A Unified, Decentralized Haven for the Polymath Artist</h4>
  <br/>
</div>

*Krea* is a next-generation social media platform and creative hub built for the **Fediverse**. It is designed to be a cohesive, warm, and artist-centric space where musicians, writers, and visual artists can thrive without the constraints of centralized silos. 

In the current digital landscape, artists are often forced to fragment their identity: a profile for music, a gallery for art, and a blog for writing. *Krea* dissolves these barriers, allowing creators to host their entire portfolio in a single, fully federated home powered by the **ActivityPub** protocol.

## Three Worlds, One Profile

We believe that creativity isn't linear. Our platform bridges the gap between different mediums by providing dedicated tools for three main artistic pillars:

* **The Studio (Sound):** A home for musicians and podcasters. Think high-quality audio streaming, album collections, and discographies—bringing the spirit of **Bandcamp** to the decentralized web.
* **The Library (Word):** A space for novelists, poets, and essayists. With long-form reading experiences and episodic publishing reminiscent of **Wattpad**, writers can finally engage with a federated audience.
* **The Gallery (Visual):** A high-fidelity showcase for digital artists, photographers, and illustrators. Inspired by the community-driven curation of **DeviantArt**, the Gallery focuses on presentation and discovery.

## Key Features

* **Unified Creative Identity:** One profile to rule them all. Publish a song, a short story, and a painting in a single, beautiful timeline.
* **Federated Engagement:** Built on **ActivityPub**, your work is discoverable across the entire Fediverse (Mastodon, Pleroma, PixelFed, etc.) while maintaining the unique features of our platform.
* **Artist Empowerment:** Built-in support for commissions, tips, and donations. We believe artists should be compensated for their labor without predatory platform fees.
* **A Warm Environment:** Designed from the ground up to be a supportive "third place." Our moderation tools and community guidelines are built to foster encouragement and genuine connection.

## Architecture

Krea backend follows a layered architecture:

- Krea.API: HTTP API, authentication setup, SignalR hubs, and transport-level concerns.
- Krea.Application: Use cases, commands/queries, handlers, DTOs, and orchestration.
- Krea.Domain: Core entities, value objects, domain rules, and repository contracts.
- Krea.Infrastructure: EF Core data access, identity, storage, email, and external services.

Frontend is a React Router app optimized for modern web UX and fast iteration.

## Technology Stack

- Backend runtime: ASP.NET Core (.NET 10)
- Data: PostgreSQL + Entity Framework Core
- Auth: ASP.NET Core Identity + JWT access tokens + refresh tokens
- Realtime: SignalR
- File storage: MinIO (S3-compatible)
- Frontend: React 19 + React Router 7 + TypeScript + Vite + Tailwind + Ant Design
- Containerization: Docker + Docker Compose
- Testing: xUnit integration and endpoint tests

## Repository Layout

```text
.
├── client/                    # React Router frontend
├── server/
│   ├── Krea.API/              # ASP.NET Core entrypoint
│   ├── Krea.Application/      # Application layer
│   ├── Krea.Domain/           # Domain layer
│   ├── Krea.Infrastructure/   # Infrastructure layer
│   └── Krea.API.Tests/        # Tests
├── docker-compose.yml         # Production-style self-host stack
└── .env.example               # Environment template
```

## Self-Hosted Deployment (Docker Compose)

This is the recommended way to self host Krea.

### 1. Self-host prerequisites

- Docker Engine and Docker Compose plugin
- Open ports you plan to expose (default: 3000)

### 2. Configure environment variables

From repository root:

```bash
cp .env.example .env
```

Edit `.env` and set secure values at minimum for:

- `DB_PASSWORD`
- `MINIO_SECRET_KEY`

Set `ENFORCE_HTTPS_REDIRECTION=true` only when TLS is terminated in front of the API (for example, behind a reverse proxy with HTTPS).

If you have SMTP configured, set `USE_FAKE_EMAIL=false` and provide all `EMAIL_*` variables.

### 3. Build and start the stack

From repository root:

```bash
docker compose up -d --build
```

### 4. Access services

- App (Frontend + API): `http://localhost:${WEB_PORT}`
- API health endpoint: `http://localhost:${WEB_PORT}/health`

PostgreSQL and MinIO run on an internal Docker network and are not exposed to the host by default.

### 5. Stop or upgrade

```bash
docker compose down
docker compose pull
docker compose up -d --build
```

To remove persistent local data as well:

```bash
docker compose down -v
```

## Development Setup

Use this mode when you want fast local iteration with debugger support.

### 1. Development prerequisites

- .NET 10 SDK
- Node.js 20+
- Docker Engine (for local PostgreSQL and MinIO)

### 2. Start local infrastructure only

From repository root:

```bash
docker compose up -d postgres minio minio_setup
```

### 3. Run backend (development)

From `server/`:

```bash
dotnet run --project Krea.API/Krea.API.csproj
```

The backend reads development defaults from `server/Krea.API/appsettings.Development.json`.

### 4. Run frontend (development)

From `client/`:

```bash
npm ci
npm run dev
```

No `VITE_API_*` variables are required for default local or dockerized runtime.

### 5. Run tests

From `server/`:

```bash
dotnet test Krea.API.Tests/Krea.API.Tests.csproj
```

## Configuration Model

Krea is fully environment-variable friendly for self hosting.
Runtime configuration is resolved in startup/DI code:

- `server/Krea.API/Program.cs` maps API-level all-caps environment variables (public URL, security, seeding/admin defaults, stripe) and generates JWT key defaults at runtime.
- `server/Krea.Infrastructure/DependencyInjection.cs` maps infrastructure all-caps variables (database, MinIO, email, fake-email toggle) and injects typed options into services.

This keeps compose simple and avoids exposing `appsettings` key paths in deployment files.

Examples:

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BASE_URL`, `MINIO_BUCKET`
- `USE_FAKE_EMAIL`, `EMAIL_SMTP_HOST`, `EMAIL_SMTP_PORT`, `EMAIL_SMTP_USER`, `EMAIL_SMTP_PASSWORD`, `EMAIL_FROM_ADDRESS`
- `SEEDING_ENABLED`, `ADMIN_EMAIL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`

This makes deployment predictable across local servers, VPS hosts, and orchestration platforms.

## Fediverse

Krea is built as a first-class Fediverse citizen. ActivityPub integration enables interoperable social experiences while preserving Krea-native publishing, moderation, and creator tools.
