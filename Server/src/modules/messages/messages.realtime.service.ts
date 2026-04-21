import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IncomingMessage, Server as HttpServer } from 'http';
import WebSocket = require('ws');
import { Message } from './message.entity';

type SocketClient = WebSocket & { userId?: string };

@Injectable()
export class MessagesRealtimeService implements OnModuleDestroy {
  private readonly logger = new Logger(MessagesRealtimeService.name);
  private readonly clients = new Map<string, Set<SocketClient>>();
  private server?: WebSocket.Server;
  private attachedHttpServer?: HttpServer;

  constructor(private readonly jwtService: JwtService) {}

  attachServer(httpServer: HttpServer) {
    if (this.server || this.attachedHttpServer === httpServer) {
      return;
    }

    this.attachedHttpServer = httpServer;
    this.server = new WebSocket.Server({ noServer: true });

    httpServer.on('upgrade', (request, socket, head) => {
      const pathname = this.getPathname(request);

      if (pathname !== '/messages/ws') {
        return;
      }

      const userId = this.authenticate(request);

      if (!userId) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      this.server!.handleUpgrade(request, socket, head, (client) => {
        const authedClient = client as SocketClient;
        authedClient.userId = userId;
        this.registerClient(userId, authedClient);
        this.sendEvent(authedClient, {
          type: 'connected',
          data: { userId },
        });
      });
    });
  }

  async publishMessage(message: Message) {
    this.broadcast(message.receiverId, {
      type: 'message:new',
      data: message,
    });
  }

  onModuleDestroy() {
    this.server?.close();
    this.clients.forEach((sockets) => {
      sockets.forEach((socket) => socket.close());
    });
    this.clients.clear();
  }

  private registerClient(userId: string, client: SocketClient) {
    const group = this.clients.get(userId) || new Set<SocketClient>();
    group.add(client);
    this.clients.set(userId, group);

    client.on('close', () => this.unregisterClient(userId, client));
    client.on('error', () => this.unregisterClient(userId, client));
  }

  private unregisterClient(userId: string, client: SocketClient) {
    const group = this.clients.get(userId);

    if (!group) {
      return;
    }

    group.delete(client);

    if (group.size === 0) {
      this.clients.delete(userId);
    }
  }

  private broadcast(userId: string, payload: Record<string, unknown>) {
    const group = this.clients.get(userId);

    if (!group?.size) {
      return;
    }

    group.forEach((client) => this.sendEvent(client, payload));
  }

  private sendEvent(client: SocketClient, payload: Record<string, unknown>) {
    if (client.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      client.send(JSON.stringify(payload));
    } catch (error) {
      this.logger.warn(`推送实时消息失败: ${String(error)}`);
    }
  }

  private authenticate(request: IncomingMessage) {
    const token = this.getToken(request);

    if (!token) {
      return undefined;
    }

    try {
      const payload = this.jwtService.verify<{ sub: string }>(token);
      return payload.sub;
    } catch {
      return undefined;
    }
  }

  private getToken(request: IncomingMessage) {
    const url = request.url ? new URL(request.url, 'http://localhost') : undefined;
    const queryToken = url?.searchParams.get('token');

    if (queryToken) {
      return queryToken;
    }

    const authorization = request.headers.authorization;

    if (authorization?.startsWith('Bearer ')) {
      return authorization.slice(7);
    }

    return undefined;
  }

  private getPathname(request: IncomingMessage) {
    if (!request.url) {
      return '';
    }

    try {
      return new URL(request.url, 'http://localhost').pathname;
    } catch {
      return '';
    }
  }
}
