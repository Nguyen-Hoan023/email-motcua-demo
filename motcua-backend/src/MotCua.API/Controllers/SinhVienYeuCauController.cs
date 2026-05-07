// Định nghĩa cổng kết nối cho FE, GỬI YÊU CẦU TỪ SINH VIÊN lên

using MotCua.API;
using Microsoft.AspNetCore.Mvc;
using MotCua.Application.DTOs.YeuCau;
using MotCua.Application.Interfaces;

namespace MotCua.API.Controllers;

[ApiController]
// Base route cho toàn bộ API phía sinh viên.
[Route("api/sv/yeu-cau")]
public class SinhVienYeuCauController : ControllerBase
{
    private readonly IYeuCauService _yeuCauService;

    // Inject service xử lý nghiệp vụ yêu cầu dịch vụ.
    public SinhVienYeuCauController(IYeuCauService yeuCauService)
    {
        _yeuCauService = yeuCauService;
    }
    // Lấy ID sinh viên 
    private static Guid GetUserId() => DemoUsers.StudentId;
    // API tạo mới yêu cầu dịch vụ từ phía sinh viên.
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] TaoYeuCauRequest request)
    {
        var id = await _yeuCauService.TaoYeuCauAsync(request, GetUserId());
        var chiTiet = await _yeuCauService.LayChiTietAsync(id);
        return CreatedAtAction(nameof(GetById), new { id }, chiTiet);
    }
    // API lấy danh sách yêu cầu của sinh viên hiện tại.
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await _yeuCauService.LayDanhSachSinhVienAsync(GetUserId());
        return Ok(list);
    }
    // API lấy chi tiết một yêu cầu theo ID.
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var chiTiet = await _yeuCauService.LayChiTietAsync(id);
        return Ok(chiTiet);
    }
    // API gửi lại hồ sơ bổ sung khi bị cán bộ yêu cầu chỉnh sửa.

    [HttpPost("{id}/resubmit")]
    public async Task<IActionResult> Resubmit(Guid id, [FromBody] ResubmitRequest request)
    {
        try
        {
            await _yeuCauService.GuiLaiAsync(id, GetUserId(), request.AttachedFiles);
            return Ok(new { message = "Gửi lại thành công." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
