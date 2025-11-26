import React, { useState, useEffect } from 'react';
import { Prize, Theme, THEME_COLORS } from './types';
import { INITIAL_PRIZES } from './constants';
import LotteryView from './views/LotteryView';
import AdminPanel from './views/AdminPanel';
import SnowEffect from './components/SnowEffect';
import LanternEffect from './components/LanternEffect';
import { Settings, Palette } from 'lucide-react';

const App: React.FC = () => {
  // App State
  const [theme, setTheme] = useState<Theme>(Theme.CHRISTMAS);
  const [prizes, setPrizes] = useState<Prize[]>(() => {
    // Load from local storage or use default
    const saved = localStorage.getItem('lottery_prizes');
    return saved ? JSON.parse(saved) : INITIAL_PRIZES;
  });
  const [showAdmin, setShowAdmin] = useState(false);

  // Persist prize changes
  useEffect(() => {
    localStorage.setItem('lottery_prizes', JSON.stringify(prizes));
  }, [prizes]);

  const handleDraw = (prizeId: string) => {
    setPrizes(currentPrizes => 
      currentPrizes.map(p => 
        p.id === prizeId 
          ? { ...p, remainingQuantity: Math.max(0, p.remainingQuantity - 1) }
          : p
      )
    );
  };

  const toggleTheme = () => {
    setTheme(prev => prev === Theme.CHRISTMAS ? Theme.CNY : Theme.CHRISTMAS);
  };

  const colors = THEME_COLORS[theme];

  return (
    <div className={`min-h-screen w-full transition-colors duration-700 ease-in-out ${colors.bg} ${colors.text} font-sans overflow-x-hidden selection:bg-yellow-300 selection:text-black`}>
      
      {/* Dynamic Background Effects */}
      {theme === Theme.CHRISTMAS && <SnowEffect />}
      {theme === Theme.CNY && <LanternEffect />}

      {/* Navbar / Controls */}
      <nav className="relative z-40 flex justify-between items-center p-4 md:p-6">
         <div className="flex items-center gap-2">
            <span className="text-2xl">{theme === Theme.CHRISTMAS ? '🎄' : '🧧'}</span>
            <span className="font-bold tracking-wider hidden md:inline">MAGIC SCHOOL LOTTERY</span>
         </div>

         <div className="flex gap-3">
            <button 
              onClick={toggleTheme}
              className={`flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition border ${colors.border}`}
              title="Switch Theme"
            >
              <Palette size={18} />
              <span className="text-sm font-medium">{theme === Theme.CHRISTMAS ? 'Switch to CNY' : 'Switch to Xmas'}</span>
            </button>
            
            <button 
              onClick={() => setShowAdmin(true)}
              className="p-2 rounded-full bg-white/5 hover:bg-white/20 transition opacity-50 hover:opacity-100"
              title="Admin Panel"
            >
              <Settings size={20} />
            </button>
         </div>
      </nav>

      {/* Main Content */}
      <main className="relative flex items-center justify-center p-4">
        <LotteryView 
          theme={theme} 
          prizes={prizes} 
          onDraw={handleDraw} 
        />
      </main>

      {/* Admin Modal */}
      {showAdmin && (
        <AdminPanel 
          theme={theme}
          prizes={prizes}
          setPrizes={setPrizes}
          onClose={() => setShowAdmin(false)}
        />
      )}
      
    </div>
  );
};

export default App;