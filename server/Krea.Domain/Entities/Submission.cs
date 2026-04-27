namespace Krea.Domain.Entities {
    public sealed class Submission {
        public Guid Id { get; private set; }

        public Guid RequestId { get; private set; }
        public CommissionRequest Request { get; private set; }

        public Guid MediaId { get; private set; }
        public Media Media { get; private set; }

        private readonly List<SubmissionFeedback> _feedback = new();
        public IReadOnlyCollection<SubmissionFeedback> Feedback => _feedback;

        #pragma warning disable CS8618
        private Submission() { }
        #pragma warning disable CS8618

        public Submission(CommissionRequest request, Media media) {
            ArgumentNullException.ThrowIfNull(request);
            ArgumentNullException.ThrowIfNull(media);

            Id = Guid.NewGuid();
            Request = request;
            RequestId = request.Id;
            Media = media;
            MediaId = media.Id;
        }

        public void AddFeedback(User author, string content) {
            ArgumentNullException.ThrowIfNull(author);
            if (string.IsNullOrWhiteSpace(content)) throw new ArgumentException("Feedback content is required.");

            var feedback = new SubmissionFeedback(this, author, content);
            _feedback.Add(feedback);
        }
    }
}