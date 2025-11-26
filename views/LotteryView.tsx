import React, { useState } from 'react';
import { Prize, Theme, THEME_COLORS, DrawResult } from '../types';
import { generateCongratulation } from '../services/geminiService';
import { Gift, Sparkles } from 'lucide-react';

interface LotteryViewProps {
  theme: Theme;
  prizes: Prize[];
  onDraw: (prizeId: string) => void;
}

const LotteryView: React.FC<LotteryViewProps> = ({ theme, prizes, onDraw }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [result, setResult] = useState<DrawResult | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>("");

  const colors = THEME_COLORS[theme];

  // Calculate probability based on remaining quantities
  const handleDrawClick = async () => {
    const availablePrizes = prizes.filter(p => p.remainingQuantity > 0);
    
    if (availablePrizes.length === 0) {
      alert("Oh no! All prizes are gone! 奖品都发完啦！");
      return;
    }

    setIsAnimating(true);
    setResult(null);
    setLoadingMessage("Magic is happening... 魔法聚集ing...");

    // Weighted Random Selection
    let totalWeight = 0;
    availablePrizes.forEach(p => totalWeight += p.remainingQuantity);
    
    let random = Math.random() * totalWeight;
    let selectedPrize = availablePrizes[0];
    
    for (const prize of availablePrizes) {
      if (random < prize.remainingQuantity) {
        selectedPrize = prize;
        break;
      }
      random -= prize.remainingQuantity;
    }

    // Call AI for message (start early)
    const aiMsgPromise = generateCongratulation(selectedPrize, theme);

    // Simulate animation delay
    setTimeout(async () => {
      const aiMsg = await aiMsgPromise;
      
      setIsAnimating(false);
      setResult({
        prize: selectedPrize,
        message: aiMsg,
        timestamp: Date.now()
      });
      
      onDraw(selectedPrize.id);
    }, 2000);
  };

  const resetDraw = () => {
    setResult(null);
  };

  const isImage = (str: string) => {
    return str && (str.startsWith('data:') || str.startsWith('http'));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-4xl mx-auto p-6 relative z-10">
      
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className={`text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-lg ${theme === Theme.CHRISTMAS ? 'font-serif' : 'font-sans'}`}>
          {theme === Theme.CHRISTMAS ? '🎄 Holiday Lucky Draw 🎄' : '🧧 New Year Fortune 🧧'}
        </h1>
        <p className="text-2xl opacity-90">
          {theme === Theme.CHRISTMAS ? 'Merry Christmas! 圣诞快乐！' : 'Happy Year of the Horse! 马年大吉！'}
        </p>
      </div>

      {/* The Box / Button */}
      {!result && (
        <div className="relative group cursor-pointer" onClick={!isAnimating ? handleDrawClick : undefined}>
          <div className={`
            w-64 h-64 md:w-80 md:h-80 rounded-3xl flex items-center justify-center shadow-2xl
            transition-all duration-300 transform
            ${isAnimating ? 'animate-bounce-fast scale-110' : 'hover:scale-105'}
            ${theme === Theme.CHRISTMAS ? 'bg-gradient-to-br from-green-500 to-green-800 border-4 border-red-500' : 'bg-gradient-to-br from-red-500 to-red-800 border-4 border-yellow-500'}
          `}>
            {isAnimating ? (
               <Sparkles className="w-32 h-32 text-white animate-spin-slow" />
            ) : (
               <Gift className="w-32 h-32 text-white" />
            )}
          </div>
          
          <div className="mt-8 text-center">
            <button 
              disabled={isAnimating}
              className={`
                px-12 py-4 text-3xl font-bold rounded-full shadow-lg transform transition-all
                ${theme === Theme.CHRISTMAS ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-yellow-500 hover:bg-yellow-400 text-red-900'}
                ${isAnimating ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1 active:scale-95'}
              `}
            >
              {isAnimating ? 'Drawing... 抽奖中...' : 'Draw! 点击抽奖'}
            </button>
          </div>
        </div>
      )}

      {/* Result Popup */}
      {result && (
        <div className="animate-wiggle w-full max-w-lg">
           <div className={`
             relative p-8 rounded-3xl shadow-2xl border-8 text-center overflow-hidden
             ${theme === Theme.CHRISTMAS ? 'bg-white text-slate-900 border-green-600' : 'bg-red-50 text-red-900 border-yellow-500'}
           `}>
              {/* Background Burst */}
              <div className="absolute inset-0 bg-yellow-200 opacity-20 animate-pulse z-0"></div>

              <div className="relative z-10">
                <div className="flex justify-center mb-4 animate-bounce">
                    {isImage(result.prize.image) ? (
                        <img src={result.prize.image} alt={result.prize.name} className="w-40 h-40 md:w-56 md:h-56 object-contain drop-shadow-xl rounded-xl bg-white/20 backdrop-blur-sm p-2" />
                    ) : (
                        <div className="text-8xl md:text-9xl">{result.prize.image}</div>
                    )}
                </div>
                
                <h2 className="text-2xl font-bold text-gray-500 mb-1 uppercase tracking-widest">You Won!</h2>
                <h3 className={`text-4xl md:text-5xl font-black mb-2 ${theme === Theme.CHRISTMAS ? 'text-red-600' : 'text-red-800'}`}>
                  {result.prize.name}
                </h3>
                <h4 className="text-3xl font-bold mb-6 opacity-80">{result.prize.nameCN}</h4>
                
                <div className={`p-4 rounded-xl mb-8 text-lg font-medium italic ${theme === Theme.CHRISTMAS ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-red-800'}`}>
                  "{result.message}"
                </div>

                <button 
                  onClick={resetDraw}
                  className={`
                    px-8 py-3 text-xl font-bold rounded-xl shadow-md transition-colors
                    ${colors.accent} text-white ${colors.accentHover}
                  `}
                >
                  Play Again / 再玩一次
                </button>
              </div>
           </div>
        </div>
      )}
      
      {/* Small Footer Stats */}
      {!result && (
        <div className="mt-12 grid grid-cols-3 gap-4 text-center opacity-60 text-sm md:text-base">
           <div className="bg-black/20 p-3 rounded-lg">
              <div className="font-bold text-2xl">{prizes.reduce((acc, p) => acc + p.remainingQuantity, 0)}</div>
              <div>Remaining Left<br/>剩余奖品</div>
           </div>
           <div className="bg-black/20 p-3 rounded-lg">
              <div className="font-bold text-2xl">{prizes.filter(p => p.tier === 'S' || p.tier === 'A').reduce((acc, p) => acc + p.remainingQuantity, 0)}</div>
              <div>Big Prizes<br/>大奖剩余</div>
           </div>
        </div>
      )}
    </div>
  );
};

export default LotteryView;