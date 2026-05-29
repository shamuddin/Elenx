import { Server } from 'socket.io';
import * as http from 'http';
export class TelemetryServer {
    io = null;
    httpServer = null;
    start(port = 3001) {
        if (this.io)
            return;
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
    emit(event) {
        if (!this.io)
            return;
        const fullEvent = {
            ...event,
            id: Math.random().toString(36).substring(7),
            timestamp: new Date().toISOString().split('T')[1].slice(0, -1) // HH:MM:SS.mmm
        };
        this.io.emit('SIF_TELEMETRY', fullEvent);
    }
}
export const telemetry = new TelemetryServer();
//# sourceMappingURL=telemetry.js.map