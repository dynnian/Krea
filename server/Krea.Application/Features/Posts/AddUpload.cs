namespace Krea.Application.Features.Posts {
    using Domain.Abstractions;
    using Domain.Repositories;

    public sealed class AddUpload 
        : IRequestHandler<AddUpload.Request, AddUpload.Response>
    {
        private readonly IPostRepository _postRepository;
        private readonly IMediaRepository _mediaRepository;
        private readonly IUnitOfWork _unitOfWork;

        public AddUpload(
            IPostRepository postRepository,
            IMediaRepository mediaRepository,
            IUnitOfWork unitOfWork)
        {
            _postRepository = postRepository;
            _mediaRepository = mediaRepository;
            _unitOfWork = unitOfWork;
        }

        public sealed record Request(
            Guid PostId,
            Guid MediaId,
            bool IsWorkMedia
        ) : IRequest<Response>;

        public sealed record Response(Guid UploadId);

        public async Task<Response> Handle(
            Request request,
            CancellationToken cancellationToken)
        {
            var post = await _postRepository
                           .GetByIdAsync(request.PostId, cancellationToken)
                       ?? throw new Exception("Post not found");

            var media = await _mediaRepository
                            .GetByIdAsync(request.MediaId, cancellationToken)
                        ?? throw new Exception("Media not found");

            var upload = post.AddUpload(media, request.IsWorkMedia);

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new Response(upload.Id);
        }
    }
}