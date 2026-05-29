import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, AlertTriangle, ShieldCheck, Lock } from 'lucide-react';
import { TelemetryEvent } from '../hooks/useTelemetry';

interface Props {
  events: TelemetryEvent[];
}

const SecurityEvents: React.FC<Props> = ({ events }) => {
  return (
    <div className="h-full flex flex-col font-mono text-sm overflow-hidden">
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
        <AnimatePresence>
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-sm border ${
                event.action === 'read_dom' 
                  ? 'border-yellow-200 bg-yellow-50' 
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {event.action === 'read_dom' ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                  )}
                  <span className={`font-bold tracking-tight uppercase text-xs ${
                    event.action === 'read_dom' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {event.action} - {event.target}
                  </span>
                </div>
                <span className="text-xs text-[#666666] font-mono">[{event.timestamp}]</span>
              </div>
              
              <p className="text-sm font-medium text-black mb-3 leading-snug">
                {event.info || 'Malicious instruction detected in DOM context.'}
              </p>
              
              <div className="bg-white rounded border border-[#e5e5e5] p-3 shadow-inner">
                <div className="text-[10px] text-[#999999] uppercase tracking-wider mb-1 font-bold">Intercepted Payload</div>
                <code className="text-xs text-[#d92626] break-all block">
                  {event.target}
                </code>
              </div>
              
              <div className="mt-3 flex items-center gap-2 text-xs font-bold text-[#00a843] bg-[#19E76E]/10 w-fit px-2 py-1 rounded border border-[#19E76E]/20">
                <Lock className="w-3 h-3" />
                ACTION BLOCKED
              </div>
            </motion.div>
          ))}
          {events.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-[#999999] py-10 opacity-70">
              <ShieldCheck className="w-12 h-12 mb-3 text-[#e5e5e5]" />
              <p className="font-mono text-sm italic">No Semantic Drift Detected</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SecurityEvents;
