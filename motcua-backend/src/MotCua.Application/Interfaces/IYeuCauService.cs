using MotCua.Application.Interfaces;

namespace MotCua.Application.Interfaces;

public interface IYeuCauService
{
    Task<Guid> TaoYeuCauAsync(DTOs.YeuCau.TaoYeuCauRequest request, Guid sinhVienId);
    Task<IEnumerable<DTOs.YeuCau.YeuCauResponse>> LayDanhSachSinhVienAsync(Guid sinhVienId);
    Task<IEnumerable<DTOs.YeuCau.YeuCauResponse>> LayDanhSachCanBoAsync();
    Task<DTOs.YeuCau.YeuCauChiTietResponse> LayChiTietAsync(Guid id);
    
    Task GuiLaiAsync(Guid id, Guid sinhVienId, List<string>? attachedFiles = null);
    
    Task TiepNhanAsync(Guid id, Guid canBoId);
    Task BatDauXuLyAsync(Guid id, Guid canBoId);
    Task YeuCauBoSungAsync(Guid id, DTOs.YeuCau.YeuCauBoSungRequest request, Guid canBoId);
    Task HoanTatAsync(Guid id, DTOs.YeuCau.HoanTatRequest request, Guid canBoId);
}
