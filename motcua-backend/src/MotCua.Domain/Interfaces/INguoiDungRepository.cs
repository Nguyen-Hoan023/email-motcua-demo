using MotCua.Domain.Entities;

namespace MotCua.Domain.Interfaces;

public interface INguoiDungRepository
{
    Task<NguoiDung?> GetByUsernameAsync(string username);
    Task<NguoiDung?> GetByIdAsync(Guid id);
    Task AddAsync(NguoiDung user);
    Task UpdatePasswordAsync(Guid sinhVienId, string accountType, string hashedPassword);
}
