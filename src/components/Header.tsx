/**
 * ALETOREX - Compact Game Header with Single Plus (+) Action Hub
 * 
 * - Plus (+) Button opens a unified quick-menu containing:
 *   1. Banque / Trésorerie (with notification dot)
 *   2. Statistiques & Trophées
 *   3. Règles du Jeu & Tarifs
 *   4. Activer / Couper le son
 *   5. Réinitialiser le jeu
 * - No crowned 'A' emblem to save space and avoid extra logos
 * - Lightweight, clean, responsive
 */

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Volume2, VolumeX, BookOpen, Trophy, Coins, RotateCcw, X, User, Globe } from 'lucide-react';
import { BotPersonality } from '../types';
import { BOT_PROFILES } from '../utils/botLogic';
import { AletorexALogo } from './AletorexLogo';
import { useLanguage } from '../contexts/LanguageContext';
import { LANGUAGE_OPTIONS } from '../utils/i18n';

interface HeaderProps {
  playerName: string;
  playerPoints: number;
  botPoints: number;
  botPersonality: BotPersonality;
  soundEnabled: boolean;
  hasBankNotification?: boolean;
  onOpenEditName: () => void;
  onToggleSound: () => void;
  onOpenRules: () => void;
  onOpenStats: () => void;
  onOpenRewards: () => void;
  onOpenLanguage: () => void;
  onOpenResetConfirm: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  playerName,
  playerPoints,
  botPersonality,
  soundEnabled,
  hasBankNotification = false,
  onOpenEditName,
  onToggleSound,
  onOpenRules,
  onOpenStats,
  onOpenRewards,
  onOpenLanguage,
  onOpenResetConfirm,
}) => {
  const { t, languageSetting, activeLanguage } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const botInfo = BOT_PROFILES[botPersonality];
  const formattedPlayerPoints = Number.isInteger(playerPoints)
    ? playerPoints.toString()
    : playerPoints.toFixed(1);

  // Find current language option flag/label
  const currentLanguageOption = LANGUAGE_OPTIONS.find((opt) => opt.code === languageSetting) || LANGUAGE_OPTIONS[0];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-4 py-2 sticky top-0 z-30 shadow-lg shrink-0">
      <div className="max-w-[650px] mx-auto flex items-center justify-between gap-2">
        {/* Left: Clean Brand Name with Golden 'A' Logo */}
        <div className="flex items-center gap-1.5">
          <AletorexALogo size={20} withGlow />
          <h1 className="text-sm sm:text-base font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 font-mono">
            ALETOREX
          </h1>
        </div>

        {/* Center: Badges (Player Points & Opponent Identity) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Player Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
            <div className="text-left">
              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider max-w-[80px] truncate">
                {playerName || t('you')}
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-emerald-400 flex items-center gap-0.5 leading-tight">
                <span>{formattedPlayerPoints}</span>
                <span className="text-[9px] text-amber-300">✦</span>
              </div>
            </div>
          </div>

          {/* VS Divider */}
          <span className="text-[10px] font-black text-slate-500 px-0.5 font-mono">VS</span>

          {/* Opponent Badge (Sans solde) */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.15)]">
            <span className="text-sm">{botInfo.avatar}</span>
            <div className="text-left">
              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                {t('opponent')}
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-rose-300 leading-tight">
                {botInfo.name}
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_6px_#f43f5e]" />
          </div>
        </div>

        {/* Right: Unified Single (+) Menu Hub */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className={`relative p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center border active:scale-95 ${
              isMenuOpen
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-amber-400/50'
            }`}
            title={t('quickMenu')}
            aria-label={t('quickMenu')}
          >
            {isMenuOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}

            {/* Notification Badge (Solid, non-blinking indicator) */}
            {hasBankNotification && !isMenuOpen && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 border border-slate-950" />
            )}
          </button>

          {/* Unified Dropdown Modal Hub */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 py-1 mb-1 border-b border-slate-800/80">
                {t('quickMenu')}
              </div>

              {/* 1. Banque */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenRewards();
                }}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-amber-400/15 hover:text-amber-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>{t('bankAndRewards')}</span>
                </div>
                {hasBankNotification && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                )}
              </button>

              {/* 2. Modifier le nom */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenEditName();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-amber-300 transition-colors cursor-pointer"
              >
                <User className="w-4 h-4 text-purple-400" />
                <span>{t('editMyName')}</span>
              </button>

              {/* 3. Trophées & Stats */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenStats();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-amber-300 transition-colors cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>{t('statsAndTrophies')}</span>
              </button>

              {/* 4. Règles */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenRules();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-amber-300 transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>{t('gameRules')}</span>
              </button>

              {/* 5. Langue */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenLanguage();
                }}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-amber-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>{t('language')}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300">
                  <span>{currentLanguageOption.flag}</span>
                  <span className="font-mono">{currentLanguageOption.code.toUpperCase()}</span>
                </div>
              </button>

              {/* 6. Son */}
              <button
                type="button"
                onClick={() => {
                  onToggleSound();
                }}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-emerald-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-500" />
                  )}
                  <span>{t('soundEffects')}</span>
                </div>
                <span className={`text-[10px] ${soundEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {soundEnabled ? t('soundOn') : t('soundOff')}
                </span>
              </button>

              <div className="h-[1px] bg-slate-800/80 my-1" />

              {/* 7. Réinitialisation */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenResetConfirm();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-rose-400" />
                <span>{t('resetGame')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
