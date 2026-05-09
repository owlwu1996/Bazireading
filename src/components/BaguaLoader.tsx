import { useEffect, useState } from 'react';

interface BaguaLoaderProps {
  isLoading: boolean;
  userName?: string;
}

export default function BaguaLoader({ isLoading, userName }: BaguaLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);

  const stages = [
    'Calculating celestial coordinates...',
    'Aligning with the Five Elements...',
    'Reading the Four Pillars...',
    'Analyzing Life Cycles...',
    'Generating your destiny map...',
    'Finalizing your reading...',
  ];

  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      setStage(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 15 + 5;
      });
    }, 400);

    const stageInterval = setInterval(() => {
      setStage((prev) => (prev + 1) % stages.length);
    }, 800);

    return () => {
      clearInterval(interval);
      clearInterval(stageInterval);
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F0F0F]/95 backdrop-blur-sm">
      <div className="text-center">
        {/* Rotating Bagua */}
        <div className="relative w-48 h-48 mx-auto mb-8">
          {/* Outer ring with trigrams */}
          <svg
            className="absolute inset-0 w-full h-full animate-spin"
            style={{ animationDuration: '8s' }}
            viewBox="0 0 200 200"
          >
            {/* Outer circle */}
            <circle cx="100" cy="100" r="96" fill="none" stroke="#D4A853" strokeWidth="2" opacity="0.6" />
            <circle cx="100" cy="100" r="88" fill="none" stroke="#D4A853" strokeWidth="0.5" opacity="0.3" />

            {/* 8 Trigrams */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const x1 = 100 + Math.cos(rad) * 90;
              const y1 = 100 + Math.sin(rad) * 90;
              const x2 = 100 + Math.cos(rad) * 96;
              const y2 = 100 + Math.sin(rad) * 96;

              // Trigram patterns (yang = solid, yin = broken)
              const trigrams = [
                [1, 1, 1], // Qian (Heaven)
                [0, 1, 1], // Dui (Lake)
                [1, 0, 1], // Li (Fire)
                [0, 0, 1], // Zhen (Thunder)
                [0, 0, 0], // Kun (Earth)
                [1, 0, 0], // Gen (Mountain)
                [0, 1, 0], // Kan (Water)
                [1, 1, 0], // Xun (Wind)
              ];

              return (
                <g key={i}>
                  {/* Divider line */}
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#D4A853" strokeWidth="2" opacity="0.6" />

                  {/* Trigram lines */}
                  {trigrams[i].map((isYang, lineIndex) => {
                    const lineRad = rad;
                    const dist = 78 - lineIndex * 6;
                    const lx = 100 + Math.cos(lineRad) * dist;
                    const ly = 100 + Math.sin(lineRad) * dist;
                    const perpX = -Math.sin(lineRad) * 4;
                    const perpY = Math.cos(lineRad) * 4;

                    if (isYang) {
                      return (
                        <line
                          key={lineIndex}
                          x1={lx - perpX}
                          y1={ly - perpY}
                          x2={lx + perpX}
                          y2={ly + perpY}
                          stroke="#D4A853"
                          strokeWidth="2"
                          opacity="0.7"
                        />
                      );
                    } else {
                      return (
                        <g key={lineIndex}>
                          <line
                            x1={lx - perpX}
                            y1={ly - perpY}
                            x2={lx - perpX * 0.3}
                            y2={ly - perpY * 0.3}
                            stroke="#D4A853"
                            strokeWidth="2"
                            opacity="0.7"
                          />
                          <line
                            x1={lx + perpX * 0.3}
                            y1={ly + perpY * 0.3}
                            x2={lx + perpX}
                            y2={ly + perpY}
                            stroke="#D4A853"
                            strokeWidth="2"
                            opacity="0.7"
                          />
                        </g>
                      );
                    }
                  })}
                </g>
              );
            })}
          </svg>

          {/* Inner Yin-Yang (counter-rotating) */}
          <svg
            className="absolute inset-0 w-full h-full animate-spin"
            style={{ animationDuration: '6s', animationDirection: 'reverse' }}
            viewBox="0 0 200 200"
          >
            <circle cx="100" cy="100" r="55" fill="none" stroke="#D4A853" strokeWidth="1.5" opacity="0.5" />
            <path
              d="M100,45 A55,55 0 0,1 100,155 A27.5,27.5 0 0,1 100,100 A27.5,27.5 0 0,0 100,45"
              fill="#D4A853"
              opacity="0.6"
            />
            <path
              d="M100,45 A55,55 0 0,0 100,155 A27.5,27.5 0 0,0 100,100 A27.5,27.5 0 0,1 100,45"
              fill="#0F0F0F"
              opacity="0.8"
            />
            <circle cx="100" cy="72.5" r="8" fill="#0F0F0F" opacity="0.9" />
            <circle cx="100" cy="127.5" r="8" fill="#D4A853" opacity="0.9" />
          </svg>

          {/* Center glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-[#D4A853]/10 animate-pulse" />
          </div>
        </div>

        {/* Loading text */}
        <h2 className="text-xl font-bold text-[#D4A853] mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
          Calculating Your Destiny
        </h2>

        {userName && (
          <p className="text-sm text-[#F5F0E8]/60 mb-4">
            Preparing reading for <span className="text-[#D4A853]">{userName}</span>
          </p>
        )}

        {/* Stage text with fade animation */}
        <p className="text-sm text-[#F5F0E8]/50 mb-6 h-5 transition-all duration-300">
          {stages[stage]}
        </p>

        {/* Progress bar */}
        <div className="w-64 mx-auto h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#D4A853] to-[#B87333] rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        <p className="text-xs text-[#F5F0E8]/30 mt-3">
          {Math.min(Math.round(progress), 100)}%
        </p>
      </div>
    </div>
  );
}
