using Microsoft.EntityFrameworkCore;
using MotCua.Domain.Entities;

namespace MotCua.Infrastructure.Data;

public class MotCuaDbContext : DbContext
{
    public MotCuaDbContext(DbContextOptions<MotCuaDbContext> options) : base(options)
    {
    }

    public DbSet<NguoiDung> NguoiDungs { get; set; }
    public DbSet<SinhVien> SinhViens { get; set; }
    public DbSet<CanBo> CanBos { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<YeuCauDichVu> YeuCauDichVus { get; set; }
    public DbSet<PhanHoiYeuCau> PhanHoiYeuCaus { get; set; }
    public DbSet<LogYeuCauDichVu> LogYeuCauDichVus { get; set; }
    public DbSet<TaiNguyen> TaiNguyens { get; set; }
    public DbSet<TinNhan> TinNhans { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // TPH (Table Per Hierarchy) for NguoiDung
        modelBuilder.Entity<NguoiDung>()
            .HasDiscriminator<string>("UserType")
            .HasValue<SinhVien>("SinhVien")
            .HasValue<CanBo>("CanBo");

        modelBuilder.Entity<YeuCauDichVu>()
            .HasOne(y => y.SinhVien)
            .WithMany()
            .HasForeignKey(y => y.SinhVienId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PhanHoiYeuCau>()
            .HasOne(p => p.YeuCau)
            .WithMany(y => y.PhanHoiYeuCaus)
            .HasForeignKey(p => p.YeuCauId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<LogYeuCauDichVu>()
            .HasOne(l => l.YeuCau)
            .WithMany(y => y.Logs)
            .HasForeignKey(l => l.YeuCauId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TaiNguyen>()
            .HasOne(t => t.YeuCau)
            .WithMany(y => y.TaiNguyens)
            .HasForeignKey(t => t.YeuCauId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TinNhan>()
            .HasOne(t => t.YeuCau)
            .WithMany()
            .HasForeignKey(t => t.YeuCauId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
