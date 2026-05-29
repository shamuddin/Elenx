import React, { useState } from 'react';
import { Terminal, Check, Shield, AlertTriangle, Eye, X } from 'lucide-react';
import { SCENARIOS } from '../data/scenarios';

export default function ThreatScenarios() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [activeType, setActiveType] = useState<string>('All');
  const [proofUrl, setProofUrl] = useState<string | null>(null);

  const handleCopy = (scenario: any, index: number) => {
    navigator.clipboard.writeText(scenario.intent);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    
    // Trigger MCP execution in the terminal emulator
    window.dispatchEvent(new CustomEvent('execute_scenario', { 
        detail: scenario
    }));
  };

  const showProof = (e: React.MouseEvent, industry: string) => {
      e.stopPropagation();
      const map: Record<string, string> = {
          'Finance': '/mocks/bank.html',
          'Healthcare': '/mocks/health.html',
          'E-Commerce': '/mocks/retail.html',
          'B2B SaaS': '/mocks/saas.html',
          'Supply Chain': '/mocks/saas.html' // fallback
      };
      setProofUrl(map[industry] || '/mocks/bank.html');
  };

  const industries = ['All', ...Array.from(new Set(SCENARIOS.map(s => s.industry)))];
  
  const filteredScenarios = SCENARIOS.filter(s => {
      const matchIndustry = activeFilter === 'All' || s.industry === activeFilter;
      const matchType = activeType === 'All' || s.type === activeType;
      return matchIndustry && matchType;
  });

  return (
    <>
    <div className="bg-[#222222] border-b border-[#333333] px-4 py-3 flex flex-col gap-3 rounded-t-sm shadow-sm h-full max-h-[400px] relative">
      <div className="flex flex-col gap-2 border-b border-[#333333] pb-2">
        <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#888888]" />
            <h2 className="font-mono text-xs font-bold text-[#888888] tracking-widest uppercase">Live Scenarios ({filteredScenarios.length})</h2>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex gap-2">
                <button onClick={() => setActiveType('All')} className={`px-2 py-1 rounded ${activeType === 'All' ? 'bg-[#444] text-white' : 'text-[#888] hover:text-white'}`}>All Types</button>
                <button onClick={() => setActiveType('positive')} className={`flex items-center gap-1 px-2 py-1 rounded ${activeType === 'positive' ? 'bg-[#19E76E]/20 text-[#19E76E]' : 'text-[#888] hover:text-[#19E76E]'}`}><Shield size={12}/> Safe (60)</button>
                <button onClick={() => setActiveType('negative')} className={`flex items-center gap-1 px-2 py-1 rounded ${activeType === 'negative' ? 'bg-red-500/20 text-red-500' : 'text-[#888] hover:text-red-500'}`}><AlertTriangle size={12}/> Hijacked (40)</button>
            </div>
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
            {industries.map(ind => (
                <button key={ind} onClick={() => setActiveFilter(ind)} className={`text-[10px] px-2 py-1 rounded-full uppercase tracking-wider ${activeFilter === ind ? 'bg-[#555] text-white' : 'bg-[#333] text-[#aaa] hover:bg-[#444]'}`}>
                    {ind}
                </button>
            ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-2">
        {filteredScenarios.map((prompt, index) => (
          <button
            key={index}
            onClick={() => handleCopy(prompt, index)}
            className={`
              flex flex-col text-left gap-1 p-2 rounded-md text-[11px] font-mono transition-all border
              ${copiedIndex === index 
                ? 'bg-[#19E76E]/20 text-white border-[#19E76E] scale-[0.99]' 
                : prompt.type === 'positive' 
                    ? 'bg-[#2a2a2a] text-gray-300 border-[#333] hover:border-[#19E76E]/50 hover:bg-[#333]'
                    : 'bg-[#2a2a2a] text-gray-300 border-[#333] hover:border-red-500/50 hover:bg-[#333]'
              }
            `}
            title={prompt.intent}
          >
            <div className="flex justify-between items-center w-full">
                <span className={`uppercase font-bold tracking-widest text-[9px] ${prompt.type === 'positive' ? 'text-[#19E76E]' : 'text-red-400'}`}>
                    {prompt.industry}
                </span>
                <div className="flex items-center gap-2">
                    {prompt.type === 'negative' && (
                        <span onClick={(e) => showProof(e, prompt.industry)} className="text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-400/10 px-2 py-0.5 rounded-full" title="View Live Proof">
                            <Eye size={10} /> Live Proof
                        </span>
                    )}
                    {copiedIndex === index ? <Check size={12} className="text-[#19E76E]" /> : null}
                </div>
            </div>
            <span className="truncate w-full">{prompt.intent}</span>
          </button>
        ))}
      </div>
    </div>
    
    {proofUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8 backdrop-blur-sm">
            <div className="bg-[#111] border border-[#333] rounded-lg w-full max-w-6xl h-full max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
                <div className="flex justify-between items-center p-4 border-b border-[#333] bg-[#222]">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="text-red-500" size={18} />
                        <h2 className="text-white font-mono font-bold tracking-widest uppercase">Live Proof: Adversarial Mock Site</h2>
                    </div>
                    <button onClick={() => setProofUrl(null)} className="text-gray-400 hover:text-white bg-[#333] hover:bg-[#444] p-1.5 rounded-full transition-colors">
                        <X size={16} />
                    </button>
                </div>
                <div className="flex-1 bg-white relative">
                    <iframe src={proofUrl} className="w-full h-full border-none" title="Live Proof" />
                </div>
                <div className="p-3 bg-red-500/10 border-t border-red-500/30 text-red-400 font-mono text-xs flex justify-between items-center">
                    <span>⚠️ Warning: This site contains invisible payloads (0-pixel or aria-labels) that trick AI agents, but are invisible to humans.</span>
                    <button onClick={() => setProofUrl(null)} className="bg-red-500/20 hover:bg-red-500/40 px-3 py-1 rounded text-red-400 transition-colors">Close Simulator</button>
                </div>
            </div>
        </div>
    )}
    </>
  );
}
