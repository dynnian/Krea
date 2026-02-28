using Microsoft.EntityFrameworkCore;
using Krea.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Krea.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;

namespace Krea.Infrastructure.Data;

public class AppDbContext: IdentityDbContext<AppUser, IdentityRole<Guid>, Guid>
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }
    

    #region DbSets

    public DbSet<User> DomainUsers => Set<User>();
    public DbSet<Role> DomainRoles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<Scope> Scopes => Set<Scope>();
    // public DbSet<UserRole> UserRoles => Set<UserRole>();
    // public DbSet<Follow> Follows => Set<Follow>();

    public DbSet<Post> Posts => Set<Post>();
    public DbSet<PostUpload> PostUploads => Set<PostUpload>();
    // public DbSet<PostFavorite> PostFavorites => Set<PostFavorite>();
    public DbSet<Like> Likes => Set<Like>();
    public DbSet<Hashtag> Hashtags => Set<Hashtag>();

    public DbSet<Media> Media => Set<Media>();
    public DbSet<Metadata> Metadata => Set<Metadata>();
    public DbSet<ImageMetadata> ImageMetadata => Set<ImageMetadata>();
    public DbSet<MusicMetadata> MusicMetadata => Set<MusicMetadata>();
    public DbSet<TextMetadata> TextMetadata => Set<TextMetadata>();
    public DbSet<Genre> Genres => Set<Genre>();
    public DbSet<Collection> Collections => Set<Collection>();

    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<Message> Messages => Set<Message>();

    // public DbSet<Report> Reports => Set<Report>();
    // public DbSet<ReportCategory> ReportCategories => Set<ReportCategory>();
    // public DbSet<ModerationAction> ModerationActions => Set<ModerationAction>();

    public DbSet<MembershipPlan> MembershipPlans => Set<MembershipPlan>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<Donation> Donations => Set<Donation>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<CommissionOffering> CommissionOfferings => Set<CommissionOffering>();
    public DbSet<CommissionRequest> CommissionRequests => Set<CommissionRequest>();

    // public DbSet<Notification> Notifications => Set<Notification>();

    #endregion

    protected override void OnModelCreating(ModelBuilder builder) {
        base.OnModelCreating(builder);

        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}