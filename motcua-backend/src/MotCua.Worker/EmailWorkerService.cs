using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MotCua.Domain.Enums;
using MotCua.Domain.Interfaces;

namespace MotCua.Worker;

public class EmailWorkerService : BackgroundService
{
    private readonly ILogger<EmailWorkerService> _logger;
    private readonly IServiceProvider _serviceProvider;

    public EmailWorkerService(ILogger<EmailWorkerService> logger, IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("EmailWorkerService is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessPendingMessagesAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while processing messages.");
            }

            await Task.Delay(5000, stoppingToken); // Check every 5 seconds
        }

        _logger.LogInformation("EmailWorkerService is stopping.");
    }

    // Quét Database và giả lập gửi email cho các tin nhắn đang chờ (PENDING)
    private async Task ProcessPendingMessagesAsync(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var tinNhanRepository = scope.ServiceProvider.GetRequiredService<ITinNhanRepository>();

        var pendingMessages = await tinNhanRepository.GetPendingMessagesAsync();
        
        if (!pendingMessages.Any()) return;

        _logger.LogInformation($"Found {pendingMessages.Count()} pending messages. Processing...");

        foreach (var message in pendingMessages)
        {
            if (stoppingToken.IsCancellationRequested) break;

            // Mark as PROCESSING
            message.TrangThai = TrangThaiTinNhan.PROCESSING;
            await tinNhanRepository.UpdateAsync(message);

            try
            {
                // Simulate sending email/notification
                _logger.LogInformation($"[SENDING] Type: {message.LoaiTinNhan}, To: {message.EmailNhan}, Content: {message.NoiDung}");
                
                await Task.Delay(1000, stoppingToken); // Simulate network delay

                // Mark as SENT
                message.TrangThai = TrangThaiTinNhan.SENT;
                message.SentAt = DateTime.UtcNow;
                _logger.LogInformation($"[SUCCESS] Message ID: {message.Id} sent successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"[FAILED] Failed to send message ID: {message.Id}.");
                message.TrangThai = TrangThaiTinNhan.FAILED;
            }

            await tinNhanRepository.UpdateAsync(message);
        }
    }
}
