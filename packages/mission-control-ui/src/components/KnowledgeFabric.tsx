import React, { useEffect, useRef } from 'react';

interface KnowledgeFabricProps {
  fullHeight?: boolean;
}

export function KnowledgeFabric({ fullHeight = false }: KnowledgeFabricProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousHtmlRef = useRef<string | null>(null);
  const wrapperId = useRef(`cognee-wrapper-${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    let isMounted = true;

    const loadCogneeNativeGraph = async () => {
      try {
        const response = await fetch('/memory/static/graph_visualization.html');
        if (!response.ok) throw new Error('Network response was not ok');
        const html = await response.text();
        
        // Extract graph data payload from the HTML to accurately check if the graph changed
        const nodesMatch = html.match(/var nodes = (\[.*?\]);/);
        const linksMatch = html.match(/var links = (\[.*?\]);/);
        const dataPayload = (nodesMatch ? nodesMatch[1] : '') + '|' + (linksMatch ? linksMatch[1] : '');

        if (!isMounted || !containerRef.current) return;
        
        // Prevent flickering by only re-rendering if the graph data actually changed
        // Also ensure the container actually has content (handles React Strict Mode remounts)
        if (previousHtmlRef.current === dataPayload && containerRef.current.innerHTML !== '') return;
        previousHtmlRef.current = dataPayload;
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const container = containerRef.current;
        container.innerHTML = '';
        
        // 1. Process Styles
        let styleContent = '';
        doc.querySelectorAll('style').forEach(style => {
            styleContent += style.innerHTML + '\n';
        });
        
        // Scope the styles to our wrapper to avoid bleeding into the rest of the dashboard
        styleContent = styleContent.replace(/body,html/g, `.${wrapperId.current}`);
        styleContent = styleContent.replace(/body/g, `.${wrapperId.current}`);
        styleContent = styleContent.replace(/html\.light/g, `.${wrapperId.current}.light`);
        styleContent = styleContent.replace(/html/g, `.${wrapperId.current}`);
        
        // Critical: Convert fixed positioning to absolute so it stays within our container
        styleContent = styleContent.replace(/position:\s*fixed/g, 'position: absolute');
        
        // Add some overrides to fix positioning inside a container instead of window
        styleContent += `
          .${wrapperId.current} #header { position: absolute !important; top: 10px !important; left: 10px !important; z-index: 50 !important; width: auto !important; background: transparent !important; }
          .${wrapperId.current} #controls { position: absolute !important; bottom: 20px !important; left: 20px !important; transform: none !important; z-index: 50 !important; }
          .${wrapperId.current} #minimap-container { position: absolute !important; bottom: 80px !important; left: 20px !important; z-index: 50 !important; }
          .${wrapperId.current} #search-box { position: absolute !important; top: 10px !important; right: 140px !important; z-index: 50 !important; }
          .${wrapperId.current} #fps { position: absolute !important; top: auto !important; bottom: 20px !important; right: 20px !important; z-index: 50 !important; }
          .${wrapperId.current} button { margin: 0 4px !important; }
          .${wrapperId.current} #theme-toggle { position: absolute !important; top: 10px !important; right: 10px !important; z-index: 1200 !important; }
          .${wrapperId.current} canvas { width: 100% !important; height: 100% !important; position: absolute !important; top: 0 !important; left: 0 !important; }
          .${wrapperId.current} #view-tabs { position: absolute !important; top: 10px !important; left: 50% !important; transform: translateX(-50%) !important; z-index: 1100 !important; display: flex; gap: 8px; background: rgba(0,0,0,0.5) !important; padding: 4px; border-radius: 6px; }
        `;

        const styleEl = document.createElement('style');
        styleEl.innerHTML = styleContent;
        container.appendChild(styleEl);
        
        // 2. Process DOM
        const wrapper = document.createElement('div');
        wrapper.className = `${wrapperId.current} w-full h-full relative overflow-hidden bg-black text-[#F4F4F4] rounded-sm`;
        wrapper.style.fontFamily = "'Inter', system-ui, -apple-system, sans-serif";
        
        Array.from(doc.body.childNodes).forEach(node => {
            if (node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
                wrapper.appendChild(node.cloneNode(true));
            }
        });
        container.appendChild(wrapper);
        
        // 3. Process Scripts
        let scriptContent = '';
        doc.querySelectorAll('script').forEach(script => {
            if (!script.src) {
                scriptContent += script.innerHTML + '\n';
            }
        });
        
        // Rewrite global references to scope them to our wrapper
        // Change document.getElementById to query from our wrapper
        scriptContent = scriptContent.replace(/document\.getElementById\((['"])([^'"]+)\1\)/g, `document.querySelector(".${wrapperId.current} #$2")`);
        // Change document.body to our wrapper
        scriptContent = scriptContent.replace(/document\.body/g, `document.querySelector(".${wrapperId.current}")`);
        // Change window dimensions to wrapper dimensions
        scriptContent = scriptContent.replace(/window\.innerWidth/g, `document.querySelector(".${wrapperId.current}").clientWidth`);
        scriptContent = scriptContent.replace(/window\.innerHeight/g, `document.querySelector(".${wrapperId.current}").clientHeight`);
        
        // Force an initial resize event manually to ensure canvas sizes correctly
        scriptContent += `\nwindow.dispatchEvent(new Event('resize'));\n`;

        // 4. Inject and Run D3 + Script
        const runLogic = () => {
            const runScript = document.createElement('script');
            runScript.innerHTML = `(function() { 
              try {
                ${scriptContent}
              } catch (e) { console.error("Cognee Native Graph Script Error:", e); }
            })();`;
            container.appendChild(runScript);
        };

        // @ts-ignore
        if (!window.d3) {
            const d3Script = document.createElement('script');
            d3Script.src = "https://d3js.org/d3.v7.min.js";
            d3Script.onload = runLogic;
            container.appendChild(d3Script);
        } else {
            runLogic();
        }

      } catch (error) {
        console.error('Failed to load Cognee native graph:', error);
        if (isMounted && containerRef.current) {
          containerRef.current.innerHTML = '<div class="flex items-center justify-center h-full w-full text-red-500 bg-black font-mono">Failed to load Native Cognee Graph. Is the memory-service running on port 8001?</div>';
        }
      }
    };

    loadCogneeNativeGraph();
    
    // Refresh graph data every 5 seconds to stay updated
    const interval = setInterval(loadCogneeNativeGraph, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`${fullHeight ? 'absolute inset-0' : 'h-[600px] relative w-full'} overflow-hidden border border-[#333333] rounded-sm`}
    />
  );
}
