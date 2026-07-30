namespace Krea.Infrastructure.Services {
    // public sealed class LocalFileStorage : IFileStorage
    // {
    //     // private readonly IWebHostEnvironment _environment;
    //     //
    //     // public LocalFileStorage(IWebHostEnvironment environment)
    //     // {
    //     //     _environment = environment;
    //     // }
    //     //
    //     // public async Task<FileStorageResult> SaveAsync(
    //     //     Stream fileStream,
    //     //     string fileName,
    //     //     string contentType,
    //     //     long size,
    //     //     CancellationToken cancellationToken)
    //     // {
    //     //     var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
    //     //
    //     //     if (!Directory.Exists(uploadsFolder))
    //     //         Directory.CreateDirectory(uploadsFolder);
    //     //
    //     //     var filePath = Path.Combine(uploadsFolder, fileName);
    //     //
    //     //     await using var outputStream = new FileStream(filePath, FileMode.Create);
    //     //     await fileStream.CopyToAsync(outputStream, cancellationToken);
    //     //
    //     //     return new FileStorageResult
    //     //     {
    //     //         Url = $"/uploads/{fileName}",
    //     //         FileName = fileName,
    //     //         ContentType = contentType,
    //     //         Size = size
    //     //     };
    //     // }
    //     //
    //     // public async Task DeleteAsync(string fileName, CancellationToken cancellationToken){}
    // }
}