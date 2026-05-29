import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

export interface TelemetryEvent {
  id: string;
  action: string;
  target: string;
  info?: string;
  timestamp: string;
  status: 'ALLOW' | 'BLOCK' | 'DENY';
}

export const useTelemetry = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<TelemetryEvent[]>([]);
  const [securityEvents, setSecurityEvents] = useState<TelemetryEvent[]>([]);
  
  // Cognitive radar data tracking
  const [radarStats, setRadarStats] = useState({
    'DOM Manipulation': 0,
    'Aria-Label Hijack': 0,
    'Prompt Injection': 0,
    'Goal Drift': 0,
    'Visual Obfuscation': 0,
    'Metadata Spoof': 0
  });

  useEffect(() => {
    const socket: Socket = io('/', { path: '/socket.io',
      reconnectionDelayMax: 10000,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to SIF Telemetry server');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from SIF Telemetry server');
    });

    socket.on('SIF_TELEMETRY', (event: TelemetryEvent) => {
      // 1. Update master logs
      setLogs(prev => [...prev.slice(-99), event]);

      // 2. Track security incidents
      if (event.status === 'BLOCK' || event.status === 'DENY') {
        setSecurityEvents(prev => [...prev.slice(-9), event]);
        
        // 3. Update cognitive radar based on keywords
        setRadarStats(prev => {
            const next = { ...prev };
            const infoLower = (event.info || '').toLowerCase();
            const targetLower = (event.target || '').toLowerCase();
            
            if (targetLower.includes('aria') || infoLower.includes('aria')) next['Aria-Label Hijack'] += 10;
            else if (infoLower.includes('semantic') || infoLower.includes('drift')) next['Goal Drift'] += 10;
            else if (infoLower.includes('schema') || infoLower.includes('bifurcation')) next['DOM Manipulation'] += 10;
            else next['Metadata Spoof'] += 10;

            return next;
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Format radar stats for Recharts
  const radarData = Object.entries(radarStats).map(([subject, value]) => ({
    subject,
    A: value,
    fullMark: 150
  }));

  return { isConnected, logs, securityEvents, radarData };
};
