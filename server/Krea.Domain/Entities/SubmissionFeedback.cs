namespace Krea.Domain.Entities {
    public sealed class SubmissionFeedback {
        public Guid Id { get; private set; }
        public Guid SubmissionId { get; private set; }
        public Submission Submission { get; private set; } = null!;
        public Guid AuthorId { get; private set; }
        public User Author { get; private set; } = null!;
        public string Content { get; private set; } = string.Empty;
        public DateTime CreatedAt { get; private set; }
        public DateTime UpdatedAt { get; private set; }

        #pragma warning disable CS8618
        private SubmissionFeedback() { }
        #pragma warning restore CS8618

        public SubmissionFeedback(Submission submission, User author, string content) {
            ArgumentNullException.ThrowIfNull(submission);
            ArgumentNullException.ThrowIfNull(author);
            if (string.IsNullOrWhiteSpace(content))
                throw new ArgumentException("Feedback content is required.");

            Id = Guid.NewGuid();
            Submission = submission;
            SubmissionId = submission.Id;
            Author = author;
            AuthorId = author.Id;
            Content = content;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = CreatedAt;
        }

        public void Edit(string newContent) {
            if (string.IsNullOrWhiteSpace(newContent))
                throw new ArgumentException("Content cannot be empty.");

            Content = newContent;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}