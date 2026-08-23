/**
 * ALETOREX - Lifetime Statistics & Trophies Modal
 * Enhanced with accurate live progress bars, unlock status, and victory analytics
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Trophy as TrophyIcon,
  BarChart3,
  History,
  Flame,
  Award,
  Shield,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { PlayerStats, RoundSummary, Trophy } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslationKey } from '../utils/i18n';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  history: RoundSummary[];
  trophies: Trophy[];
  playerPoints: number;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  history,
  trophies,
  playerPoints,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'STATS' | 'TROPHIES' | 'HISTORY'>('STATS');

  if (!isOpen) return null;

  const winRate =
    stats.totalRounds > 0 ? Math.round((stats.roundsWon / stats.totalRounds) * 100) : 0;

  const unlockedTrophiesCount = trophies.filter((t) => t.isUnlocked).length;

  // Helper to compute dynamic progress for each trophy
  const getTrophyProgress = (trophyId: string) => {
    switch (trophyId) {
      case 'first_win':
        return { current: Math.min(1, stats.roundsWon), max: 1, label: `${Math.min(1, stats.roundsWon)} / 1` };
      case 'streak_3':
        return { current: Math.min(3, Math.max(stats.currentStreak, stats.bestStreak)), max: 3, label: `${Math.min(3, Math.max(stats.currentStreak, stats.bestStreak))} / 3` };
      case 'streak_7':
        return { current: Math.min(7, Math.max(stats.currentStreak, stats.bestStreak)), max: 7, label: `${Math.min(7, Math.max(stats.currentStreak, stats.bestStreak))} / 7` };
      case 'high_roller':
        return { current: stats.totalPointsBet >= 100 ? 1 : 0, max: 1, label: stats.totalPointsBet >= 100 ? '100+' : '0 / 100' };
      case 'joker_miracle':
        return { current: Math.min(1, stats.jokerWins), max: 1, label: `${Math.min(1, stats.jokerWins)} / 1` };
      case 'bank_500':
        return { current: Math.min(500, playerPoints), max: 500, label: `${playerPoints} / 500` };
      case 'bank_1000':
        return { current: Math.min(1000, playerPoints), max: 1000, label: `${playerPoints} / 1 000` };
      case 'veteran_50':
        return { current: Math.min(50, stats.totalRounds), max: 50, label: `${stats.totalRounds} / 50` };
      default:
        return { current: 0, max: 1, label: '' };
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-500/40 rounded-2xl shadow-2xl p-5 sm:p-6 overflow-hidden max-h-[90vh] flex flex-col text-slate-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <TrophyIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {t('statsTitle')}
                </h3>
                <p className="text-xs text-amber-400 font-medium">
                  {unlockedTrophiesCount}/{trophies.length} {t('unlockedTrophies')} ({Math.round((unlockedTrophiesCount / trophies.length) * 100)}%)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 my-3 p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('STATS')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'STATS'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>{t('tabGlobalStats')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('TROPHIES')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'TROPHIES'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>{t('tabTrophies')} ({unlockedTrophiesCount}/{trophies.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('HISTORY')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'HISTORY'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>{t('tabHistory')}</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="overflow-y-auto pr-1 flex-1 py-1">
            {/* STATS TAB */}
            {activeTab === 'STATS' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">{t('totalRounds')}</div>
                    <div className="text-xl sm:text-2xl font-black text-white mt-0.5">{stats.totalRounds}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-emerald-900/40 text-center">
                    <div className="text-[10px] text-emerald-400 uppercase font-bold">{t('victories')}</div>
                    <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">{stats.roundsWon}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-rose-900/40 text-center">
                    <div className="text-[10px] text-rose-400 uppercase font-bold">{t('defeats')}</div>
                    <div className="text-xl sm:text-2xl font-black text-rose-400 mt-0.5">{stats.roundsLost}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-amber-900/40 text-center">
                    <div className="text-[10px] text-amber-400 uppercase font-bold">{t('winRate')}</div>
                    <div className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5">{winRate}%</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
                    <Flame className="w-6 h-6 text-orange-400" />
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{t('streakRecord')}</div>
                      <div className="text-base font-black text-orange-300">
                        {stats.currentStreak} 🔥 <span className="text-xs text-slate-500">(Max: {stats.bestStreak})</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
                    <TrophyIcon className="w-6 h-6 text-yellow-400" />
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{t('highestPotWon')}</div>
                      <div className="text-base font-black text-yellow-400">
                        {stats.highestSinglePotWon} pts
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
                    <Shield className="w-6 h-6 text-purple-400" />
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{t('jokersUsedStats')}</div>
                      <div className="text-base font-black text-purple-300">
                        {stats.jokersUsed} ✨ <span className="text-xs text-slate-500">({stats.jokerWins} {t('wonTag')})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TROPHIES TAB */}
            {activeTab === 'TROPHIES' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {trophies.map((trophy) => {
                  const prog = getTrophyProgress(trophy.id);
                  const percent = Math.min(100, Math.round((prog.current / prog.max) * 100));
                  const titleKey = `trophy_${trophy.id}_title` as TranslationKey;
                  const descKey = `trophy_${trophy.id}_desc` as TranslationKey;
                  const localizedTitle = t(titleKey) !== titleKey ? t(titleKey) : trophy.title;
                  const localizedDesc = t(descKey) !== descKey ? t(descKey) : trophy.description;

                  return (
                    <div
                      key={trophy.id}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                        trophy.isUnlocked
                          ? 'bg-amber-950/25 border-amber-500/60 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                          : 'bg-slate-950/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl sm:text-3xl shrink-0 p-1.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center">
                          {trophy.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs sm:text-sm font-black truncate ${
                                trophy.isUnlocked ? 'text-amber-300' : 'text-slate-300'
                              }`}
                            >
                              {localizedTitle}
                            </span>
                            {trophy.isUnlocked ? (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-[10px] font-bold text-emerald-300 flex items-center gap-1 shrink-0">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                {t('unlockedTag')}
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-bold text-slate-400 flex items-center gap-1 shrink-0">
                                <Lock className="w-3 h-3 text-slate-500" />
                                {percent}%
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                            {localizedDesc}
                          </p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3 pt-2 border-t border-slate-800/80">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span>{t('progressTag')}</span>
                          <span className="font-mono font-bold text-slate-300">{prog.label}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              trophy.isUnlocked
                                ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                                : 'bg-amber-600/70'
                            }`}
                            style={{ width: `${trophy.isUnlocked ? 100 : percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* HISTORY TAB */}
            {activeTab === 'HISTORY' && (
              <div className="space-y-2">
                {history.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    {t('noHistory')}
                  </div>
                ) : (
                  history.slice().reverse().map((round, idx) => {
                    const isRoundChaotic = Boolean(round.isChaotic);
                    const netPlayerGain = isRoundChaotic
                      ? (round.botBetAmount !== undefined ? round.botBetAmount : Math.max(0, round.potAmount - round.betAmount))
                      : round.betAmount;

                    return (
                      <div
                        key={`history-round-${round.timestamp || ''}-${round.roundNumber}-${idx}`}
                        className={`p-2.5 px-3.5 rounded-xl bg-slate-950 border ${
                          isRoundChaotic ? 'border-purple-500/40 bg-purple-950/20' : 'border-slate-800'
                        } flex items-center justify-between text-xs`}
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] text-slate-500">#{round.roundNumber}</span>
                          <span
                            className={`font-black uppercase px-2 py-0.5 rounded text-[10px] ${
                              round.winner === 'PLAYER'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : round.winner === 'BOT'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            {round.winner === 'PLAYER' ? t('victory') : round.winner === 'BOT' ? t('defeat') : t('tie')}
                          </span>
                          {isRoundChaotic && (
                            <span className="bg-purple-900/60 text-purple-300 border border-purple-500/50 px-1.5 py-0.2 rounded text-[9px] font-bold">
                              🎲 Chaotique ({round.botBetAmount ?? '?'} pts)
                            </span>
                          )}
                          <span className="text-slate-300">
                            {t('you')}: <strong className="text-amber-300">{round.playerCard}</strong> vs Bot: <strong className="text-amber-300">{round.botCard}</strong>
                          </span>
                        </div>
                        <div className="font-extrabold text-right ml-2 shrink-0">
                          <span className={round.winner === 'PLAYER' ? 'text-emerald-400 font-mono' : 'text-slate-400 font-mono'}>
                            {round.winner === 'PLAYER' ? `+${netPlayerGain} pts` : `-${round.betAmount} pts`}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
            >
              {t('closeButton')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
