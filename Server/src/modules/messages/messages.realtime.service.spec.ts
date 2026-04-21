import { JwtService } from '@nestjs/jwt';
import { MessagesRealtimeService } from './messages.realtime.service';

describe('MessagesRealtimeService', () => {
  let service: MessagesRealtimeService;

  beforeEach(() => {
    service = new MessagesRealtimeService({ verify: jest.fn() } as unknown as JwtService);
  });

  it('sends payload to an open socket client', () => {
    const send = jest.fn();
    const client = {
      readyState: 1,
      send,
    };

    (service as any).sendEvent(client, {
      type: 'connected',
      data: { userId: 'user-1' },
    });

    expect(send).toHaveBeenCalledWith(
      JSON.stringify({
        type: 'connected',
        data: { userId: 'user-1' },
      }),
    );
  });
});
