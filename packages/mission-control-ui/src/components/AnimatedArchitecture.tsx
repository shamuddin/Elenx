import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Server, ShieldCheck, Database, Globe } from 'lucide-react';

const AnimatedArchitecture = () => {
  return (
    <div className="w-full aspect-[4/3] bg-white rounded-md border border-[#e5e5e5] shadow-sm flex flex-col p-6 relative overflow-hidden font-mono">
      {/* Background Technical Grid */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'linear-gradient(to right, #e5e5e5 1px, transparent 1px), linear-gradient(to bottom, #e5e5e5 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}></div>

      <div className="relative z-10 flex-1 flex items-center justify-between w-full h-full px-2">
        
        {/* Left: Agent CLI */}
        <div className="bg-[#fafafa] border border-[#e5e5e5] p-4 rounded-sm flex flex-col items-center w-28 shadow-sm relative z-20">
          <Terminal className="w-6 h-6 text-black mb-2" />
          <span className="text-[10px] font-bold text-center tracking-tight text-black">AGENT CLI<br/>(Autonomous)</span>
        </div>

        {/* Center/Right: ELENX Server Environment */}
        <div className="flex-1 ml-12 relative h-full flex items-center justify-center">
          
          {/* ELENX Bounding Box */}
          <div className="absolute inset-y-4 inset-x-0 border-2 border-black border-dashed rounded-sm bg-[#fafafa]/50 flex flex-col p-4 z-10">
            <div className="flex items-center gap-2 mb-4 bg-white w-fit px-3 py-1 border border-black rounded-sm absolute -top-4 left-4">
              <Server className="w-4 h-4 text-black" />
              <span className="text-xs font-bold tracking-widest text-black uppercase">ELENX MCP Server</span>
            </div>

            {/* Internal ELENX Nodes */}
            <div className="flex-1 flex items-center justify-between px-4 mt-4 w-full h-full">
              
              {/* Internal: Scrubber */}
              <div className="bg-white border border-[#e5e5e5] p-3 rounded-sm flex flex-col items-center w-24 shadow-sm z-20">
                <Globe className="w-5 h-5 text-[#666666] mb-1" />
                <span className="text-[9px] font-bold text-center tracking-tight text-black">BRIGHT DATA<br/>SCRUBBER</span>
              </div>

              {/* Internal: Verification */}
              <div className="bg-black border border-black p-3 rounded-sm flex flex-col items-center w-24 shadow-md z-20">
                <ShieldCheck className="w-5 h-5 text-[#19E76E] mb-1" />
                <span className="text-[9px] font-bold text-center tracking-tight text-white">INTENT<br/>CHECK</span>
              </div>

              {/* Internal: Cognee */}
              <div className="bg-white border border-[#e5e5e5] p-3 rounded-sm flex flex-col items-center w-24 shadow-sm z-20">
                <Database className="w-5 h-5 text-[#666666] mb-1" />
                <span className="text-[9px] font-bold text-center tracking-tight text-black">COGNEE.AI<br/>MEMORY</span>
              </div>

            </div>
          </div>

          {/* SVG Data Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            
            {/* Connection: CLI to MCP Server */}
            <line x1="-48" y1="50%" x2="20" y2="50%" stroke="#000" strokeWidth="2" strokeDasharray="4 4" />
            <text x="-25" y="45%" fill="#666" fontSize="8" className="font-bold">MCP Tool Call</text>

            {/* Connection: Scrubber to Gatekeeper */}
            <line x1="20%" y1="58%" x2="50%" y2="58%" stroke="#e5e5e5" strokeWidth="2" strokeDasharray="4 4" />
            
            {/* Connection: Gatekeeper to Memory */}
            <line x1="50%" y1="58%" x2="80%" y2="58%" stroke="#e5e5e5" strokeWidth="2" strokeDasharray="4 4" />
            
          </svg>

        </div>
      </div>
    </div>
  );
};

export default AnimatedArchitecture;
