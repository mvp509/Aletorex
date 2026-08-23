/**
 * ALETOREX - Auto-Play / Spectator Controls (Compact & Ultra-discreet design)
 * Mode Offensif Exclusive Spectator Feature:
 * - Ultra-compact bar with strategy pills and quick stop
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Square,
  ArrowLeft,
  ArrowRight,
  Shuffle,
  Radio,
} from 'lucide-react';
import { AutoPlayStrategy, GameStage } from '../types';
import { playSound } from '../utils/audio';
import { useLanguage } from '../contexts/LanguageContext';

interface AutoPlayBarProps {
  isAutoPlayActive: boolean;
  strategy: AutoPlayStrategy;
  onToggleAutoPlay: () => void;
  onChangeStrategy: (strategy: AutoPlayStrategy) => void;
  onStopAutoPlay: () => void;
  stage: GameStage;
  isProcessing?: boolean;
  disabled?: boolean;
}

export const AutoPlayBar: React.FC<AutoPlayBarProps> = ({
  isAutoPlayActive,
  strategy,
  onChangeStrategy,
  onStopAutoPlay,
  stage,
}) => {
  const { t } = useLanguage();

  if (!isAutoPlayActive) {
    return null;
  }

  const STRATEGIES: { id: AutoPlayStrategy; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'LEFT',
      label: t('spectatorLeft'),
      icon: <ArrowLeft className="w-3 h-3" />,
      desc: t('spectatorDescLeft'),
    },
    {
      id: 'RIGHT',
      label: t('spectatorRight'),
      icon: <ArrowRight className="w-3 h-3" />,
      desc: t('spectatorDescRight'),
    },
    {
      id: 'RANDOM',
      label: t('spectatorRandom'),
      icon: <Shuffle className="w-3 h-3" />,
      desc: t('spectatorDescRandom'),
    },
  ];

  const getStageText = () => {
    if (stage === 'SELECTION') return t('stageChoice');
    if (stage === 'BETTING') return t('stageBetting');
    return t('stageInGame');
  };

  return (
    <div className="w-full mb-1.5">
      <AnimatePresence mode="wait">
        {/* COMPACT & SLIM SPECTATOR BAR */}
        <motion.div
          key="active-spectator-bar"
          initial={{ opacity: 0, y: -4, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.99 }}
          className="w-full px-2.5 py-1 sm:py-1.5 rounded-xl bg-slate-950/90 border border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.2)] backdrop-blur-md flex items-center justify-between gap-2"
        >
          {/* Left: Compact Indicator */}
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="relative flex items-center justify-center shrink-0">
              <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_6px_#ef4444]"></span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-red-300 truncate">
              <Radio className="w-3 h-3 text-red-400 animate-pulse shrink-0" />
              <span className="truncate hidden xs:inline">{t('spectator')}</span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">
                ({getStageText()})
              </span>
            </div>
          </div>

          {/* Center: Slim Strategy Selector Tabs */}
          <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
            {STRATEGIES.map((s) => {
              const isSelected = strategy === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    playSound('click');
                    onChangeStrategy(s.id);
                  }}
                  title={s.desc}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s.icon}
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Compact Stop Button */}
          <button
            type="button"
            onClick={() => {
              playSound('chip');
              onStopAutoPlay();
            }}
            className="px-2 py-0.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/50 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 active:scale-95"
            title="Arrêter le mode spectateur"
          >
            <Square className="w-2.5 h-2.5 fill-current" />
            <span>{t('spectatorStop')}</span>
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
