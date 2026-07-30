namespace Krea.Application.Features.Posts.UserReports {
    public static class PostModerationReportReasons {
        public const string Spam = "Spam";
        public const string Harassment = "Harassment";
        public const string HateSpeech = "HateSpeech";
        public const string Nudity = "Nudity";
        public const string Violence = "Violence";
        public const string Copyright = "Copyright";
        public const string Misinformation = "Misinformation";
        public const string Other = "Other";

        public static readonly HashSet<string> Allowed = new(StringComparer.OrdinalIgnoreCase) {
            Spam,
            Harassment,
            HateSpeech,
            Nudity,
            Violence,
            Copyright,
            Misinformation,
            Other
        };
    }
}