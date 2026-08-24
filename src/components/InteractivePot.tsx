/**
 * ALETOREX - Luxury Interactive Game Pot & Outcome Calculator Component
 * - Real-time Live calculation (2x Multiplier Calculator)
 * - Live Gain & Loss simulator (+Mise si victoire, -Mise si défaite)
 * - Sleek, modern Casino VIP glassmorphic design
 * - Shimmer light sweep & ambient golden glow
 * - Dynamic victory celebration (shake, ring pulse & coin burst)
 * - HIGH-CONTRAST, TOP-LEVEL CENTERED MODAL FOR MAXIMUM LEGIBILITY & VISIBILITY
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Coins,
  Sparkles,
  Info,
  Trophy,
  TrendingUp,
  TrendingDown,
  Scale,
  X,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  Dices,
  HelpCircle
} from 'lucide-react';
import { playSound } from '../utils/audio';
import { formatCompactNumber } from '../utils/formatters';
import confetti from 'canvas-confetti';
import { GameStage } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface InteractivePotProps {
  currentBet: number;
  botName: string;
  isWin?: boolean;
  isBigWin?: boolean;
  winner?: string | null;
  isBettingStage?: boolean;
  playerPoints?: number;
  isChaotic?: boolean;
  botChaoticBet?: number | null;
  chaoticDailyCount?: number;
  stage?: GameStage;
}

export const InteractivePot: React.FC<InteractivePotProps> = ({
  currentBet,
  botName,
  isWin = false,
  isBigWin = false,
  winner = null,
  isChaotic = false,
  botChaoticBet = null,
  chaoticDailyCount = 0,
  stage = 'BETTING',
}) => {
  const { t } = useLanguage();
  const [showDetails, setShowDetails] = useState(false);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [shakeTrigger, setShakeTrigger] = useState(0);

  const safeBet = Math.max(0, currentBet || 0);
  const isGameOver = stage === 'GAME_OVER';
  const isEvolved = isChaotic && chaoticDailyCount >= 3;

  // In chaotic mode, opponent bet is secret until GAME_OVER
  const isChaoticRevealed = isChaotic && isGameOver && botChaoticBet !== null;
  const actualBotBet = isChaotic
    ? isChaoticRevealed
      ? (botChaoticBet ?? 0)
      : null
    : safeBet;

  const potTotal = isChaotic
    ? isChaoticRevealed
      ? safeBet + (botChaoticBet ?? 0)
      : null
    : safeBet * 2;

  const netGainIfWin = isChaotic
    ? isChaoticRevealed
      ? (botChaoticBet ?? 0)
      : null
    : safeBet;

  const netLossIfDefeat = safeBet;

  // Trigger shake and celebration whenever a player win occurs
  useEffect(() => {
    if (winner === 'PLAYER' || isWin || isBigWin) {
      setShakeTrigger((prev) => prev + 1);
    }
  }, [winner, isWin, isBigWin]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('chip');
    setShowDetails(true);
    setSparkleKey((k) => k + 1);

    // Minor gold coin burst on pot interaction
    try {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 18,
        spread: 50,
        startVelocity: 15,
        origin: { x, y },
        colors: isChaotic
          ? ['#C084FC', '#E879F9', '#FFD700', '#F59E0B']
          : ['#FFD700', '#F59E0B', '#FBBF24', '#FDE68A'],
        ticks: 40,
        shapes: ['circle'],
        scalar: 0.8,
      });
    } catch {
      // Safe fallback
    }
  };

  const isShaking = winner === 'PLAYER' || isWin || isBigWin;

  return (
    <div className="relative flex flex-col items-center my-1">
      {/* Outer ambient glow wrapper */}
      <div className="relative group">
        {/* Ambient background blur glow */}
        <div
          className={`absolute -inset-1 rounded-2xl ${
            isChaotic
              ? 'bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-amber-500/30'
              : 'bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20'
          } blur-md transition-opacity duration-500 ${
            isShaking ? 'opacity-100 animate-pulse' : 'opacity-60 group-hover:opacity-90'
          }`}
        />

        {/* Main Sleek Glass Pot Card Button */}
        <motion.button
          type="button"
          key={`${sparkleKey}-${shakeTrigger}`}
          onClick={handleClick}
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.96 }}
          animate={
            isShaking
              ? {
                  x: [0, -7, 7, -5, 5, -3, 3, 0],
                  y: [0, -3, 3, -2, 2, 0],
                  scale: [1, 1.1, 1.06, 1.08, 1.02, 1],
                  boxShadow: isChaotic
                    ? [
                        '0 0 20px rgba(192, 132, 252, 0.4)',
                        '0 0 45px rgba(232, 121, 249, 0.9)',
                        '0 0 25px rgba(251, 191, 36, 0.6)',
                        '0 0 35px rgba(192, 132, 252, 0.8)',
                        '0 0 20px rgba(232, 121, 249, 0.4)',
                      ]
                    : [
                        '0 0 20px rgba(251, 191, 36, 0.4)',
                        '0 0 40px rgba(251, 191, 36, 0.9)',
                        '0 0 25px rgba(251, 191, 36, 0.6)',
                        '0 0 35px rgba(251, 191, 36, 0.8)',
                        '0 0 20px rgba(251, 191, 36, 0.4)',
                      ],
                }
              : {
                  boxShadow: showDetails
                    ? isChaotic
                      ? '0 0 25px rgba(192, 132, 252, 0.5)'
                      : '0 0 25px rgba(251, 191, 36, 0.45)'
                    : '0 4px 20px rgba(0, 0, 0, 0.5), 0 0 15px rgba(245, 158, 11, 0.15)',
                }
          }
          transition={
            isShaking
              ? { duration: 0.65, ease: 'easeInOut' }
              : { duration: 0.2 }
          }
          className={`relative overflow-hidden px-3.5 sm:px-5 py-2 rounded-2xl ${
            isChaotic
              ? 'bg-gradient-to-b from-purple-950/95 via-slate-950/95 to-purple-950/95 border-purple-500/50 hover:border-purple-400/90'
              : 'bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-slate-900/95 border-amber-500/40 hover:border-amber-400/80'
          } backdrop-blur-xl border ${
            isShaking
              ? isChaotic
                ? 'border-purple-300 ring-2 ring-purple-400/80'
                : 'border-amber-300 ring-2 ring-amber-400/80'
              : ''
          } flex flex-col items-center gap-1.5 shadow-xl transition-colors duration-200 cursor-pointer select-none`}
        >
          {/* Subtle light sweep animation */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent pointer-events-none" />

          {/* Top Row: Icon + Header + Pot Value + Info */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Left Icon */}
            <div
              className={`relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${
                isChaotic
                  ? 'bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-purple-800/20 border-purple-400/50 text-purple-300'
                  : 'bg-gradient-to-br from-amber-400/25 via-yellow-500/15 to-amber-600/10 border-amber-400/40 text-amber-300'
              } border shadow-inner shrink-0`}
            >
              {isChaotic ? (
                <Dices
                  className={`w-4.5 h-4.5 sm:w-5 sm:h-5 text-purple-300 ${
                    isShaking ? 'animate-spin' : 'group-hover:rotate-45'
                  } transition-transform duration-300`}
                />
              ) : (
                <Coins
                  className={`w-4.5 h-4.5 sm:w-5 sm:h-5 text-amber-400 ${
                    isShaking ? 'animate-bounce' : 'group-hover:rotate-12'
                  } transition-transform duration-300`}
                />
              )}
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                    isChaotic ? 'bg-purple-400' : 'bg-amber-400'
                  } opacity-75`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isChaotic ? 'bg-purple-400' : 'bg-amber-400'
                  }`}
                />
              </span>
            </div>

            {/* Center Info: Title & Points */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="flex items-center gap-1.5 leading-none">
                <span
                  className={`text-[10px] sm:text-[11px] font-black uppercase tracking-[0.18em] ${
                    isChaotic ? 'text-purple-300' : 'text-amber-300/85'
                  }`}
                >
                  {isChaotic ? (isChaoticRevealed ? t('chaoticRevealed') : t('chaoticPot')) : t('potInPlay')}
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                    isChaotic
                      ? 'bg-purple-500/25 text-purple-200 border border-purple-400/50'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {isChaotic
                    ? isChaoticRevealed
                      ? t('chaoticRevealed')
                      : isEvolved
                      ? '-10k à +10k'
                      : `${chaoticDailyCount}/3 (0-10k)`
                    : '×2'}
                </span>
              </div>

              <div className="flex items-baseline gap-1.5 mt-0.5">
                {isChaotic && !isChaoticRevealed ? (
                  <div className="flex items-center gap-1">
                    <span className="text-lg sm:text-2xl font-black font-mono tracking-tight text-amber-300">
                      {formatCompactNumber(safeBet)}
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-purple-300 font-mono">
                      +
                    </span>
                    <span className="text-lg sm:text-2xl font-black font-mono tracking-tight bg-gradient-to-r from-purple-300 via-pink-300 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(192,132,252,0.6)] animate-pulse">
                      ???
                    </span>
                    <span className="text-xs font-extrabold text-purple-300/80 uppercase tracking-wider font-sans">
                      pts
                    </span>
                  </div>
                ) : (
                  <>
                    <motion.span
                      key={potTotal ?? 0}
                      initial={{ scale: 1.15, color: '#fef08a' }}
                      animate={{
                        scale: 1,
                        color: isChaotic ? '#e879f9' : '#fbbf24',
                      }}
                      transition={{ duration: 0.2 }}
                      className={`text-lg sm:text-2xl font-black font-mono tracking-tight ${
                        isChaotic
                          ? 'bg-gradient-to-r from-purple-100 via-pink-300 to-amber-300'
                          : 'bg-gradient-to-r from-amber-100 via-yellow-300 to-amber-400'
                      } bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(245,158,11,0.35)]`}
                    >
                      {formatCompactNumber(potTotal ?? 0)}
                    </motion.span>
                    <span
                      className={`text-xs font-extrabold ${
                        isChaotic ? 'text-purple-300/80' : 'text-amber-300/80'
                      } uppercase tracking-wider font-sans`}
                    >
                      pts
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Right Action Hint */}
            <div
              className={`flex items-center justify-center w-5.5 h-5.5 rounded-full ${
                isChaotic
                  ? 'bg-purple-500/20 border-purple-400/40 text-purple-300 group-hover:bg-purple-500/30'
                  : 'bg-amber-500/10 border-amber-500/25 text-amber-400/85 group-hover:bg-amber-500/25'
              } border transition-all shrink-0 ml-1`}
            >
              <Info className="w-3 h-3" />
            </div>
          </div>

          {/* Bottom Live Calculator Projection Bar */}
          <div
            className={`flex items-center justify-center gap-2 pt-1 border-t ${
              isChaotic ? 'border-purple-500/30' : 'border-amber-500/20'
            } w-full text-[10px] font-mono font-bold`}
          >
            <div
              className="flex items-center gap-1 text-emerald-300 px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30"
            >
              <TrendingUp className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>
                {isChaotic
                  ? isChaoticRevealed
                    ? `${t('scenarioWin')}: +${netGainIfWin ?? 0}`
                    : `${t('scenarioWin')}: + ???`
                  : `${t('scenarioWin')}: +${safeBet}`}
              </span>
            </div>

            <div
              className="flex items-center gap-1 text-rose-300 px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-500/30"
            >
              <TrendingDown className="w-3 h-3 text-rose-400 shrink-0" />
              <span>{t('scenarioLoss')}: -{netLossIfDefeat}</span>
            </div>
          </div>
        </motion.button>
      </div>

      {/* ULTRA HIGH-CONTRAST MODAL POPUP */}
      <AnimatePresence>
        {showDetails && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetails(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`relative w-full max-w-md ${
                isChaotic
                  ? 'bg-slate-950 border-2 border-purple-500 shadow-[0_0_50px_rgba(168,85,247,0.4)]'
                  : 'bg-slate-950 border-2 border-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.35)]'
              } rounded-3xl p-5 sm:p-6 z-10 text-slate-100 select-none`}
            >
              {/* Top Banner Header */}
              <div
                className={`flex items-center justify-between pb-3.5 border-b ${
                  isChaotic ? 'border-purple-500/30' : 'border-amber-500/30'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-10 h-10 rounded-2xl ${
                      isChaotic
                        ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                        : 'bg-amber-500/20 border-amber-400 text-amber-300'
                    } border flex items-center justify-center`}
                  >
                    {isChaotic ? <Dices className="w-5 h-5" /> : <Calculator className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3
                      className={`text-base sm:text-lg font-black ${
                        isChaotic ? 'text-purple-300' : 'text-amber-300'
                      } uppercase tracking-wide flex items-center gap-1.5`}
                    >
                      {isChaotic ? t('chaoticVariantTitle') : t('calculatorTitle')}
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-black ${
                          isChaotic
                            ? 'bg-purple-400 text-slate-950'
                            : 'bg-amber-400 text-slate-950'
                        }`}
                      >
                        {isChaotic ? (isEvolved ? '-10k à +10k pts' : '0 - 10 000 pts') : '×2'}
                      </span>
                    </h3>
                    <p
                      className={`text-xs ${
                        isChaotic ? 'text-purple-200/70' : 'text-amber-200/70'
                      } font-medium`}
                    >
                      {isChaotic
                        ? isEvolved
                          ? 'Mise adverse étendue (-10 000 à +10 000 pts)'
                          : `Mise adverse secrète (${chaoticDailyCount}/3)`
                        : t('calculatorSubtitle')}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDetails(false)}
                  className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-600 transition-colors cursor-pointer"
                  title={t('closeButton')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Central Big Pot Summary Badge */}
              <div
                className={`my-4 p-3.5 rounded-2xl ${
                  isChaotic
                    ? 'bg-gradient-to-r from-purple-950/60 via-purple-900/40 to-purple-950/60 border border-purple-500/40'
                    : 'bg-gradient-to-r from-amber-950/60 via-amber-900/40 to-amber-950/60 border border-amber-500/40'
                } flex items-center justify-between`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl ${
                      isChaotic
                        ? 'bg-gradient-to-br from-purple-400 to-pink-500 text-slate-950'
                        : 'bg-amber-400 text-slate-950'
                    } flex items-center justify-center font-black shadow-lg`}
                  >
                    {isChaotic ? <Dices className="w-6 h-6" /> : <Coins className="w-6 h-6" />}
                  </div>
                  <div>
                    <span
                      className={`text-xs font-black uppercase ${
                        isChaotic ? 'text-purple-300/80' : 'text-amber-300/80'
                      } tracking-wider`}
                    >
                      {t('totalPotInPlay')}
                    </span>
                    <div
                      className={`text-2xl sm:text-3xl font-black font-mono ${
                        isChaotic ? 'text-purple-200' : 'text-amber-300'
                      }`}
                    >
                      {isChaotic && !isChaoticRevealed ? (
                        <span className="flex items-center gap-1.5">
                          <span>{safeBet}</span>
                          <span className="text-purple-400">+</span>
                          <span className="text-pink-400 animate-pulse">???</span>
                          <span className="text-sm font-sans font-bold text-purple-300">pts</span>
                        </span>
                      ) : (
                        <>
                          {potTotal}{' '}
                          <span
                            className={`text-sm ${
                              isChaotic ? 'text-purple-300' : 'text-amber-400'
                            } font-sans`}
                          >
                            Points
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div
                  className={`text-right text-xs font-bold ${
                    isChaotic
                      ? 'text-purple-200 bg-purple-950/80 border-purple-500/40'
                      : 'text-amber-200/90 bg-amber-950/80 border-amber-500/30'
                  } px-2.5 py-1.5 rounded-xl border`}
                >
                  {isChaotic
                    ? isChaoticRevealed
                      ? t('chaoticRevealed')
                      : isEvolved
                      ? 'Évolué (-10k à +10k)'
                      : `${chaoticDailyCount}/3`
                    : '× 2'}
                </div>
              </div>

              {/* Breakdown Rows */}
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <span className="flex items-center gap-2 text-slate-200 font-semibold">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_#34d399]" />
                    {t('yourCommittedBet')}:
                  </span>
                  <span className="font-mono font-black text-emerald-400 text-base">
                    +{safeBet} pts
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <span className="flex items-center gap-2 text-slate-200 font-semibold">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        isChaotic ? 'bg-purple-400 shadow-[0_0_8px_#c084fc]' : 'bg-rose-400 shadow-[0_0_8px_#f87171]'
                      } shrink-0`}
                    />
                    {t('botCommittedBet')} ({botName}):
                  </span>
                  <span
                    className={`font-mono font-black text-base ${
                      isChaotic
                        ? isChaoticRevealed
                          ? 'text-purple-300'
                          : 'text-pink-400 animate-pulse'
                        : 'text-rose-400'
                    }`}
                  >
                    {isChaotic
                      ? isChaoticRevealed
                        ? `${(actualBotBet ?? 0) >= 0 ? '+' : ''}${actualBotBet} pts`
                        : isEvolved
                        ? '??? pts (-10k à +10k)'
                        : `??? pts (0 à 10 000)`
                      : `+${safeBet} pts`}
                  </span>
                </div>
              </div>

              {/* 3 Outcome Scenarios Boxes */}
              <div className="mt-4 pt-3.5 border-t border-slate-800 space-y-2">
                <div className="text-xs font-black uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  {t('roundOutcome')}:
                </div>

                {/* Scenario Win */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/70 border-2 border-emerald-500/50 text-emerald-100">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-black text-xs uppercase text-emerald-300">{t('scenarioWin')}</div>
                      <div className="text-[11px] text-emerald-200/80">
                        {t('pocketPotDesc')} ({potTotal ?? safeBet * 2} pts)
                      </div>
                    </div>
                  </div>
                  <div className="font-mono font-black text-emerald-300 text-base">
                    {isChaotic
                      ? isChaoticRevealed
                        ? `+${netGainIfWin} pts`
                        : `+ ???`
                      : `+${netGainIfWin} pts`}
                  </div>
                </div>

                {/* Scenario Defeat */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-950/70 border-2 border-rose-500/50 text-rose-100">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-rose-400 shrink-0" />
                    <div>
                      <div className="font-black text-xs uppercase text-rose-300">{t('scenarioLoss')}</div>
                      <div className="text-[11px] text-rose-200/80">{t('loseBetDesc')}</div>
                    </div>
                  </div>
                  <div className="font-mono font-black text-rose-300 text-base">
                    -{netLossIfDefeat} pts
                  </div>
                </div>

                {/* Scenario Tie */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-700/60 text-slate-300">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="font-bold text-xs uppercase text-slate-200">{t('scenarioTie')}</div>
                      <div className="text-[11px] text-slate-400">{t('tieDesc')}</div>
                    </div>
                  </div>
                  <div className="font-mono font-bold text-amber-300 text-xs">
                    0 pt
                  </div>
                </div>
              </div>

              {/* Close Action Button */}
              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className={`mt-5 w-full py-3 rounded-2xl ${
                  isChaotic
                    ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 text-white shadow-[0_4px_15px_rgba(168,85,247,0.4)]'
                    : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-slate-950 shadow-[0_4px_15px_rgba(245,158,11,0.4)]'
                } font-black text-sm uppercase tracking-wider hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {t('understood')}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
