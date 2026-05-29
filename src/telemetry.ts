import { Server } from 'socket.io';
import * as http from 'http';

export interface TelemetryEvent {
    id: string;
    action: string;
    target: string;
    info?: string;
    timestamp: string;
    status: 'ALLOW' | 'BLOCK' | 'DENY';
}

export class TelemetryServer {
    private io: Server | null = null;
    private httpServer: http.Server | null = null;

    start(port: number = 3001) {
        if (this.io) return;

        this.httpServer = http.createServer();
        this.io = new Server(this.httpServer, {
            cors: {
                origin: "*", // allow all for hackathon
                methods: ["GET", "POST"]
            }
        });

        this.io.on('connection', (socket) => {
            console.error(`[SIF-Telemetry] Dashboard connected: ${socket.id}`);
        });

        this.httpServer.listen(port, () => {
            console.error(`[SIF-Telemetry] Live Telemetry WebSocket listening on port ${port}`);
        });
    }

    stop() {
        if (this.io) {
            this.io.close();
            this.io = null;
        }
        if (this.httpServer) {
            this.httpServer.close();
            this.httpServer = null;
        }
    }

    emit(event: Omit<TelemetryEvent, 'id' | 'timestamp'>) {
        if (!this.io) return;
        
        const fullEvent: TelemetryEvent = {
            ...event,
            id: Math.random().toString(36).substring(7),
            timestamp: new Date().toISOString().split('T')[1].slice(0, -1) // HH:MM:SS.mmm
        };
        
        this.io.emit('SIF_TELEMETRY', fullEvent);
    }
}

export const telemetry = new TelemetryServer();
