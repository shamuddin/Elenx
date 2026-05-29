import React from 'react';
import { Shield, ArrowRight, Server, ShieldCheck, Database, LayoutGrid, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedExploit from './AnimatedExploit';
import AnimatedArchitecture from './AnimatedArchitecture';

interface Props {
  onEnter: () => void;
  onDemo: () => void;
}

const LandingPage: React.FC<Props> = ({ onEnter, onDemo }) => {
  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-[#19E76E] selection:text-black">
      
      <div className="relative z-10 w-full">
        
        {/* Navigation Bar */}
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-[#e5e5e5]">
          <div className="max-w-[1296px] mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-7 h-7 text-black" />
              <span className="font-bold text-2xl tracking-tight text-black uppercase font-mono">Elenx</span>
            </div>
            <div className="hidden md:flex items-center gap-8 font-medium text-sm text-[#666666]">
              <a href="#platform" className="hover:text-black transition-colors">Platform</a>
              <a href="#architecture" className="hover:text-black transition-colors">Architecture</a>
              <a href="#research" className="hover:text-black transition-colors">Research</a>
            </div>
            <div className="flex items-center gap-4">
              <button 
                className="text-sm font-mono font-medium text-black px-4 py-2 hover:bg-black/5 transition-colors hidden sm:block"
              >
                LOG IN
              </button>
              <button 
                onClick={onEnter}
                className="text-sm font-mono font-bold bg-black text-white px-5 py-2.5 hover:bg-[#19E76E] hover:text-black transition-colors"
              >
                GET STARTED
              </button>
            </div>
          </div>
        </nav>

        {/* 1. Hero Section */}
        <section className="flex flex-col items-center text-center px-4 pt-32 pb-24 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-[#19E76E]/10 text-[#00a843] text-xs font-mono font-bold tracking-wide mb-8 rounded-full"
          >
            <span className="w-2 h-2 rounded-full bg-[#19E76E] animate-pulse"></span>
            DEFENDING AGAINST CVE-2026-0628
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-5xl md:text-[80px] font-bold tracking-[-0.04em] text-black leading-[1.05]"
          >
            De-weaponize the semantic web.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-xl md:text-2xl text-[#666666] max-w-3xl mt-8 leading-relaxed font-medium"
          >
            Autonomous agents are vulnerable to malicious language, not just code. ELENX provides Day-0 protection against Semantic Compliance Hijacking (SCH).
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 mt-12 w-full sm:w-auto"
          >
            <button 
              onClick={onEnter}
              className="group flex items-center justify-center gap-2 bg-black text-white px-8 py-4 font-mono font-bold text-sm tracking-wide hover:bg-gray-800 transition-all rounded-full w-full sm:w-auto"
            >
              INITIALIZE PLATFORM
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={onDemo}
              className="group flex items-center justify-center gap-2 bg-[#19E76E] text-black px-8 py-4 font-mono font-bold text-sm tracking-wide hover:bg-[#15c55d] transition-all rounded-full w-full sm:w-auto shadow-[0_0_20px_rgba(25,231,110,0.4)]"
            >
              <Play className="w-4 h-4 fill-black" />
              LIVE DEMO
            </button>
          </motion.div>
        </section>

        {/* 2. Platform Section (Problem & Exploit) */}
        <section id="platform" className="py-24 px-6 max-w-[1296px] mx-auto border-t border-[#e5e5e5]">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 w-full lg:max-w-xl">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black mb-6">
                The Unsolved Problem:<br/>Payload-less Attacks.
              </h2>
              <p className="text-lg text-[#666666] mb-8 leading-relaxed">
                Attackers hide imperative instructions within invisible DOM metadata like <code className="bg-[#f5f5f5] px-1.5 py-0.5 rounded text-sm text-black">aria-labels</code>. Autonomous AI agents interpret these as high-priority user instructions.
              </p>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#f5f5f5] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-black mb-1">Traditional WAFs Miss It</h3>
                    <p className="text-[#666666] leading-relaxed">Network security scans for malicious code. Agents are hijacked by malicious language.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full h-[400px]">
              <AnimatedExploit />
            </div>
          </div>
        </section>

        {/* 3. Architecture Section */}
        <section id="architecture" className="py-24 px-6 max-w-[1296px] mx-auto border-t border-[#e5e5e5]">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <div className="flex-1 w-full lg:max-w-xl">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black mb-6">
                Semantic Integrity Firewall (SIF)
              </h2>
              <p className="text-lg text-[#666666] mb-8 leading-relaxed">
                ELENX acts as a trusted proxy. Our adversarial scrubber neutralizes weaponized web metadata before the agent even sees it.
              </p>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#f5f5f5] flex items-center justify-center shrink-0">
                    <Server className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-black mb-1">MCP Governance Layer</h3>
                    <p className="text-[#666666] leading-relaxed">Intercepts tool calls and validates intent against the user's original goal.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full h-[400px]">
              <AnimatedArchitecture />
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="py-32 px-6 text-center bg-[#fafafa] border-t border-[#e5e5e5]">
          <h2 className="text-4xl font-bold tracking-tight text-black mb-8">Secure your autonomous agents today.</h2>
          <button 
            onClick={onEnter}
            className="group flex mx-auto items-center justify-center gap-2 bg-black text-white px-8 py-4 font-mono font-bold text-sm tracking-wide hover:bg-gray-800 transition-all rounded-full"
          >
            INITIALIZE PLATFORM
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </section>

      </div>
    </div>
  );
};

export default LandingPage;
