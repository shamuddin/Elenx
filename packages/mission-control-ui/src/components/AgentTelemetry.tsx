import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Code, Cpu, ShieldAlert, ArrowRight } from 'lucide-react';
import { TelemetryEvent } from '../hooks/useTelemetry';

interface Props {
  logs: TelemetryEvent[];
  isConnected: boolean;
}

const AgentTelemetry: React.FC<Props> = ({ logs, isConnected }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="h-full flex flex-col font-mono text-sm bg-[#fafafa] rounded border border-[#e5e5e5] p-2 overflow-hidden relative shadow-inner">
      
      <div className="flex justify-between items-center px-3 py-2 border-b border-[#e5e5e5] mb-2 bg-white rounded-t shadow-sm">
        <div className="flex items-center gap-2 text-[#666666] text-xs font-bold">
          <Terminal className="w-4 h-4 text-black" />
          <span>ELENX_INTERCEPTOR // Localhost TCP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#19E76E] animate-pulse' : 'bg-red-500'}`}></div>
          <span className={`text-xs font-bold ${isConnected ? 'text-[#00a843]' : 'text-red-600'}`}>
            {isConnected ? 'LISTENING' : 'OFFLINE'}
          </span>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">
        <AnimatePresence>
          {logs.map((log) => (
            <motion.div
              key={log.id + log.timestamp}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className={`p-2 rounded flex flex-col md:flex-row md:items-center gap-3 border-l-4 ${
                log.status === 'BLOCK' || log.status === 'DENY' 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-black bg-white shadow-sm border border-[#e5e5e5]'
              }`}
            >
              <div className="text-[#666666] w-24 shrink-0 text-xs font-mono">[{log.timestamp}]</div>
              
              <div className="flex items-center gap-2 w-32 shrink-0">
                {log.action === 'read_dom' ? <Code className="w-4 h-4 text-black" /> : 
                 log.status === 'BLOCK' ? <ShieldAlert className="w-4 h-4 text-red-500" /> :
                 <Cpu className="w-4 h-4 text-black" />}
                <span className={`uppercase tracking-tight font-bold text-xs ${log.status === 'BLOCK' ? 'text-red-600' : 'text-black'}`}>
                  {log.action}
                </span>
              </div>
              
              <div className="flex items-center gap-2 flex-1 text-black text-xs truncate">
                <ArrowRight className="w-3 h-3 text-[#cccccc]" />
                <span className="truncate font-medium">{log.target}</span>
                {log.info && (
                  <span className={`truncate text-[10px] ml-2 ${log.info.includes('[Cognee Memory]') ? 'font-bold text-[#7c3aed] bg-[#7c3aed]/10 px-1 rounded border border-[#7c3aed]/20' : 'text-[#666666]'}`}>
                    // {log.info}
                  </span>
                )}
              </div>
              
              <div className={`shrink-0 w-16 text-right font-bold text-xs ${
                log.status === 'ALLOW' ? 'text-[#00a843]' : 'text-red-600'
              }`}>
                {log.status}
              </div>
            </motion.div>
          ))}
          {logs.length === 0 && (
            <div className="text-[#999999] text-center py-10 italic text-xs">
              {isConnected ? '> Awaiting telemetry from MCP Sandbox...' : '> Run demo script to establish connection...'}
            </div>
          )}
        </AnimatePresence>
        <div className="h-4 w-full"></div>
      </div>
    </div>
  );
};

export default AgentTelemetry;
