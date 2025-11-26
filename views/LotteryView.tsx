import React, { useState, useMemo, useEffect } from 'react';
import { Prize, Theme, THEME_COLORS, DrawResult, PrizeTier, DrawRecord } from '../types';
import { generateCongratulation } from '../services/geminiService';
import { X, List, Sparkles } from 'lucide-react';

interface LotteryViewProps {
  theme: Theme;
  prizes: Prize[];
  onDraw: (prizes: Prize[]) => void;
  recentHistory: DrawRecord[];
}

const LotteryView: React.FC<LotteryViewProps> = ({ theme, prizes, onDraw, recentHistory }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  // Store array of results for multi-draw
  const [results, setResults] = useState<DrawResult[] | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [showPrizeList, setShowPrizeList] = useState(true); // Toggle for mobile

  const colors = THEME_COLORS[theme];
  const totalRemaining = prizes.reduce((acc, p) => acc + p.remainingQuantity, 0);

  // Helper to determine tier color
  const getTierColor = (tier: PrizeTier) => {
    switch(tier) {
      case PrizeTier.S: return 'bg-yellow-400 text-yellow-900 border-yellow-600';
      case PrizeTier.A: return 'bg-purple-400 text-purple-900 border-purple-600';
      case PrizeTier.B: return 'bg-blue-400 text-blue-900 border-blue-600';
      case PrizeTier.C: return 'bg-green-400 text-green-900 border-green-600';
      default: return 'bg-gray-200 text-gray-700 border-gray-400';
    }
  };

  // Helper for Ball/Capsule Color only
  const getBallBg = (tier: PrizeTier) => {
    switch(tier) {
        case PrizeTier.S: return 'bg-yellow-400';
        case PrizeTier.A: return 'bg-purple-400';
        case PrizeTier.B: return 'bg-blue-400';
        case PrizeTier.C: return 'bg-green-400';
        default: return 'bg-pink-400'; // Common/D tier
    }
  };

  // Generate visual capsules based on inventory
  // This ensures the machine looks emptier as prizes run out
  const visualCapsules = useMemo(() => {
    const MAX_CAPSULES = 25; // Don't overcrowd the DOM
    const capsules: Prize[] = [];
    
    if (totalRemaining === 0) return [];

    // Create a weighted list for sampling
    // If total prizes are fewer than MAX_CAPSULES, just show all of them.
    // If more, sample proportionally.
    
    if (totalRemaining <= MAX_CAPSULES) {
        prizes.forEach(p => {
            for(let i=0; i<p.remainingQuantity; i++) capsules.push(p);
        });
    } else {
        // Stochastic sampling to represent distribution
        for (let i = 0; i < MAX_CAPSULES; i++) {
            const rand = Math.random() * totalRemaining;
            let runningSum = 0;
            for (const p of prizes) {
                runningSum += p.remainingQuantity;
                if (rand < runningSum) {
                    capsules.push(p);
                    break;
                }
            }
        }
    }
    
    // Shuffle slightly so colors aren't clumped
    return capsules.sort(() => Math.random() - 0.5);
  }, [prizes, totalRemaining]);


  const handleDrawClick = async (count: number) => {
    if (totalRemaining < count) {
      alert(`Only ${totalRemaining} prizes left! 仅剩 ${totalRemaining} 个奖品了！`);
      return;
    }

    setIsAnimating(true);
    setResults(null);
    setLoadingMessage(count > 1 ? `Drawing ${count} prizes... 正在抽取${count}连...` : "Magic is happening... 魔法聚集ing...");

    // Simulate multi-draw
    const drawnResults: DrawResult[] = [];
    const tempPrizes = prizes.map(p => ({ ...p })); // Deep copy to track local decrement

    for (let i = 0; i < count; i++) {
      const availablePrizes = tempPrizes.filter(p => p.remainingQuantity > 0);
      
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

      // Decrement local temp copy
      selectedPrize.remainingQuantity--;
      
      // Determine message later to save AI calls
      drawnResults.push({
        prize: selectedPrize,
        message: "", // Placeholder
        timestamp: Date.now() + i
      });
    }

    // Identify the "Best" prize to generate a message for
    const tierOrder = { [PrizeTier.S]: 0, [PrizeTier.A]: 1, [PrizeTier.B]: 2, [PrizeTier.C]: 3, [PrizeTier.D]: 4, [PrizeTier.LAST_ONE]: 5 };
    
    // Sort to find the highest tier prize
    const bestPrizeResult = [...drawnResults].sort((a, b) => {
      return (tierOrder[a.prize.tier] || 99) - (tierOrder[b.prize.tier] || 99);
    })[0];

    // Call AI only once for the best prize
    const aiMsgPromise = generateCongratulation(bestPrizeResult.prize, theme);

    // Simulate animation delay
    setTimeout(async () => {
      const aiMsg = await aiMsgPromise;
      
      // Apply message to the best prize
      bestPrizeResult.message = aiMsg;

      setIsAnimating(false);
      setResults(drawnResults);
      
      // Pass full prizes back to App
      onDraw(drawnResults.map(r => r.prize));
    }, 2500); // Slightly longer for dramatic effect
  };

  const resetDraw = () => {
    setResults(null);
  };

  const isImage = (str: string) => {
    return str && (str.startsWith('data:') || str.startsWith('http'));
  };

  // --- Components ---

  const Ticker = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    
    // Only show last 5 wins to keep it fresh
    const recentWins = recentHistory.slice(0, 5);

    useEffect(() => {
        if (recentWins.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % recentWins.length);
        }, 3000); // Rotate every 3 seconds
        return () => clearInterval(interval);
    }, [recentWins.length]);

    if (recentWins.length === 0) return <div className="h-8"></div>;

    const currentWin = recentWins[currentIndex];

    return (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[90%] md:w-[600px] h-10 overflow-hidden rounded-full bg-black/40 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center z-30">
            <div key={currentIndex} className="animate-pop-in flex items-center gap-2 text-sm md:text-base font-medium text-yellow-300 px-4 whitespace-nowrap">
                <Sparkles size={16} className="text-yellow-100" />
                <span>Congratulation! 恭喜抽中</span>
                <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded">{currentWin.prizeName}</span>
                <span className="text-xs opacity-80">({currentWin.prizeNameCN})</span>
                <span className="text-xs opacity-60 ml-2 font-mono">{new Date(currentWin.timestamp).toLocaleTimeString()}</span>
            </div>
        </div>
    );
  };
  
  const Machine = () => (
    <div className={`relative w-80 h-[36rem] mx-auto transition-transform ${isAnimating ? 'animate-shake' : ''} mt-16 select-none`}>
      {/* Ears - The signature Labubu silhouette */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 flex justify-between z-10 pointer-events-none">
          {/* Left Ear */}
          <div className="w-20 h-40 bg-blue-100/30 border-4 border-white/50 rounded-t-[50px] rounded-b-3xl -rotate-12 translate-y-8 backdrop-blur-md shadow-[inset_0_0_20px_rgba(255,255,255,0.4)]"></div>
          {/* Right Ear */}
          <div className="w-20 h-40 bg-blue-100/30 border-4 border-white/50 rounded-t-[50px] rounded-b-3xl rotate-12 translate-y-8 backdrop-blur-md shadow-[inset_0_0_20px_rgba(255,255,255,0.4)]"></div>
      </div>

      {/* Top Dome (Head) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-64 bg-blue-100/30 rounded-[3rem] rounded-t-[5rem] border-4 border-white/50 backdrop-blur-md z-20 overflow-hidden shadow-[inset_0_0_30px_rgba(255,255,255,0.4)]">
        {/* Reflection */}
        <div className="absolute top-6 left-10 w-20 h-10 bg-white/40 rounded-full -rotate-12 blur-md z-30"></div>
        <div className="absolute top-10 right-12 w-8 h-8 bg-white/30 rounded-full blur-sm z-30"></div>
        
        {/* Balls inside */}
        <div className={`w-full h-full relative ${isAnimating ? 'animate-spin-slow' : ''}`}>
          {visualCapsules.map((prize, i) => (
             <div 
               key={i}
               className={`absolute w-12 h-12 flex items-center justify-center transition-transform duration-500`}
               style={{
                 top: `${35 + Math.random() * 45}%`,
                 left: `${Math.random() * 75}%`,
                 transform: `rotate(${Math.random() * 360}deg) ${isAnimating ? `translate(${Math.random()*30 - 15}px, ${Math.random()*30 - 15}px)` : ''}`,
               }}
             >
                {/* Labubu-shaped Capsule */}
                <div className={`relative w-full h-full ${getBallBg(prize.tier)} rounded-[1rem] shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.2),2px_2px_6px_rgba(255,255,255,0.3)] border border-black/5`}>
                     {/* Ears of the capsule */}
                     <div className={`absolute -top-3 left-1 w-3 h-5 ${getBallBg(prize.tier)} rounded-full -rotate-15`}></div>
                     <div className={`absolute -top-3 right-1 w-3 h-5 ${getBallBg(prize.tier)} rounded-full rotate-15`}></div>
                     
                     {/* Face/Reflection Area */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-7 bg-white/20 rounded-full blur-[1px]"></div>
                </div>
             </div>
          ))}
          {visualCapsules.length === 0 && (
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/50 font-bold text-xl">
               Sold Out
             </div>
          )}
        </div>
      </div>

      {/* Neck/Collar connection */}
      <div className={`absolute top-[15rem] left-1/2 -translate-x-1/2 w-64 h-8 z-10 rounded-full ${theme === Theme.CHRISTMAS ? 'bg-green-700' : 'bg-red-800'} shadow-lg`}></div>

      {/* Body */}
      <div className={`absolute top-[15.5rem] left-1/2 -translate-x-1/2 w-60 h-64 rounded-b-[3rem] shadow-2xl z-10 flex flex-col items-center
        ${theme === Theme.CHRISTMAS ? 'bg-red-600' : 'bg-red-700'}
        border-b-8 border-r-8 border-black/10
      `}>
         {/* Character Face / Decorative Plate on Body */}
         <div className="mt-8 w-44 h-32 bg-white/90 rounded-[2rem] flex flex-col items-center justify-center border-4 border-gray-100 shadow-inner relative overflow-hidden">
             
             {/* Eyes (Decorative) */}
             <div className="flex gap-6 mb-2 absolute top-4">
                 <div className="w-3 h-8 bg-black rounded-full rotate-12 opacity-80"></div>
                 <div className="w-3 h-8 bg-black rounded-full -rotate-12 opacity-80"></div>
             </div>
             
             {/* Mouth/Slot Area */}
             <div className="w-28 h-10 bg-black/80 rounded-full relative overflow-hidden mt-6 border-2 border-black">
                {/* Teeth */}
                <div className="flex justify-center h-4 w-full px-2">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="flex-1 h-3 bg-white rounded-b-sm mx-px"></div>)}
                </div>
             </div>
         </div>

         {/* Control Knob (The Nose) */}
         <div className={`absolute top-[6.5rem] w-14 h-14 rounded-full bg-white border-4 border-gray-200 shadow-xl flex items-center justify-center cursor-pointer active:scale-95 transition-transform z-30 ${isAnimating ? 'rotate-180' : ''}`}
              style={{ transitionDuration: '1s' }}
         >
             <div className="w-10 h-8 bg-black rounded-full mb-1"></div> {/* Nose Shape */}
         </div>

         {/* Exit Slot Shadow/Hole */}
         <div className="absolute bottom-6 w-24 h-8 bg-black/20 rounded-full shadow-inner"></div>
      </div>
      
      {/* Legs/Feet */}
      <div className="absolute bottom-[0.5rem] left-1/2 -translate-x-1/2 w-52 flex justify-between z-0">
          <div className={`w-14 h-12 rounded-b-3xl ${theme === Theme.CHRISTMAS ? 'bg-red-700' : 'bg-red-800'}`}></div>
          <div className={`w-14 h-12 rounded-b-3xl ${theme === Theme.CHRISTMAS ? 'bg-red-700' : 'bg-red-800'}`}></div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row w-full max-w-7xl mx-auto gap-8 relative z-10">
      
      {/* LEFT: Main Machine Area */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] relative">
        
        {/* Header Area with Ticker */}
        <div className="text-center mb-8 relative w-full flex flex-col items-center">
          <Ticker />
          <h1 className={`text-4xl md:text-6xl font-extrabold mb-2 drop-shadow-lg ${theme === Theme.CHRISTMAS ? 'font-serif' : 'font-sans'}`}>
            {theme === Theme.CHRISTMAS ? '🎄 Holiday Gacha 🎄' : '🧧 Fortune Machine 🧧'}
          </h1>
        </div>

        {/* The Machine */}
        {!results && (
          <div className="relative mb-8 transform scale-90 md:scale-100 origin-top">
             <Machine />
             
             {/* Controls */}
             <div className="mt-12 flex flex-wrap justify-center gap-4">
               {[1, 3, 5, 10].map(num => (
                 <button
                   key={num}
                   disabled={isAnimating || totalRemaining < num}
                   onClick={() => handleDrawClick(num)}
                   className={`
                     px-6 py-3 rounded-xl font-bold text-lg shadow-lg transform transition-all
                     flex flex-col items-center min-w-[5rem]
                     ${isAnimating || totalRemaining < num 
                        ? 'bg-gray-500 opacity-50 cursor-not-allowed' 
                        : theme === Theme.CHRISTMAS 
                            ? 'bg-green-600 hover:bg-green-500 text-white hover:-translate-y-1' 
                            : 'bg-yellow-500 hover:bg-yellow-400 text-red-900 hover:-translate-y-1'
                     }
                   `}
                 >
                   <span>x{num}</span>
                   <span className="text-xs opacity-80 font-normal">Draw</span>
                 </button>
               ))}
             </div>
             {isAnimating && <p className="text-center mt-4 text-xl font-bold animate-pulse">{loadingMessage}</p>}
          </div>
        )}

        {/* Results Modal / Overlay */}
        {results && (
          <div className="w-full max-w-4xl animate-pop-in">
             <div className={`
               relative p-6 md:p-10 rounded-3xl shadow-2xl border-4 max-h-[80vh] overflow-y-auto
               ${theme === Theme.CHRISTMAS ? 'bg-white text-slate-900 border-green-600' : 'bg-red-50 text-red-900 border-yellow-500'}
             `}>
                <button onClick={resetDraw} className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 transition"><X /></button>

                <div className="text-center mb-8">
                   <h2 className="text-3xl font-black mb-2">🎉 Rewards Unlocked! 🎉</h2>
                   {results.find(r => r.message) && (
                     <p className={`text-lg font-medium italic opacity-80 max-w-2xl mx-auto p-2 rounded ${theme === Theme.CHRISTMAS ? 'bg-green-100' : 'bg-yellow-100'}`}>
                        "{results.find(r => r.message)?.message}"
                     </p>
                   )}
                </div>

                <div className={`grid gap-4 ${results.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'}`}>
                  {results.map((res, idx) => (
                    <div key={idx} className={`
                       relative flex flex-col items-center p-4 rounded-xl border-2 shadow-sm bg-white/50 backdrop-blur-sm
                       ${getTierColor(res.prize.tier)} animate-pop-in
                    `} style={{ animationDelay: `${idx * 0.1}s` }}>
                       
                       <div className="absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full bg-white/80 shadow-sm border border-black/10">
                          {res.prize.tier}
                       </div>

                       <div className="w-24 h-24 mb-2 flex items-center justify-center">
                          {isImage(res.prize.image) ? (
                              <img src={res.prize.image} alt={res.prize.name} className="w-full h-full object-contain" />
                          ) : (
                              <span className="text-5xl">{res.prize.image}</span>
                          )}
                       </div>
                       
                       <h3 className="font-bold text-center text-sm leading-tight mb-1 line-clamp-2 h-10 flex items-center justify-center">{res.prize.name}</h3>
                       <p className="text-xs text-center opacity-70">{res.prize.nameCN}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 text-center">
                   <button 
                    onClick={resetDraw}
                    className={`
                      px-12 py-3 text-xl font-bold rounded-xl shadow-md transition-colors
                      ${colors.accent} text-white ${colors.accentHover}
                    `}
                  >
                    Collect / 收入囊中
                  </button>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* RIGHT: Detailed Prize List (Fixed on desktop, toggleable on mobile) */}
      <div className={`
         fixed inset-x-0 bottom-0 top-auto z-30 transform transition-transform duration-300 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.3)]
         md:relative md:transform-none md:w-80 md:h-[80vh] md:rounded-2xl md:shadow-xl md:top-auto
         ${theme === Theme.CHRISTMAS ? 'bg-slate-800/95 border-t-4 border-green-500' : 'bg-red-900/95 border-t-4 border-yellow-500'}
         ${showPrizeList ? 'translate-y-0' : 'translate-y-[92%]'}
         md:translate-y-0
      `}>
         {/* Mobile Toggle Handle */}
         <div className="md:hidden flex justify-center p-2 cursor-pointer" onClick={() => setShowPrizeList(!showPrizeList)}>
            <div className="w-12 h-1.5 bg-white/30 rounded-full"></div>
         </div>

         <div className="p-4 md:p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                 <List size={20} /> Prize Pool
              </h3>
              <span className="text-sm font-mono bg-black/20 px-2 py-1 rounded text-white/80">
                 Left: {totalRemaining}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
               {prizes.sort((a,b) => (a.remainingQuantity === 0 ? 1 : 0) - (b.remainingQuantity === 0 ? 1 : 0)).map((prize) => (
                 <div key={prize.id} className={`
                    flex items-center gap-3 p-3 rounded-lg border border-white/5 transition-colors
                    ${prize.remainingQuantity === 0 ? 'bg-black/20 opacity-50 grayscale' : 'bg-white/5 hover:bg-white/10'}
                 `}>
                    <div className={`
                       w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-lg bg-white/10
                    `}>
                       {isImage(prize.image) ? <img src={prize.image} className="w-full h-full object-cover rounded-lg" /> : prize.image}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-1.5 rounded border ${
                            prize.tier === 'S' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' :
                            prize.tier === 'A' ? 'bg-purple-500/20 text-purple-300 border-purple-500/50' :
                            'bg-gray-500/20 text-gray-300 border-gray-500/50'
                          }`}>
                            {prize.tier}
                          </span>
                          <span className="font-medium text-sm truncate">{prize.name}</span>
                       </div>
                       <div className="text-xs opacity-60 truncate">{prize.nameCN}</div>
                    </div>

                    <div className="text-right shrink-0">
                       <span className={`text-lg font-bold font-mono ${prize.remainingQuantity < 5 && prize.remainingQuantity > 0 ? 'text-red-400' : ''}`}>
                         x{prize.remainingQuantity}
                       </span>
                    </div>
                 </div>
               ))}
               
               {prizes.length === 0 && <div className="text-center opacity-50 py-10">No prizes configured.</div>}
            </div>
         </div>
      </div>
    </div>
  );
};

export default LotteryView;