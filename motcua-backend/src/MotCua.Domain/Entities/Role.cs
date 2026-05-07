namespace MotCua.Domain.Entities;

public class Role
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TenRole { get; set; } = string.Empty;
    public string Permissions { get; set; } = string.Empty; // JSON array
}
