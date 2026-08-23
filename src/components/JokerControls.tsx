/**
 * ALETOREX - Joker Phase Decision Controls
 */

import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, XCircle } from 'lucide-react';
import { playSound } from '../utils/audio';
import { useLanguage } from '../contexts/LanguageContext';

interface JokerControlsProps {
  jokerPrice: number;
  jokersUsedPlayer: number;
  maxJokers: number;
  playerPoints: number;
  isMaxBet?: boolean;
  onBuyJoker: () => void;
  onPassJoker: () => void;
  disabled: boolean;
}

export const JokerControls: React.FC<JokerControlsProps> = ({
  jokerPrice,
  jokersUsedPlayer,
  maxJokers,
  playerPoints,
  isMaxBet = false,
  onBuyJoker,
  onPassJoker,
  disabled,
}) => {
  const { t } = useLanguage();
  const isFree = isMaxBet || jokerPrice === 0;
  const remainingJokers = maxJokers - jokersUsedPlayer;
  const canAfford = isFree || (playerPoints >= jokerPrice && jokerPrice > 0);
  const canBuy = remainingJokers > 0 && canAfford && !disabled;

  const handleBuy = () => {
    if (!canBuy) {
      playSound('error');
      return;
    }
    playSound('joker');
    onBuyJoker();
  };

  const handlePass = () => {
    if (disabled) return;
    playSound('click');
    onPassJoker();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-xl mx-auto bg-gradient-to-b from-purple-950/80 via-slate-900 to-slate-950 border-2 border-purple-600/60 rounded-2xl p-4 sm:p-5 shadow-[0_0_30px_rgba(147,51,234,0.25)] text-center backdrop-blur-md"
    >
      <div className="flex items-center justify-center gap-2 text-purple-300 font-extrabold text-sm sm:text-base mb-1">
        <Sparkles className="w-5 h-5 text-purple-400 animate-spin" />
        <span>{t('jokerPhaseTitle')}</span>
      </div>

      <p className="text-xs sm:text-sm text-slate-300 mb-4 max-w-md mx-auto">
        {t('jokerPhaseDesc')}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
        {/* Buy Joker CTA */}
        <button
          type="button"
          onClick={handleBuy}
          disabled={!canBuy}
          className={`py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border ${
            canBuy
              ? 'bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)] active:scale-[0.98]'
              : 'bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed opacity-50'
          }`}
        >
          <div className="flex items-center gap-1.5 text-sm sm:text-base">
            <span>{t('invokeJoker')}</span>
            {isFree ? (
              <span className="text-emerald-300 font-extrabold">({t('freeWord')})</span>
            ) : (
              <span className="text-amber-300 font-extrabold">({jokerPrice} pt{jokerPrice > 1 ? 's' : ''})</span>
            )}
          </div>
          <span className="text-[10px] text-purple-200 font-medium">
            {isFree ? t('allInFreeGift') : t('remainingUses')} : {remainingJokers}/{maxJokers}
          </span>
          {!canAfford && remainingJokers > 0 && (
            <span className="text-[10px] text-rose-400 font-bold">{t('insufficientPoints')}</span>
          )}
        </button>

        {/* Pass CTA */}
        <button
          type="button"
          onClick={handlePass}
          disabled={disabled}
          className="py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <XCircle className="w-4 h-4 text-slate-400" />
          <span>{t('acceptDefeat')}</span>
        </button>
      </div>
    </motion.div>
  );
};
