//DỊNH NGHĨA CÁC CỔNG KẾT NỐI CHO FE, TIẾP NHẬN YÊU CẦU TỪ SINH VIÊN 

using MotCua.API;
using Microsoft.AspNetCore.Mvc;
using MotCua.Application.DTOs.YeuCau;
using MotCua.Application.Interfaces;

namespace MotCua.API.Controllers;

[ApiController]

// Base route cho toàn bộ API xử lý yêu cầu phía cán bộ.
[Route("api/canbo/yeu-cau")]
public class CanBoYeuCauController : ControllerBase
{
    private readonly IYeuCauService _yeuCauService;

    // Inject service xử lý nghiệp vụ yêu cầu dịch vụ.
    public CanBoYeuCauController(IYeuCauService yeuCauService)
    {
        _yeuCauService = yeuCauService;
    }
    // Lấy ID cán bộ demo thay cho authentication thật.
    private static Guid GetUserId() => DemoUsers.OfficerId;
    // API lấy toàn bộ danh sách yêu cầu cho cán bộ.
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await _yeuCauService.LayDanhSachCanBoAsync();
        return Ok(list);
    }
// Lấy chi tiết một yêu cầu gồm phản hồi, log và file.  
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var chiTiet = await _yeuCauService.LayChiTietAsync(id);
        return Ok(chiTiet);
    }
// API tiếp nhận yêu cầu, thay đổi trạng thái SV->CB và ghi log/tin nhắn.
    [HttpPost("{id}/tiep-nhan")]
    public async Task<IActionResult> TiepNhan(Guid id)
    {
        try
        {
            await _yeuCauService.TiepNhanAsync(id, GetUserId());
            var chiTiet = await _yeuCauService.LayChiTietAsync(id);
            return Ok(chiTiet);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
    // API cập nhật trạng thái bắt đầu xử lý, ghi log và thông báo.
    [HttpPost("{id}/bat-dau-xu-ly")]
    public async Task<IActionResult> BatDauXuLy(Guid id)
    {
        try
        {
            await _yeuCauService.BatDauXuLyAsync(id, GetUserId());
            var chiTiet = await _yeuCauService.LayChiTietAsync(id);
            return Ok(chiTiet);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
// API yêu cầu sinh viên bổ sung hồ sơ hoặc minh chứng.
    [HttpPost("{id}/yeu-cau-bo-sung")]
    public async Task<IActionResult> YeuCauBoSung(Guid id, [FromBody] YeuCauBoSungRequest request)
    {
        try
        {
            await _yeuCauService.YeuCauBoSungAsync(id, request, GetUserId());
            var chiTiet = await _yeuCauService.LayChiTietAsync(id);
            return Ok(chiTiet);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
 // API hoàn tất yêu cầu và trả kết quả reset tài khoản.
    [HttpPost("{id}/hoan-tat")]
    public async Task<IActionResult> HoanTat(Guid id, [FromBody] HoanTatRequest request)
    {
        try
        {
            await _yeuCauService.HoanTatAsync(id, request, GetUserId());
            var chiTiet = await _yeuCauService.LayChiTietAsync(id);
            return Ok(chiTiet);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
