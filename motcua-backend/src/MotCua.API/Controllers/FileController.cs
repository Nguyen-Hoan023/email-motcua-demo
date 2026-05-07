using Microsoft.AspNetCore.Mvc;
using MotCua.Application.DTOs.File;
using MotCua.Domain.Interfaces;

namespace MotCua.API.Controllers;

[ApiController]
[Route("api/files")]
public class FileController : ControllerBase
{
    private readonly IFileStorageService _fileStorageService;

    public FileController(IFileStorageService fileStorageService)
    {
        _fileStorageService = fileStorageService;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        if (file == null || file.Length == 0) return BadRequest("File is empty.");

        using var stream = file.OpenReadStream();
        var uniqueFileName = await _fileStorageService.SaveFileAsync(file.FileName, stream, file.ContentType);

        return Ok(new FileUploadResponse
        {
            Id = Guid.NewGuid(), // Placeholder for DB record ID if we saved it in TaiNguyen
            TenFile = uniqueFileName
        });
    }

    [HttpGet("{fileName}")]
    public async Task<IActionResult> Get(string fileName)
    {
        var stream = await _fileStorageService.GetFileAsync(fileName);
        if (stream == null) return NotFound();

        return File(stream, "application/octet-stream"); // Consider determining correct MIME type
    }
}
