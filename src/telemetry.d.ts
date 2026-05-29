export interface TelemetryEvent {
    id: string;
    action: string;
    target: string;
    info?: string;
    timestamp: string;
    status: 'ALLOW' | 'BLOCK' | 'DENY';
}
export declare class TelemetryServer {
    private io;
    private httpServer;
    start(port?: number): void;
    stop(): void;
    emit(event: Omit<TelemetryEvent, 'id' | 'timestamp'>): void;
}
export declare const telemetry: TelemetryServer;
//# sourceMappingURL=telemetry.d.ts.map