/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RotateCcw,
  Sparkles,
  Gift,
  Zap,
  SlidersHorizontal,
  Flame,
  Dices,
  Radio,
  Eye,
  ZapOff,
} from 'lucide-react';
import { useGameEngine } from './hooks/useGameEngine';
import { Header } from './components/Header';
import { CardSquare } from './components/CardSquare';
import { BetControls } from './components/BetControls';
import { JokerControls } from './components/JokerControls';
import { InteractivePot } from './components/InteractivePot';
import { BankModal } from './components/BankModal';
import { RulesModal } from './components/RulesModal';
import { StatsModal } from './components/StatsModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { EditNameModal } from './components/EditNameModal';
import { TrophyToast } from './components/TrophyToast';
import { AutoPlayBar } from './components/AutoPlayBar';
import { LanguageModal } from './components/LanguageModal';
import { AletorexALogo } from './components/AletorexLogo';
import { setSoundEnabled, getSoundEnabled, playSound } from './utils/audio';
import { BOT_PROFILES } from './utils/botLogic';
import { BotPersonality } from './types';
import { formatCompactNumber } from './utils/formatters';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

function GameContent() {
  const { t, activeLanguage } = useLanguage();
  const {
    // Bank State & Actions
    bankState,
    playerPoints,
    dripRemainingMs,
    isDripReady,
    canClaimDailyChest,
    canClaimDailyBailout,
    claimPeriodicDrip,
    claimDailyChest,
    claimDailyBailout,

    // Match Engine
    playerName,
    updatePlayerName,
    botPoints,
    currentBet,
    isMaxBet,
    stage,
    leftCard,
    rightCard,
    playerCardChoice,
    playerCardValue,
    botCardValue,
    jokersUsedPlayer,
    jokersUsedBot,
    isPlayerJokerReroll,
    isBotJokerReroll,
    jokerPrice,
    maxJokers,
    winner,
    statusMessage,
    roundCount,
    tieCount,
    botPersonality,
    gameSpeed,
    isZeroJokerMode,
    toggleZeroJokerMode,
    isChaoticMode,
    toggleChaoticMode,
    botChaoticBet,
    chaoticDailyCount,
    isChaoticAlertDismissed,
    dismissChaoticAlert,
    isAutoPlayActive,
    autoPlayStrategy,
    toggleAutoPlay,
    changeAutoPlayStrategy,
    stopAutoPlay,
    stats,
    history,
    trophies,
    unlockedTrophyToast,
    dismissTrophyToast,
    isProcessing,
    placeBet,
    selectCard,
    buyPlayerJoker,
    passJoker,
    returnToBetting,
    resetGame,
    changeBotPersonality,
    toggleGameSpeed,
  } = useGameEngine({ language: activeLanguage, t });

  // Modals state
  const [isEditNameOpen, setIsEditNameOpen] = useState(false);
  const [isBankOpen, setIsBankOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [soundActive, setSoundActive] = useState(() => getSoundEnabled());
  const [previewBet, setPreviewBet] = useState<number>(currentBet || 10);

  // Sync preview bet on currentBet change or stage transition
  useEffect(() => {
    if (stage === 'BETTING') {
      setPreviewBet(currentBet || 10);
    }
  }, [stage, currentBet]);

  const displayedBet = stage === 'BETTING' ? (previewBet || currentBet) : currentBet;

  const handleToggleSound = () => {
    const next = !soundActive;
    setSoundActive(next);
    setSoundEnabled(next);
    if (next) playSound('click');
  };

  const currentBot = BOT_PROFILES[botPersonality];
  const botDisplayName =
    botPersonality === 'STANDARD'
      ? t('botTactician')
      : botPersonality === 'AGGRESSIVE'
      ? t('botAggressive')
      : t('botCautious');
  const botDisplayTagline =
    botPersonality === 'STANDARD'
      ? t('botTaglineStandard')
      : botPersonality === 'AGGRESSIVE'
      ? t('botTaglineAggressive')
      : t('botTaglineCautious');

  const isCardRevealed =
    stage === 'REVEALED' ||
    stage === 'BOT_THINKING' ||
    stage === 'JOKER_PHASE' ||
    stage === 'GAME_OVER';

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering when inside inputs/modals
      if (isBankOpen || isRulesOpen || isStatsOpen || isResetConfirmOpen || isEditNameOpen || isLanguageOpen) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (stage === 'SELECTION') {
        if (e.key === 'ArrowLeft' || e.key === '1') {
          selectCard('LEFT');
        } else if (e.key === 'ArrowRight' || e.key === '2') {
          selectCard('RIGHT');
        }
      } else if (stage === 'JOKER_PHASE') {
        if (e.key.toLowerCase() === 'j' || e.key === 'Enter') {
          buyPlayerJoker();
        } else if (e.key.toLowerCase() === 'p' || e.key === 'Escape') {
          passJoker();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stage, selectCard, buyPlayerJoker, passJoker, isBankOpen, isRulesOpen, isStatsOpen, isResetConfirmOpen, isEditNameOpen, isLanguageOpen]);

  const hasBankNotification = isDripReady || canClaimDailyChest || canClaimDailyBailout;

  return (
    <div className="h-screen max-h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* 1. Header (Compact, no-wrap, opponent has ∞ symbol, reset confirmation) */}
      <Header
        playerName={playerName}
        playerPoints={playerPoints}
        botPoints={botPoints}
        botPersonality={botPersonality}
        soundEnabled={soundActive}
        hasBankNotification={hasBankNotification}
        onOpenEditName={() => setIsEditNameOpen(true)}
        onToggleSound={handleToggleSound}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenRewards={() => setIsBankOpen(true)}
        onOpenResetConfirm={() => setIsResetConfirmOpen(true)}
        onOpenLanguage={() => setIsLanguageOpen(true)}
      />

      {/* Real-time Trophy Toast */}
      <TrophyToast trophy={unlockedTrophyToast} onDismiss={dismissTrophyToast} />

      {/* 2. Main Arena (Tablet maxWidth: 650px centered, Mobile full width with Safe Area bottom buffer) */}
      <main className="flex-1 w-full max-w-[650px] mx-auto px-3 py-1.5 sm:px-4 sm:py-2 flex flex-col justify-between items-center overflow-y-auto overflow-x-hidden gap-1.5 sm:gap-2 pb-[calc(env(safe-area-inset-bottom,0px)+20px)]">
        {/* Game Stats & Opponent Selector Ribbon */}
        <div className="w-full flex items-center justify-between gap-2 px-1 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-bold text-[11px]">
              {t('roundNumber')} #{formatCompactNumber(roundCount)}
            </span>
            {tieCount > 0 && (
              <span className="text-[10px] bg-indigo-950/70 border border-indigo-700/60 text-indigo-300 px-2 py-0.5 rounded font-mono font-bold">
                {t('tieBreakerNumber')} #{tieCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
            {/* Speed Toggle */}
            <button
              type="button"
              onClick={toggleGameSpeed}
              className={`px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                gameSpeed === 'FAST'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title={t('gameSpeed')}
            >
              <Zap className="w-3 h-3" />
              <span>{gameSpeed === 'FAST' ? t('speedFast') : t('speedNormal')}</span>
            </button>

            {/* Adversary Profile Selector (Tacticien: 1J/0J, Offensif: 2J, Stratège: 3J) */}
            <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-xl">
              {(['STANDARD', 'AGGRESSIVE', 'CAUTIOUS'] as BotPersonality[]).map((p) => {
                const b = BOT_PROFILES[p];
                const isSelected = botPersonality === p;
                const profileName = p === 'STANDARD' ? t('botTactician') : p === 'AGGRESSIVE' ? t('botAggressive') : t('botCautious');
                const displayedJokers = p === 'STANDARD' && isZeroJokerMode ? 0 : b.maxJokers;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => changeBotPersonality(p)}
                    disabled={stage !== 'BETTING'}
                    className={`px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-purple-900/90 text-purple-200 border border-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.3)]'
                        : 'text-slate-400 hover:text-slate-200'
                    } ${stage !== 'BETTING' ? 'opacity-60 cursor-not-allowed' : ''}`}
                    title={`${profileName} (${displayedJokers} Joker${displayedJokers > 1 ? 's' : ''})`}
                  >
                    <span>{b.avatar}</span>
                    <span className="hidden sm:inline">{profileName}</span>
                    <span className={`text-[9px] px-1 py-0.2 rounded font-mono font-black border ${
                      p === 'STANDARD' && isZeroJokerMode
                        ? 'bg-cyan-950/80 border-cyan-700/60 text-cyan-300'
                        : 'bg-purple-950/80 border-purple-800/60 text-purple-300'
                    }`}>
                      {displayedJokers}J
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Switch Mode Zéro (Mode Tacticien - 0 Joker) */}
            {botPersonality === 'STANDARD' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-xl transition-all ${
                  isZeroJokerMode
                    ? 'bg-gradient-to-r from-cyan-950/90 to-blue-950/80 border border-cyan-500/70 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-900/90 border border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-200">
                  <ZapOff className={`w-3.5 h-3.5 ${isZeroJokerMode ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
                  <span className="hidden xs:inline sm:inline">{t('zeroJokerModeTitle')}</span>
                  {isZeroJokerMode && (
                    <span className="text-[9px] px-1 py-0.2 rounded font-mono font-black bg-cyan-600 text-slate-950 shadow">
                      0J
                    </span>
                  )}
                </div>
                {/* Switch Toggle Component */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={isZeroJokerMode}
                  onClick={toggleZeroJokerMode}
                  disabled={stage !== 'BETTING'}
                  className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isZeroJokerMode ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_8px_#06b6d4]' : 'bg-slate-700'
                  } ${stage !== 'BETTING' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={t('zeroJokerModeTitle')}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      isZeroJokerMode ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </motion.div>
            )}

            {/* Switch Mode Aléatoire / Spectateur (Mode Offensif) */}
            {botPersonality === 'AGGRESSIVE' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-xl transition-all ${
                  isAutoPlayActive
                    ? 'bg-gradient-to-r from-red-950/90 to-amber-950/80 border border-red-500/70 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                    : 'bg-slate-900/90 border border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1 text-[10px] font-bold text-red-200">
                  <Radio className={`w-3.5 h-3.5 ${isAutoPlayActive ? 'text-red-400 animate-pulse' : 'text-slate-400'}`} />
                  <span className="hidden xs:inline sm:inline">{t('randomModeTitle')}</span>
                  {isAutoPlayActive && (
                    <span className="text-[9px] px-1 py-0.2 rounded font-mono font-black bg-red-600 text-white shadow">
                      {autoPlayStrategy === 'LEFT' ? t('spectatorLeft') : autoPlayStrategy === 'RIGHT' ? t('spectatorRight') : t('spectatorRandom')}
                    </span>
                  )}
                </div>
                {/* Switch Toggle Component */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={isAutoPlayActive}
                  onClick={toggleAutoPlay}
                  className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isAutoPlayActive ? 'bg-gradient-to-r from-red-500 to-amber-500 shadow-[0_0_8px_#ef4444]' : 'bg-slate-700'
                  }`}
                  title={t('randomModeTitle')}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      isAutoPlayActive ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </motion.div>
            )}

            {/* Switch Variante Chaotique (Mode Stratège) */}
            {botPersonality === 'CAUTIOUS' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-xl bg-gradient-to-r from-purple-950/80 to-slate-950 border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.25)]"
              >
                <div className="flex items-center gap-1 text-[10px] font-bold text-purple-200">
                  <Dices className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                  <span className="hidden xs:inline sm:inline">{t('chaoticModeTitle')}</span>
                  {isChaoticMode && (
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-mono font-black ${
                        chaoticDailyCount >= 3
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-slate-950'
                          : 'bg-purple-900/80 text-purple-300 border border-purple-700'
                      }`}
                    >
                      {chaoticDailyCount >= 3 ? '-10k/+10k' : `${chaoticDailyCount}/3`}
                    </span>
                  )}
                </div>
                {/* Switch Toggle Component */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={isChaoticMode}
                  onClick={() => {
                    toggleChaoticMode();
                    playSound('click');
                  }}
                  disabled={stage !== 'BETTING'}
                  className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isChaoticMode ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_8px_#c084fc]' : 'bg-slate-700'
                  } ${stage !== 'BETTING' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={t('chaoticModeTitle')}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      isChaoticMode ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Quota Evolution Notification Banner */}
        {botPersonality === 'CAUTIOUS' && isChaoticMode && chaoticDailyCount >= 3 && !isChaoticAlertDismissed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full mb-2 p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-purple-950/95 via-pink-950/90 to-purple-950/95 border-2 border-purple-400/80 shadow-[0_0_20px_rgba(192,132,252,0.35)] flex items-center justify-between gap-3 text-xs backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              {/* Dynamic Chaotic Evolution Logo Emblem */}
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-amber-500 p-0.5 shadow-[0_0_15px_rgba(244,63,94,0.6)] shrink-0 flex items-center justify-center">
                <div className="w-full h-full rounded-[14px] bg-slate-950/80 flex items-center justify-center relative overflow-hidden">
                  <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
                  <Dices className="w-3.5 h-3.5 text-pink-300 absolute -bottom-0.5 -right-0.5 drop-shadow-[0_0_4px_#ec4899]" />
                </div>
              </div>
              <div>
                <div className="font-black text-pink-300 uppercase tracking-wider flex items-center gap-1.5 text-[11px] sm:text-xs">
                  <span>{t('chaoticQuotaEvolutionTitle')}</span>
                </div>
                <div className="text-slate-200 mt-0.5 leading-snug text-[10px] sm:text-xs">
                  {t('chaoticQuotaEvolutionDesc')}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={dismissChaoticAlert}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-slate-950 font-black text-xs uppercase tracking-wider shrink-0 transition-transform active:scale-95 shadow cursor-pointer"
            >
              OK ⚡
            </button>
          </motion.div>
        )}

        {/* Auto-Play / Spectateur Bar (Mode Offensif) */}
        {botPersonality === 'AGGRESSIVE' && (
          <AutoPlayBar
            isAutoPlayActive={isAutoPlayActive}
            strategy={autoPlayStrategy}
            onToggleAutoPlay={toggleAutoPlay}
            onChangeStrategy={changeAutoPlayStrategy}
            onStopAutoPlay={stopAutoPlay}
            stage={stage}
            isProcessing={isProcessing}
            disabled={playerPoints <= 0}
          />
        )}

        {/* Casino Table Surface */}
        <div className="w-full flex-1 relative rounded-2xl table-felt border-2 sm:border-4 border-amber-900/40 p-2.5 sm:p-4 flex flex-col items-center justify-between shadow-2xl overflow-hidden min-h-0">
          {/* Decorative Felt Borders */}
          <div className="absolute inset-2 sm:inset-3 rounded-xl border border-emerald-500/15 pointer-events-none" />

          {/* Top of Table: Bot Profile Indicator & Joker Status */}
          <div className="flex flex-col items-center z-10 shrink-0">
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/85 ${
                botPersonality === 'CAUTIOUS' && isChaoticMode
                  ? 'border-2 border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.35)]'
                  : botPersonality === 'AGGRESSIVE' && isAutoPlayActive
                  ? 'border-2 border-red-500/80 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                  : botPersonality === 'STANDARD' && isZeroJokerMode
                  ? 'border-2 border-cyan-500/80 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                  : 'border border-rose-500/30 shadow-md'
              }`}
            >
              <span className="text-lg">{currentBot.avatar}</span>
              <div className="text-left">
                <div className="text-xs font-extrabold text-rose-300 leading-tight flex items-center gap-1.5">
                  <span>{currentBot.name}</span>
                  {botPersonality === 'STANDARD' && isZeroJokerMode && (
                    <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-cyan-500/30 text-cyan-200 border border-cyan-400/60 font-black flex items-center gap-0.5 shadow-[0_0_8px_rgba(6,182,212,0.3)]">
                      <ZapOff className="w-2.5 h-2.5 text-cyan-300" />
                      {t('zeroJokerModeTitle')}
                    </span>
                  )}
                  {botPersonality === 'CAUTIOUS' && isChaoticMode && (
                    <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/60 font-black flex items-center gap-0.5">
                      <Dices className="w-2.5 h-2.5 text-purple-300" />
                      {chaoticDailyCount >= 3 ? t('chaoticEvolvedTag') : t('chaoticStandardTag')}
                    </span>
                  )}
                  {botPersonality === 'AGGRESSIVE' && isAutoPlayActive && (
                    <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-red-600/40 text-red-200 border border-red-400/60 font-black flex items-center gap-0.5 shadow-[0_0_8px_#ef4444]">
                      <Radio className="w-2.5 h-2.5 text-red-300 animate-pulse" />
                      {t('randomModeTitle')}
                    </span>
                  )}
                </div>
                <div className="text-[9px] text-slate-400">
                  {botPersonality === 'STANDARD' && isZeroJokerMode
                    ? t('zeroJokerBadge')
                    : botPersonality === 'CAUTIOUS' && isChaoticMode
                    ? chaoticDailyCount >= 3
                      ? '(-10 000 .. +10 000 pts)'
                      : `(0 .. 10 000 pts • ${chaoticDailyCount}/3)`
                    : botPersonality === 'AGGRESSIVE' && isAutoPlayActive
                    ? `${t('spectator')} • ${
                        autoPlayStrategy === 'LEFT'
                          ? t('spectatorLeft')
                          : autoPlayStrategy === 'RIGHT'
                          ? t('spectatorRight')
                          : t('spectatorRandom')
                      }`
                    : currentBot.tagline}
                </div>
              </div>
              <div className="flex items-center gap-1 ml-1 pl-2 border-l border-slate-800">
                <span className="text-[9px] text-purple-300 font-bold">Jokers:</span>
                <div className="flex gap-1">
                  {maxJokers === 0 ? (
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-black bg-cyan-950/80 border border-cyan-700/60 text-cyan-300">
                      0 ({t('zeroModeTag')})
                    </span>
                  ) : (
                    Array.from({ length: maxJokers }).map((_, idx) => (
                      <span
                        key={`bot-joker-badge-${idx}`}
                        className={`text-[9px] px-1.5 py-0.2 rounded font-black ${
                          jokersUsedBot >= idx + 1
                            ? 'bg-purple-600 text-white shadow-[0_0_8px_#c084fc]'
                            : 'bg-slate-800 text-slate-600'
                        }`}
                      >
                        {idx + 1}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Center Table: Interactive Pot & Cards */}
          <div className="flex flex-col items-center justify-center my-auto w-full z-10 gap-2">
            {/* Interactive Center Pot with Shake on win and dynamic calculation */}
            <InteractivePot
              currentBet={displayedBet}
              botName={currentBot.name}
              winner={winner}
              isWin={winner === 'PLAYER'}
              isBettingStage={stage === 'BETTING'}
              playerPoints={playerPoints}
              isChaotic={botPersonality === 'CAUTIOUS' && isChaoticMode}
              botChaoticBet={botChaoticBet}
              chaoticDailyCount={chaoticDailyCount}
              stage={stage}
            />

            {/* Cards Arena */}
            <div className="w-full flex items-center justify-center min-h-[125px] sm:min-h-[155px]">
              {/* STAGE: BETTING, DEALING & SELECTION (2 face-down cards) */}
              {(stage === 'BETTING' || stage === 'DEALING' || stage === 'SELECTION') && (
                <div className="flex flex-col items-center gap-2">
                  {stage === 'SELECTION' && botPersonality === 'AGGRESSIVE' && isAutoPlayActive && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="px-3 py-1 rounded-full bg-red-950/90 border border-red-500/70 shadow-[0_0_12px_rgba(239,68,68,0.4)] text-[11px] font-black text-red-200 flex items-center gap-1.5 backdrop-blur-md"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      <span>
                        Auto :{' '}
                        <strong className="text-amber-300">
                          {autoPlayStrategy === 'LEFT'
                            ? t('cardLeft')
                            : autoPlayStrategy === 'RIGHT'
                            ? t('cardRight')
                            : t('spectatorRandom')}
                        </strong>
                      </span>
                    </motion.div>
                  )}
                  <div className="flex items-center justify-center gap-4 sm:gap-8">
                    <CardSquare
                      value={leftCard}
                      isRevealed={false}
                      label={t('cardLeft')}
                      sublabel={stage === 'SELECTION' ? t('clickToChoose') : undefined}
                      disabled={stage === 'BETTING' || stage === 'DEALING' || isProcessing}
                      onClick={() => selectCard('LEFT')}
                    />
                    <CardSquare
                      value={rightCard}
                      isRevealed={false}
                      label={t('cardRight')}
                      sublabel={stage === 'SELECTION' ? t('clickToChoose') : undefined}
                      disabled={stage === 'BETTING' || stage === 'DEALING' || isProcessing}
                      onClick={() => selectCard('RIGHT')}
                    />
                  </div>
                </div>
              )}

              {/* STAGE: REVEALED / JOKER / GAME_OVER (Spatial Left & Right cards) */}
              {isCardRevealed && (
                <div className="flex items-center justify-center gap-3 sm:gap-8">
                  {/* Left Physical Card */}
                  <CardSquare
                    value={leftCard}
                    isRevealed={true}
                    label={
                      playerCardChoice === 'LEFT'
                        ? `${t('cardLeft')} (${playerName || t('you')})`
                        : `${t('cardLeft')} (${currentBot.name})`
                    }
                    owner={playerCardChoice === 'LEFT' ? 'PLAYER' : 'BOT'}
                    isSelected={playerCardChoice === 'LEFT'}
                    isWinningCard={
                      playerCardChoice === 'LEFT' ? winner === 'PLAYER' : winner === 'BOT'
                    }
                    isLosingCard={
                      playerCardChoice === 'LEFT' ? winner === 'BOT' : winner === 'PLAYER'
                    }
                    isJokerRerolled={
                      playerCardChoice === 'LEFT' ? isPlayerJokerReroll : isBotJokerReroll
                    }
                  />

                  {/* VS Indicator */}
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xs sm:text-sm font-black text-amber-400 font-mono px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 shadow-md">
                      VS
                    </span>
                  </div>

                  {/* Right Physical Card */}
                  <CardSquare
                    value={rightCard}
                    isRevealed={true}
                    label={
                      playerCardChoice === 'RIGHT'
                        ? `${t('cardRight')} (${playerName || t('you')})`
                        : `${t('cardRight')} (${currentBot.name})`
                    }
                    owner={playerCardChoice === 'RIGHT' ? 'PLAYER' : 'BOT'}
                    isSelected={playerCardChoice === 'RIGHT'}
                    isWinningCard={
                      playerCardChoice === 'RIGHT' ? winner === 'PLAYER' : winner === 'BOT'
                    }
                    isLosingCard={
                      playerCardChoice === 'RIGHT' ? winner === 'BOT' : winner === 'PLAYER'
                    }
                    isJokerRerolled={
                      playerCardChoice === 'RIGHT' ? isPlayerJokerReroll : isBotJokerReroll
                    }
                  />
                </div>
              )}
            </div>
          </div>

          {/* Bottom Table: Player Joker Indicator & Dynamic Status Banner */}
          <div className="w-full z-10 shrink-0 flex flex-col items-center gap-1">
            {/* Player Jokers counter bar */}
            {isCardRevealed && (
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/80 border border-purple-500/30 text-[11px]">
                <span className="text-purple-300 font-bold">{t('playerJokers')}</span>
                <div className="flex gap-1">
                  {Array.from({ length: maxJokers }).map((_, idx) => (
                    <span
                      key={`player-joker-badge-${idx}`}
                      className={`text-[9px] px-1.5 py-0.2 rounded font-black ${
                        jokersUsedPlayer >= idx + 1
                          ? 'bg-purple-600 text-white shadow-[0_0_8px_#c084fc]'
                          : 'bg-slate-800 text-slate-600'
                      }`}
                    >
                      {idx + 1}
                    </span>
                  ))}
                </div>
                <span className="text-[10px] text-slate-400">
                  ({jokersUsedPlayer}/{maxJokers})
                </span>
              </div>
            )}

            {/* Dynamic Status Banner */}
            <div
              className={`w-full py-1.5 px-3 rounded-xl text-center text-xs font-bold shadow-lg transition-all duration-300 flex items-center justify-center gap-1.5 ${
                winner === 'PLAYER'
                  ? 'bg-emerald-950/95 border border-emerald-500 text-emerald-200'
                  : winner === 'BOT'
                  ? 'bg-rose-950/95 border border-rose-500 text-rose-200'
                  : stage === 'JOKER_PHASE'
                  ? 'bg-purple-950/95 border border-purple-500 text-purple-200'
                  : stage === 'BOT_THINKING'
                  ? 'bg-indigo-950/95 border border-indigo-500 text-indigo-200 animate-pulse'
                  : 'bg-slate-950/85 border border-slate-800 text-slate-300'
              }`}
            >
              <span>{statusMessage}</span>
            </div>
          </div>
        </div>

        {/* 3. Action Controls Floor */}
        <div className="w-full shrink-0">
          <AnimatePresence mode="wait">
            {stage === 'BETTING' && (
              <BetControls
                key="betting-controls"
                playerPoints={playerPoints}
                botPoints={botPoints}
                onPlaceBet={placeBet}
                onBetChange={setPreviewBet}
                disabled={isProcessing}
                botPersonality={botPersonality}
                maxJokers={maxJokers}
                isChaoticMode={isChaoticMode}
                chaoticDailyCount={chaoticDailyCount}
                isChaoticEvolved={botPersonality === 'CAUTIOUS' && isChaoticMode && chaoticDailyCount >= 3}
              />
            )}

            {stage === 'JOKER_PHASE' && (
              <JokerControls
                key="joker-controls"
                jokerPrice={jokerPrice}
                jokersUsedPlayer={jokersUsedPlayer}
                maxJokers={maxJokers}
                playerPoints={playerPoints}
                isMaxBet={isMaxBet}
                onBuyJoker={buyPlayerJoker}
                onPassJoker={passJoker}
                disabled={isProcessing}
              />
            )}

            {stage === 'GAME_OVER' && (
              <motion.div
                key="game-over-controls"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full max-w-xl mx-auto bg-slate-900/95 border border-slate-800 rounded-2xl p-3 sm:p-4 text-center shadow-2xl backdrop-blur-md"
              >
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                  {/* Replay Same Bet */}
                  <button
                    type="button"
                    onClick={() => placeBet(Math.min(currentBet, playerPoints))}
                    disabled={playerPoints <= 0 || isProcessing}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider text-slate-950 bg-gradient-to-r from-emerald-400 via-emerald-300 to-green-500 hover:from-emerald-300 hover:to-green-400 shadow-[0_0_15px_rgba(52,211,153,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RotateCcw className="w-4 h-4 text-slate-950" />
                    <span>{t('replayButton')} ({Math.min(currentBet, playerPoints)} pts)</span>
                  </button>

                  {/* Return to Betting */}
                  <button
                    type="button"
                    onClick={returnToBetting}
                    disabled={isProcessing}
                    className="w-full sm:w-auto py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t('changeBetButton')}</span>
                  </button>
                </div>

                {/* If out of points shortcut */}
                {playerPoints <= 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsBankOpen(true)}
                      className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>{t('bankAndRewards')}</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* 4. Modals */}
      <BankModal
        isOpen={isBankOpen}
        onClose={() => setIsBankOpen(false)}
        bankState={bankState}
        dripRemainingMs={dripRemainingMs}
        isDripReady={isDripReady}
        canClaimDailyChest={canClaimDailyChest}
        canClaimDailyBailout={canClaimDailyBailout}
        onClaimDrip={claimPeriodicDrip}
        onClaimDailyChest={claimDailyChest}
        onClaimDailyBailout={claimDailyBailout}
      />

      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
        history={history}
        trophies={trophies}
        playerPoints={playerPoints}
      />

      <ResetConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirmReset={resetGame}
      />

      <EditNameModal
        isOpen={isEditNameOpen}
        currentName={playerName}
        onSave={updatePlayerName}
        onClose={() => setIsEditNameOpen(false)}
      />

      <LanguageModal
        isOpen={isLanguageOpen}
        onClose={() => setIsLanguageOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <GameContent />
    </LanguageProvider>
  );
}
