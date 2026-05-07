namespace MotCua.Domain.Interfaces;

public interface IFileStorageService
{
    Task<string> SaveFileAsync(string fileName, Stream content, string contentType);
    Task<Stream?> GetFileAsync(string filePath);
    Task<(Stream? stream, string contentType)> GetFileWithTypeAsync(string filePath);
}
