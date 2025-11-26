import React, { useState, useEffect } from 'react';
import { Prize, Theme, THEME_COLORS, DrawRecord } from './types';
import { INITIAL_PRIZES } from './constants';
import LotteryView from './views/LotteryView';
import AdminPanel from './views/AdminPanel';
import SnowEffect from './components/SnowEffect';
import LanternEffect from './components/LanternEffect';
import { Settings, Palette, HelpCircle, History, X, ChevronLeft, ChevronRight } from 'lucide-react';

// Extract Modal to avoid re-definition on render and fix TS inference issues
interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  theme: Theme;
}

const Modal: React.FC<ModalProps> = ({ title, onClose, children, theme }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-pop-in">
    <div className={`${theme === Theme.CHRISTMAS ? 'bg-slate-800 border-green-600' : 'bg-red-900 border-yellow-500'} border-2 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[80vh]`}>
      <div className={`flex justify-between items-center p-4 border-b ${theme === Theme.CHRISTMAS ? 'border-green-600/30' : 'border-yellow-500/30'}`}>
         <h2 className="text-2xl font-bold flex items-center gap-2">{title}</h2>
         <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition"><X size={24} /></button>
      </div>
      <div className="p-6 overflow-y-auto custom-scrollbar">
         {children}
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  // App State
  const [theme, setTheme] = useState<Theme>(Theme.CHRISTMAS);
  const [prizes, setPrizes] = useState<Prize[]>(() => {
    // Load from local storage or use default
    const saved = localStorage.getItem('lottery_prizes');
    return saved ? JSON.parse(saved) : INITIAL_PRIZES;
  });
  const [history, setHistory] = useState<DrawRecord[]>(() => {
    const saved = localStorage.getItem('lottery_history');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [showAdmin, setShowAdmin] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // History Pagination
  const [historyPage, setHistoryPage] = useState(0);
  const HISTORY_PAGE_SIZE = 10;

  // Persist prize changes
  useEffect(() => {
    localStorage.setItem('lottery_prizes', JSON.stringify(prizes));
  }, [prizes]);

  // Persist history changes
  useEffect(() => {
    localStorage.setItem('lottery_history', JSON.stringify(history));
  }, [history]);

  const handleDraw = (drawnPrizes: Prize[]) => {
    // 1. Update Stock
    setPrizes(currentPrizes => {
      // Create a map of IDs to count how many times each was drawn
      const counts: Record<string, number> = {};
      drawnPrizes.forEach(p => {
        counts[p.id] = (counts[p.id] || 0) + 1;
      });

      return currentPrizes.map(p => {
        if (counts[p.id]) {
          return { ...p, remainingQuantity: Math.max(0, p.remainingQuantity - counts[p.id]) };
        }
        return p;
      });
    });

    // 2. Add to History
    const newRecords: DrawRecord[] = drawnPrizes.map(p => ({
      id: crypto.randomUUID(),
      prizeName: p.name,
      prizeNameCN: p.nameCN,
      timestamp: Date.now()
    }));

    setHistory(prev => [...newRecords, ...prev]); // Newest first
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

      {/* Sidebar Buttons (Help & History) */}
      <div className="fixed left-4 top-24 z-30 flex flex-col gap-4">
          <button 
            onClick={() => setShowHelp(true)}
            className={`
              flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg transform transition-transform hover:scale-105 hover:translate-x-1
              ${colors.button} text-white font-bold
            `}
          >
             <HelpCircle size={20} />
             <span className="hidden md:inline">Help / 说明</span>
          </button>

          <button 
            onClick={() => { setShowHistory(true); setHistoryPage(0); }}
            className={`
              flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg transform transition-transform hover:scale-105 hover:translate-x-1
              ${colors.button} text-white font-bold
            `}
          >
             <History size={20} />
             <span className="hidden md:inline">History / 历史</span>
          </button>
      </div>

      {/* Main Content */}
      <main className="relative flex items-center justify-center p-4 min-h-[calc(100vh-100px)]">
        <LotteryView 
          theme={theme} 
          prizes={prizes} 
          onDraw={handleDraw} 
          recentHistory={history}
        />
      </main>

      {/* Help Modal */}
      {showHelp && (
        <Modal title="📘 User Manual / 使用说明" onClose={() => setShowHelp(false)} theme={theme}>
          <div className="space-y-6 text-lg leading-relaxed opacity-90">
             <section>
               <h3 className="text-xl font-bold mb-2 text-yellow-400">For Teachers / 教师指南</h3>
               <ul className="list-disc pl-5 space-y-2">
                 <li>
                   <strong>Theme Switching (切换主题):</strong> Use the button in the top right to toggle between Christmas and Chinese New Year themes.
                   <br/><span className="text-sm opacity-70">点击右上角按钮切换圣诞节/春节皮肤。</span>
                 </li>
                 <li>
                   <strong>Admin Panel (管理后台):</strong> Click the <Settings className="inline w-4 h-4"/> icon. Password is <code>admin</code>.
                   <br/><span className="text-sm opacity-70">点击设置图标进入后台，密码为 admin。</span>
                 </li>
                 <li>
                   <strong>Inventory (仓库管理):</strong> In Admin, you can add prizes, change quantities, edit names, and upload images.
                   <br/><span className="text-sm opacity-70">后台可添加奖品、修改库存、编辑名称及上传图片。</span>
                 </li>
               </ul>
             </section>
             <section>
               <h3 className="text-xl font-bold mb-2 text-yellow-400">Lottery Rules / 抽奖规则</h3>
               <ul className="list-disc pl-5 space-y-2">
                 <li>Select 1x, 3x, 5x, or 10x draw buttons. <br/><span className="text-sm opacity-70">选择连抽次数进行抽奖。</span></li>
                 <li>Prizes are drawn based on remaining probability. <br/><span className="text-sm opacity-70">根据剩余库存概率出货。</span></li>
                 <li>The "Sold Out" message appears when stock is empty. <br/><span className="text-sm opacity-70">库存耗尽会提示售罄。</span></li>
               </ul>
             </section>
          </div>
        </Modal>
      )}

      {/* History Modal */}
      {showHistory && (
        <Modal title="📜 Draw History / 抽奖记录" onClose={() => setShowHistory(false)} theme={theme}>
           {history.length === 0 ? (
             <div className="text-center py-10 opacity-50">No history yet. 暂无记录。</div>
           ) : (
             <>
               <table className="w-full text-left border-collapse mb-4">
                 <thead className="bg-white/10 text-sm uppercase">
                   <tr>
                     <th className="p-3 rounded-tl-lg">Time / 时间</th>
                     <th className="p-3 rounded-tr-lg">Prize / 奖品</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/10">
                   {history.slice(historyPage * HISTORY_PAGE_SIZE, (historyPage + 1) * HISTORY_PAGE_SIZE).map((record) => (
                     <tr key={record.id} className="hover:bg-white/5">
                        <td className="p-3 font-mono text-sm opacity-80">
                          {new Date(record.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3 font-bold text-yellow-300">
                          {record.prizeName} <span className="text-xs font-normal text-white/60 ml-1">{record.prizeNameCN}</span>
                        </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
               
               {/* Pagination */}
               <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/10">
                  <button 
                    disabled={historyPage === 0}
                    onClick={() => setHistoryPage(p => Math.max(0, p - 1))}
                    className="p-2 bg-white/10 rounded-lg disabled:opacity-30 hover:bg-white/20"
                  >
                    <ChevronLeft />
                  </button>
                  <span className="font-mono text-sm">
                    Page {historyPage + 1} of {Math.ceil(history.length / HISTORY_PAGE_SIZE)}
                  </span>
                  <button 
                    disabled={(historyPage + 1) * HISTORY_PAGE_SIZE >= history.length}
                    onClick={() => setHistoryPage(p => p + 1)}
                    className="p-2 bg-white/10 rounded-lg disabled:opacity-30 hover:bg-white/20"
                  >
                    <ChevronRight />
                  </button>
               </div>
             </>
           )}
        </Modal>
      )}

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