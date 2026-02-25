namespace Krea.Infrastructure.Data.Configurations {
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Metadata.Builders;
    
    public class FollowConfiguration : IEntityTypeConfiguration<Follow> {
        public void Configure(EntityTypeBuilder<Follow> builder) {
            builder.ToTable("follows");

            builder.HasKey(f => new { f.FollowerId, f.FollowedId });

            builder.HasOne(f => f.Follower)
                   .WithMany(u => u.Following)
                   .HasForeignKey(f => f.FollowerId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(f => f.Followed)
                   .WithMany(u => u.Followers)
                   .HasForeignKey(f => f.FollowedId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}