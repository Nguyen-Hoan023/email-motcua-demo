using Microsoft.AspNetCore.SignalR;
using MotCua.Application.Interfaces;
using MotCua.API.Hubs;

namespace MotCua.API.Services;

public class HubNotificationService : INotificationService
{
    private readonly IHubContext<MotCuaHub> _hubContext;

    public HubNotificationService(IHubContext<MotCuaHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyDataUpdateAsync()
    {
        await _hubContext.Clients.All.SendAsync("ReceiveDataUpdate");
    }
}
