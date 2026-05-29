import React, { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { io, Socket } from 'socket.io-client';

interface TerminalEmulatorProps {
  type: 'autonomous' | 'elenx' | 'mcp' | 'monitor';
  title: string;
}

export default function TerminalEmulator({ type, title }: TerminalEmulatorProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize xterm
    const term = new Terminal({
      cursorBlink: true,
      fontFamily: 'Consolas, "Courier New", monospace',
      fontSize: 13,
      theme: {
        background: '#111111',
        foreground: '#e5e5e5',
        cursor: '#19E76E'
      },
      disableStdin: true // Prevent user input in demo mode
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    // Connect to local backend PTY host
    const socket = io('http://localhost:3001');
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('init', {
        type,
        cols: term.cols,
        rows: term.rows
      });
      term.writeln(`\x1b[32m[Connected to ${title} process]\x1b[0m`);
    });

    socket.on('data', (data: string) => {
      term.write(data);
    });

    term.onData((data) => {
      // Disabled user input for the live demo
    });

    const handleExecuteScenario = ((e: CustomEvent) => {
      if (type === 'mcp' && socketRef.current) {
        const { intent, action, industry, type: scenarioType } = e.detail;
        
        let domain = "system_domain";

        if (scenarioType === 'negative') {
            const mockDomains: Record<string, string> = {
                'Finance': 'mock-bank.local',
                'Healthcare': 'mock-health.local',
                'E-Commerce': 'mock-retail.local',
                'B2B SaaS': 'mock-saas.local',
                'Supply Chain': 'mock-supply.local'
            };
            domain = mockDomains[industry] || 'malicious-site.local';
        } else {
            // Try to extract domain from intent (e.g. "Go to chase.com")
            const domainMatch = intent.match(/([a-zA-Z0-9-]+\.(com|net|org|io|gov))/i);
            
            if (domainMatch) {
                domain = domainMatch[1];
            } else {
                const positiveDomains: Record<string, string> = {
                    'Finance': 'chase.com',
                    'Healthcare': 'kaiser.com',
                    'E-Commerce': 'amazon.com',
                    'B2B SaaS': 'slack.com',
                    'Supply Chain': 'sap.com'
                };
                domain = positiveDomains[industry] || 'trusted-site.com';
            }
        }

        // 1. Set Root Intent
        const intentPayload = JSON.stringify({
            jsonrpc: "2.0",
            id: Date.now(),
            method: "tools/call",
            params: {
                name: "set_root_intent",
                arguments: { intent }
            }
        });
        socketRef.current.emit('data', intentPayload + '\r');
        
        // 2. Simulate the adversarial action
        setTimeout(() => {
            const actionPayload = JSON.stringify({
                jsonrpc: "2.0",
                id: Date.now() + 1,
                method: "tools/call",
                params: {
                    name: "verify_action",
                    arguments: {
                        action,
                        target: action,
                        callerId: "autonomous-agent",
                        url: domain
                    }
                }
            });
            socketRef.current?.emit('data', actionPayload + '\r');
        }, 500);
      }
    }) as EventListener;

    window.addEventListener('execute_scenario', handleExecuteScenario);

    const handleResize = () => {
      fitAddon.fit();
      socket.emit('resize', { cols: term.cols, rows: term.rows });
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('execute_scenario', handleExecuteScenario);
      window.removeEventListener('resize', handleResize);
      socket.disconnect();
      term.dispose();
    };
  }, [type, title]);

  return (
    <div className="flex flex-col h-full bg-[#111111] rounded-sm overflow-hidden border border-[#333333]">
      <div className="bg-[#222222] border-b border-[#333333] px-3 py-1.5 flex items-center justify-between">
        <span className="text-[#888888] font-bold text-xs uppercase tracking-widest">{title}</span>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
        </div>
      </div>
      <div className="flex-1 p-2 overflow-hidden pointer-events-none" ref={terminalRef} />
    </div>
  );
}
