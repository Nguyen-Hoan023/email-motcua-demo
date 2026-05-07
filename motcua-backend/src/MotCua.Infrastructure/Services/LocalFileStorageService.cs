using MotCua.Domain.Interfaces;

namespace MotCua.Infrastructure.Services;

public class LocalFileStorageService : IFileStorageService
{
    private readonly string _uploadFolder = "uploads";

    public LocalFileStorageService()
    {
        if (!Directory.Exists(_uploadFolder))
        {
            Directory.CreateDirectory(_uploadFolder);
        }
    }

    public async Task<Stream?> GetFileAsync(string filePath)
    {
        var fullPath = Path.Combine(_uploadFolder, filePath);
        if (!File.Exists(fullPath)) return null;

        var memoryStream = new MemoryStream();
        using (var stream = new FileStream(fullPath, FileMode.Open))
        {
            await stream.CopyToAsync(memoryStream);
        }
        memoryStream.Position = 0;
        return memoryStream;
    }

    public async Task<string> SaveFileAsync(string fileName, Stream content, string contentType)
    {
        var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";
        var fullPath = Path.Combine(_uploadFolder, uniqueFileName);

        using (var fileStream = new FileStream(fullPath, FileMode.Create))
        {
            await content.CopyToAsync(fileStream);
        }

        return uniqueFileName;
    }

    public async Task<(Stream? stream, string contentType)> GetFileWithTypeAsync(string filePath)
    {
        // Chặn path traversal attack — chỉ lấy tên file, bỏ đường dẫn lạ
        var safeName = Path.GetFileName(filePath);
        var fullPath = Path.Combine(_uploadFolder, safeName);

        if (!File.Exists(fullPath))
            return (null, string.Empty);

        // Tự xác định Content-Type thủ công để tránh lỗi thư viện
        var ext = Path.GetExtension(fullPath).ToLowerInvariant();
        var contentType = ext switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".webp" => "image/webp",
            ".pdf" => "application/pdf",
            ".doc" or ".docx" => "application/msword",
            _ => "application/octet-stream",
        };

        var memoryStream = new MemoryStream();
        using (var stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read))
        {
            await stream.CopyToAsync(memoryStream);
        }
        memoryStream.Position = 0;

        return (memoryStream, contentType);
    }
}
