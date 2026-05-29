import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import TerminalEmulator from './TerminalEmulator';
import Dashboard from './Dashboard';
import ThreatScenarios from './ThreatScenarios';

interface LiveDemoProps {
  onBack: () => void;
}

export default function LiveDemo({ onBack }: LiveDemoProps) {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans selection:bg-[#19E76E] selection:text-black">
      {/* Header */}
      <header className="bg-white border-b border-[#e5e5e5] p-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-sm transition-colors text-black border border-transparent hover:border-[#e5e5e5]"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="h-6 w-px bg-[#e5e5e5]"></div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-black" />
            <h1 className="text-xl font-extrabold tracking-[-0.02em] text-black font-mono">
              ELENX <span className="text-[#19E76E]">LIVE DEMO</span>
            </h1>
          </div>
        </div>
      </header>

      {/* Main Split Screen */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Threat Scenarios & Terminals */}
        <div className="w-full lg:w-[30%] flex flex-col gap-4 p-3 border-b lg:border-b-0 lg:border-r border-[#e5e5e5] bg-[#ebebeb] overflow-y-auto">
          <div className="flex-none">
            <ThreatScenarios />
          </div>
          <div className="flex-1 min-h-[300px] shadow-lg">
            <TerminalEmulator type="mcp" title="ELENX MCP Server" />
          </div>
          <div className="flex-1 min-h-[300px] shadow-lg">
            <TerminalEmulator type="monitor" title="ELENX CLI Monitor" />
          </div>
        </div>

        {/* Right Side: Dashboard */}
        <div className="w-full lg:w-[70%] flex flex-col overflow-y-auto bg-white">
           <Dashboard />
        </div>
      </div>
    </div>
  );
}
