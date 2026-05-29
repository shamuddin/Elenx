import React, { useState } from 'react';
import { Shield, ShieldAlert, Cpu, Activity, Database, Radar, Network } from 'lucide-react';
import AgentTelemetry from './AgentTelemetry';
import SecurityEvents from './SecurityEvents';
import { KnowledgeFabric } from './KnowledgeFabric';
import { useTelemetry } from '../hooks/useTelemetry';

const Dashboard = () => {
  const { isConnected, logs, securityEvents, radarData } = useTelemetry();
  const [activeTab, setActiveTab] = useState<'overview' | 'fabric'>('overview');
  
  const systemStatus = isConnected ? 'ONLINE' : 'OFFLINE';
  const threatLevel = securityEvents.length > 0 ? 'ELEVATED' : 'NOMINAL';

  return (
    <div className="p-4 w-full mx-auto min-h-screen flex flex-col gap-4 bg-[#fafafa] font-sans selection:bg-[#19E76E] selection:text-black">
      {/* Header section */}
      <header className="flex justify-between items-center bg-white border border-[#e5e5e5] p-3 rounded-sm shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Shield className="w-8 h-8 text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-black font-mono">
              ELENX <span className="text-[#19E76E]">SERVER</span>
            </h1>
            <p className="text-[#666666] font-mono text-xs uppercase tracking-widest mt-0.5">MCP Node // Port 3000</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6 font-mono text-sm">
          <div className="flex flex-col items-end">
            <span className="text-[#666666] text-xs">System Status</span>
            <span className={`font-bold ${systemStatus === 'ONLINE' ? 'text-[#00a843]' : 'text-red-500'}`}>
              [ {systemStatus} ]
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[#666666] text-xs">Threat Level</span>
            <span className={`font-bold ${threatLevel === 'ELEVATED' ? 'text-red-600' : 'text-black'}`}>
              [ {threatLevel} ]
            </span>
          </div>
          <div className="h-8 w-px bg-[#e5e5e5] mx-2"></div>
          <div className="flex items-center gap-2 text-black font-bold text-xs bg-[#19E76E]/20 px-3 py-1.5 rounded-full border border-[#19E76E]/30">
            <Radar className="w-4 h-4 animate-pulse text-[#00a843]" />
            <span className="text-[#00a843]">MONITORING_LIVE</span>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-4 border-b border-[#e5e5e5] px-2">
        <button 
          className="flex items-center gap-2 px-4 py-2 font-mono text-sm font-bold uppercase tracking-widest border-b-2 transition-colors border-black text-black"
        >
          <Activity size={16} /> Overview
        </button>
        <a 
          href="#fabric"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-4 py-2 font-mono text-sm font-bold uppercase tracking-widest border-b-2 border-transparent text-[#666666] hover:text-black transition-colors"
        >
          <Network size={16} /> Knowledge Fabric ⬈
        </a>
      </div>

      {/* Main content */}
      <div className="flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
          {/* Left Column: Live Telemetry */}
          <div className="flex flex-col gap-4 h-full">
            <div className="bg-white border border-[#e5e5e5] p-4 flex-1 flex flex-col rounded-sm shadow-sm min-h-[500px]">
              <div className="flex items-center gap-2 border-b border-[#e5e5e5] pb-2 mb-3">
                <Activity className="w-5 h-5 text-black" />
                <h2 className="font-mono text-base font-bold text-black tracking-tight uppercase">Live Agent Telemetry</h2>
                <span className="ml-auto text-[10px] font-mono font-bold text-[#00a843] bg-[#19E76E]/10 border border-[#19E76E]/20 px-2 py-1 rounded">PROTECTED BY COGNEE MEMORY</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <AgentTelemetry logs={logs} isConnected={isConnected} />
              </div>
            </div>
          </div>

          {/* Right Column: Security Events */}
          <div className="flex flex-col gap-4 h-full">
            <div className="bg-white border border-[#e5e5e5] p-4 flex-1 flex flex-col rounded-sm shadow-sm min-h-[500px]">
              <div className="flex items-center gap-2 border-b border-[#e5e5e5] pb-2 mb-3">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <h2 className="font-mono text-base font-bold text-black tracking-tight uppercase">Security Events</h2>
              </div>
              <div className="flex-1 overflow-hidden">
                <SecurityEvents events={securityEvents} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
