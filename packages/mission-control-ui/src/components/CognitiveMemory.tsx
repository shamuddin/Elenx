import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface Props {
  radarData: Array<{
    subject: string;
    A: number;
    fullMark: number;
  }>;
}

const CognitiveMemory: React.FC<Props> = ({ radarData }) => {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center relative min-h-[300px] bg-[#fafafa] border border-[#e5e5e5] rounded-sm p-4 shadow-inner">
      <div className="absolute top-4 left-4 z-10">
        <div className="text-[10px] text-[#666666] font-mono tracking-widest font-bold uppercase mb-1">
          Vector Relationship Status
        </div>
        <div className="text-xs text-black font-mono bg-white px-2 py-1 rounded border border-[#e5e5e5] shadow-sm w-fit">
          <span className="font-bold text-[#00a843]">ONLINE:</span> Cognee Knowledge Graph
        </div>
      </div>
      
      {radarData.length > 0 ? (
        <div className="w-full h-full flex-1 min-h-[250px] mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#e5e5e5" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#666666', fontSize: 11, fontFamily: 'Space Grotesk, monospace', fontWeight: 'bold' }} 
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]} 
                tick={{ fill: '#cccccc', fontSize: 10 }}
                tickCount={4}
              />
              <Radar
                name="Semantic Relevance"
                dataKey="A"
                stroke="#000000"
                strokeWidth={2}
                fill="#19E76E"
                fillOpacity={0.2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center opacity-50">
          <div className="w-16 h-16 border-2 border-dashed border-[#cccccc] rounded-full animate-[spin_10s_linear_infinite] mb-4"></div>
          <div className="text-[#666666] font-mono text-sm">Awaiting graph data...</div>
        </div>
      )}
    </div>
  );
};

export default CognitiveMemory;
