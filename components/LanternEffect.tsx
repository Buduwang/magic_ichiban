import React from 'react';

const LanternEffect: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex justify-between px-10">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="relative animate-wiggle" style={{ animationDelay: `${i * 0.5}s` }}>
          <div className="w-1 bg-yellow-600 h-16 mx-auto"></div>
          <div className="w-16 h-20 bg-red-600 rounded-lg border-2 border-yellow-500 shadow-lg flex items-center justify-center">
             <span className="text-yellow-300 text-xs font-bold">福</span>
          </div>
          <div className="w-1 bg-yellow-600 h-8 mx-auto"></div>
        </div>
      ))}
    </div>
  );
};

export default LanternEffect;