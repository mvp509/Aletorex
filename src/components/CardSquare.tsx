/**
 * ALETOREX - Luxury 3D Animated Square Playing Card Component
 */

import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Crown, Shield, Flame, Gem } from 'lucide-react';
import { CardValue } from '../types';
import { AletorexALogo } from './AletorexLogo';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslationKey } from '../utils/i18n';

interface CardSquareProps {
  value: CardValue | null;
  isRevealed: boolean;
  label?: string;
  sublabel?: string;
  isSelected?: boolean;
  isWinningCard?: boolean;
  isLosingCard?: boolean;
  isJokerRerolled?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  owner?: 'PLAYER' | 'BOT' | 'NEUTRAL';
  size?: 'normal' | 'large';
}

const getCardIcon = (val: CardValue | null) => {
  if (!val) return null;
  if (val === 10) return <Crown className="w-5 h-5 text-amber-400 animate-pulse" />;
  if (val >= 8) return <Gem className="w-4 h-4 text-emerald-400" />;
  if (val >= 5) return <Flame className="w-4 h-4 text-rose-400" />;
  return <Shield className="w-4 h-4 text-cyan-400" />;
};

export const CardSquare: React.FC<CardSquareProps> = ({
  value,
  isRevealed,
  label,
  sublabel,
  isSelected,
  isWinningCard,
  isLosingCard,
  isJokerRerolled,
  disabled = false,
  onClick,
  owner = 'NEUTRAL',
  size = 'normal',
}) => {
  const { t } = useLanguage();
  const isClickable = !disabled && !isRevealed && Boolean(onClick);

  const getRankName = (val: CardValue | null): string => {
    if (!val) return '';
    const key = `rank${val}` as TranslationKey;
    return t(key) || '';
  };

  const sizeClasses = size === 'large' 
    ? 'w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40' 
    : 'w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36';

  return (
    <div className="flex flex-col items-center select-none perspective-1000">
      {label && (
        <div className="mb-2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-900/80 border border-slate-700/80 text-slate-300 shadow-sm">
          {owner === 'PLAYER' && <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_#34d399]" />}
          {owner === 'BOT' && <span className="w-2 h-2 rounded-full bg-rose-400 inline-block shadow-[0_0_8px_#f43f5e]" />}
          {label}
        </div>
      )}

      <motion.button
        type="button"
        onClick={onClick}
        disabled={!isClickable}
        whileHover={isClickable ? { scale: 1.05, y: -4 } : {}}
        whileTap={isClickable ? { scale: 0.96 } : {}}
        className={`relative ${sizeClasses} rounded-2xl cursor-${isClickable ? 'pointer' : 'default'} transition-all duration-300 transform-style-preserve-3d outline-none focus:outline-none`}
        style={{
          transformStyle: 'preserve-3d',
          perspective: '1000px',
        }}
        aria-label={label || 'Carte de jeu'}
      >
        <motion.div
          className="w-full h-full relative"
          initial={false}
          animate={{
            rotateY: isRevealed ? 180 : 0,
            scale: isWinningCard ? [1, 1.04, 1] : 1,
          }}
          transition={{
            duration: 0.65,
            ease: [0.23, 1, 0.32, 1],
          }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* ================= CARD BACK (Face cachée) ================= */}
          <div
            className={`absolute inset-0 rounded-2xl p-2 flex flex-col items-center justify-between backface-hidden shadow-2xl border-2 transition-all duration-300 ${
              isSelected
                ? 'border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.5)]'
                : isClickable
                ? 'border-slate-600 hover:border-amber-400/80 hover:shadow-[0_0_20px_rgba(234,179,8,0.35)]'
                : 'border-slate-800'
            } bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Corner Gold Decors */}
            <div className="w-full flex justify-between items-center text-amber-500/70 text-[10px] font-mono px-1">
              <span>✦</span>
              <span className="text-[8px] tracking-widest text-slate-400">ALETOREX</span>
              <span>✦</span>
            </div>

            {/* Center Sacred Geometry & Emblem */}
            <div className="relative w-full flex-1 flex items-center justify-center">
              <div className="absolute inset-2 border border-amber-500/30 rounded-xl pointer-events-none" />
              <div className="absolute inset-4 border border-dashed border-amber-500/20 rounded-lg pointer-events-none" />
              
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-amber-500/25 via-amber-600/10 to-transparent border border-amber-400/50 flex items-center justify-center shadow-inner group">
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-8 h-8 rounded-full border border-amber-400/30 animate-pulse" />
                  <AletorexALogo size={32} withGlow className="relative z-10 transition-transform group-hover:scale-110" />
                </div>
              </div>
            </div>

            {/* Bottom prompt */}
            <div className="w-full text-center pb-0.5">
              {isClickable ? (
                <span className="text-[9px] sm:text-[10px] text-amber-300 font-bold uppercase tracking-wider animate-pulse">
                  {t('drawCardPrompt')}
                </span>
              ) : (
                <span className="text-[9px] text-slate-500 font-mono">{t('mysteryPrompt')}</span>
              )}
            </div>

            {/* Subtle holographic sheen overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none opacity-40" />
          </div>

          {/* ================= CARD FRONT (Face Révélée) ================= */}
          <div
            className={`absolute inset-0 rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between backface-hidden shadow-2xl border-3 transition-all duration-300 ${
              isWinningCard
                ? 'border-emerald-400 bg-gradient-to-br from-emerald-950/90 via-slate-900 to-slate-950 shadow-[0_0_30px_rgba(52,211,153,0.5)] ring-2 ring-emerald-400/50'
                : isLosingCard
                ? 'border-rose-700/60 bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950 shadow-[0_0_15px_rgba(244,63,94,0.2)] opacity-80'
                : 'border-amber-400/90 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.3)]'
            }`}
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            {/* Top Corner mini indicators */}
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-1 font-black text-xs sm:text-sm text-amber-300">
                <span>{value ?? '?'}</span>
                {getCardIcon(value)}
              </div>
              {isJokerRerolled && (
                <span className="bg-purple-600/90 text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-0.5 shadow-sm">
                  <Sparkles className="w-2.5 h-2.5" /> {t('cardJoker')}
                </span>
              )}
              {isWinningCard && !isJokerRerolled && (
                <span className="bg-emerald-500/90 text-slate-950 text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                  {t('cardWinner')}
                </span>
              )}
            </div>

            {/* Giant Central Value */}
            <div className="flex-1 flex flex-col items-center justify-center my-0.5">
              <span
                className={`text-4xl sm:text-5xl md:text-6xl font-black tracking-tight filter drop-shadow-md ${
                  value === 10
                    ? 'text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-yellow-600 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                    : isWinningCard
                    ? 'text-emerald-300 drop-shadow-[0_0_12px_rgba(110,231,183,0.5)]'
                    : isLosingCard
                    ? 'text-rose-300/80'
                    : 'text-white'
                }`}
              >
                {value ?? '-'}
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                {getRankName(value)}
              </span>
            </div>

            {/* Bottom Corner Mini indicators */}
            <div className="flex justify-between items-center w-full text-[10px] text-slate-400 font-mono">
              <span className="text-[9px] text-amber-400/80">1..10</span>
              <div className="flex items-center gap-1 font-black text-xs sm:text-sm text-amber-300">
                {getCardIcon(value)}
                <span>{value ?? '?'}</span>
              </div>
            </div>

            {/* Highlight Glow inside card */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-white/5 via-transparent to-white/10 pointer-events-none" />
          </div>
        </motion.div>
      </motion.button>

      {sublabel && (
        <span className="mt-1.5 text-xs text-slate-400 font-medium">
          {sublabel}
        </span>
      )}
    </div>
  );
};
