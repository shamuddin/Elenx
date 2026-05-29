import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import LiveDemo from './components/LiveDemo';
import { KnowledgeFabric } from './components/KnowledgeFabric';

function App() {
  const [view, setView] = useState<'landing' | 'dashboard' | 'demo'>('landing');

  return (
    <div className="min-h-screen relative overflow-hidden bg-cyber-darker">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyber-accent opacity-5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyber-neon opacity-5 blur-[150px] rounded-full pointer-events-none" />
      
      {window.location.hash === '#fabric' ? (
        <div className="w-screen h-screen">
          <KnowledgeFabric fullHeight />
        </div>
      ) : view === 'landing' ? (
        <LandingPage 
          onEnter={() => setView('dashboard')} 
          onDemo={() => setView('demo')}
        />
      ) : view === 'dashboard' ? (
        <Dashboard />
      ) : (
        <LiveDemo onBack={() => setView('landing')} />
      )}
    </div>
  );
}

export default App;
