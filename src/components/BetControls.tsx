/**
 * ALETOREX - Betting Controls Component (Mobile & Tablet Ergonomics)
 * - Boutons de mise rapide : 5 | 10 | 25 | 50 (Flex wrap tactile)
 * - Ajustements fins alignés : [-1] | [Input Clavier Numérique] | [+1] | [All solde]
 * - Saisie directe avec clavier numérique mobile (inputMode="numeric", pattern="[0-9]*")
 * - Bouton d'action principal 90% de largeur, centré avec marge de sécurité
 * - Tarif Joker : 50% de la mise
 * - Bonus Mise Maximale : 2 Jokers offerts (0 pt)
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Coins, Sparkles, AlertCircle, Zap, Dices, ZapOff } from 'lucide-react';
import { calculateJokerPrice, getMaxJokersForPersonality } from '../utils/botLogic';
import { playSound } from '../utils/audio';
import { BotPersonality } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface BetControlsProps {
  playerPoints: number;
  botPoints: number;
  onPlaceBet: (amount: number) => void;
  onBetChange?: (amount: number) => void;
  disabled: boolean;
  botPersonality?: BotPersonality;
  maxJokers?: number;
  isChaoticMode?: boolean;
  chaoticDailyCount?: number;
  isChaoticEvolved?: boolean;
}

const PRESET_BETS = [5, 10, 25, 50];

export const BetControls: React.FC<BetControlsProps> = ({
  playerPoints,
  onPlaceBet,
  onBetChange,
  disabled,
  botPersonality = 'STANDARD',
  maxJokers,
  isChaoticMode = false,
  chaoticDailyCount = 0,
  isChaoticEvolved = false,
}) => {
  const { t, activeLanguage } = useLanguage();
  const maxPossibleBet = Math.max(0, playerPoints);
  const [selectedBet, setSelectedBet] = useState<number>(() =>
    Math.min(10, Math.max(1, maxPossibleBet))
  );
  const [inputValue, setInputValue] = useState<string>(() =>
    Math.min(10, Math.max(1, maxPossibleBet)).toString()
  );

  // Notify parent on bet change
  useEffect(() => {
    onBetChange?.(selectedBet);
  }, [selectedBet, onBetChange]);

  // Keep selected bet within player balance
  useEffect(() => {
    if (selectedBet > maxPossibleBet && maxPossibleBet > 0) {
      setSelectedBet(maxPossibleBet);
      setInputValue(maxPossibleBet.toString());
      onBetChange?.(maxPossibleBet);
    } else if (selectedBet === 0 && maxPossibleBet > 0) {
      const initial = Math.min(10, maxPossibleBet);
      setSelectedBet(initial);
      setInputValue(initial.toString());
      onBetChange?.(initial);
    }
  }, [maxPossibleBet, selectedBet, onBetChange]);

  const handleSelectPreset = (amount: number) => {
    if (disabled || amount > maxPossibleBet) return;
    playSound('chip');
    setSelectedBet(amount);
    setInputValue(amount.toString());
    onBetChange?.(amount);
  };

  const handleAllSolde = () => {
    if (disabled || maxPossibleBet <= 0) return;
    playSound('chip');
    setSelectedBet(maxPossibleBet);
    setInputValue(maxPossibleBet.toString());
    onBetChange?.(maxPossibleBet);
  };

  const handleAdjust = (delta: number) => {
    if (disabled) return;
    const newVal = Math.max(1, Math.min(maxPossibleBet, selectedBet + delta));
    playSound('chip');
    setSelectedBet(newVal);
    setInputValue(newVal.toString());
    onBetChange?.(newVal);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setInputValue(raw);

    if (raw === '') return;
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed) && parsed > 0) {
      const clamped = Math.min(maxPossibleBet, parsed);
      setSelectedBet(clamped);
      onBetChange?.(clamped);
    }
  };

  const handleInputBlur = () => {
    if (inputValue === '' || parseInt(inputValue, 10) <= 0) {
      const fallback = Math.min(10, Math.max(1, maxPossibleBet));
      setSelectedBet(fallback);
      setInputValue(fallback.toString());
      onBetChange?.(fallback);
    } else {
      const parsed = parseInt(inputValue, 10);
      const clamped = Math.max(1, Math.min(maxPossibleBet, parsed));
      setSelectedBet(clamped);
      setInputValue(clamped.toString());
      onBetChange?.(clamped);
    }
  };

  const handleValidate = () => {
    const finalAmt = Math.max(1, Math.min(maxPossibleBet, selectedBet));
    if (disabled || finalAmt <= 0 || finalAmt > playerPoints) {
      playSound('error');
      return;
    }
    playSound('chip');
    onPlaceBet(finalAmt);
  };

  const isMax = selectedBet === maxPossibleBet && maxPossibleBet > 0;
  const freeJokersCount = maxJokers || getMaxJokersForPersonality(botPersonality);
  const estimatedJokerPrice = calculateJokerPrice(selectedBet, isMax);
  const remainingPointsAfterBet = playerPoints - selectedBet;

  // Logique du badge Tarif Joker :
  // - En All-In (isMax) : réapparaît en mode GRATUIT avec le nombre de jokers offerts (1 Tacticien, 2 Offensif, 3 Stratège)
  // - En mise normale : apparaît UNIQUEMENT si le solde restant après mise permet d'acheter au moins 1 joker payant
  const showJokerBadge =
    isMax ||
    (playerPoints > 0 &&
      remainingPointsAfterBet >= estimatedJokerPrice &&
      estimatedJokerPrice > 0);
  const isOutOfPoints = playerPoints <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[650px] mx-auto bg-slate-900/95 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-md"
    >
      {/* Title & Joker Pricing Indicator */}
      <div className="flex items-center justify-between gap-2 mb-2 text-xs sm:text-sm">
        <div className="flex items-center gap-1.5 font-extrabold text-slate-200">
          <Coins className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{t('chooseYourBet')}</span>
        </div>

        {freeJokersCount === 0 ? (
          <div className="flex items-center gap-1 text-[11px] sm:text-xs px-2.5 py-1 rounded-full font-bold bg-cyan-950/70 text-cyan-300 border border-cyan-700/60 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            <ZapOff className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{t('zeroJokerBadge')}</span>
          </div>
        ) : showJokerBadge && (
          <div
            className={`flex items-center gap-1 text-[11px] sm:text-xs px-2.5 py-1 rounded-full font-bold transition-all ${
              isMax
                ? 'bg-purple-900/80 text-purple-200 border border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.35)] animate-pulse'
                : 'bg-purple-950/60 text-purple-300 border border-purple-800/60 shadow-[0_0_10px_rgba(168,85,247,0.15)]'
            }`}
          >
            <Sparkles
              className={`w-3.5 h-3.5 ${
                isMax ? 'text-yellow-300' : 'text-purple-400'
              } shrink-0`}
            />
            <span>
              {t('jokerRate')}{' '}
              <strong className={isMax ? 'text-emerald-300' : 'text-amber-300'}>
                {isMax
                  ? `${t('freeJokerTag')} (${freeJokersCount} ${freeJokersCount > 1 ? t('freeJokersOfferedPlural') : t('freeJokersOffered')})`
                  : `${estimatedJokerPrice} pt${estimatedJokerPrice > 1 ? 's' : ''}`}
              </strong>
            </span>
          </div>
        )}
      </div>

      {isOutOfPoints ? (
        <div className="bg-rose-950/40 border border-rose-800/80 rounded-xl p-3 text-center my-1 text-rose-300 text-xs sm:text-sm flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{t('insufficientBalance')}</span>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Quick Chip Presets: 5 | 10 | 25 | 50 (Flexbox Wrap / Multi-devices) */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {PRESET_BETS.map((amount) => {
              const isSelected = selectedBet === amount;
              const isTooHigh = amount > maxPossibleBet;

              return (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleSelectPreset(amount)}
                  disabled={disabled || isTooHigh}
                  className={`py-2 px-2 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-0.5 border active:scale-95 ${
                    isSelected
                      ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.35)] scale-[1.02]'
                      : isTooHigh
                      ? 'bg-slate-950/40 text-slate-600 border-slate-800/60 cursor-not-allowed opacity-40'
                      : 'bg-slate-950 text-slate-200 border-slate-800 hover:border-amber-400/60 hover:text-amber-300 hover:bg-slate-900'
                  }`}
                >
                  <span>{amount}</span>
                  <span className="text-[10px] font-medium opacity-80">pts</span>
                </button>
              );
            })}
          </div>

          {/* Stepper Row & Numeric Input */}
          <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-2 sm:p-2.5 space-y-1">
            <div className="flex items-center justify-between px-1 text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>{t('yourBet')}</span>
              {isMax && (
                <span className="text-emerald-400 font-extrabold text-[10px] flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                  {t('allIn')} (Max)
                </span>
              )}
            </div>

            {/* Stepper Row: [-1] | [Input] | [+1] | [All solde] */}
            <div className="flex items-center gap-1.5 sm:gap-2 h-10 sm:h-11">
              <button
                type="button"
                onClick={() => handleAdjust(-1)}
                disabled={disabled || selectedBet <= 1}
                className="w-11 sm:w-13 h-full rounded-xl bg-slate-850 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 font-black text-xs flex items-center justify-center cursor-pointer transition-all border border-slate-700 active:scale-95 shrink-0"
                title="-1 pt"
              >
                -1
              </button>

              <div className="flex-1 h-full relative flex items-center justify-center bg-slate-900 border border-slate-700/80 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/25 rounded-xl px-2 transition-all">
                <input
                  id="bet-input"
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min={1}
                  max={maxPossibleBet}
                  value={inputValue}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  disabled={disabled}
                  aria-label={t('yourBet')}
                  className="w-full text-center text-base sm:text-lg font-black text-amber-400 bg-transparent outline-none font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="10"
                />
                <span className="absolute right-2 text-[10px] text-slate-500 font-bold uppercase pointer-events-none">
                  pts
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleAdjust(1)}
                disabled={disabled || selectedBet >= maxPossibleBet}
                className="w-11 sm:w-13 h-full rounded-xl bg-slate-850 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 font-black text-xs flex items-center justify-center cursor-pointer transition-all border border-slate-700 active:scale-95 shrink-0"
                title="+1 pt"
              >
                +1
              </button>

              <button
                type="button"
                onClick={handleAllSolde}
                disabled={disabled || maxPossibleBet <= 0}
                className={`px-2.5 sm:px-3.5 h-full rounded-xl font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center border active:scale-95 shrink-0 whitespace-nowrap ${
                  isMax
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 border-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.35)]'
                    : 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900 hover:text-emerald-200'
                }`}
                title={t('allIn')}
              >
                {t('allIn')}
              </button>
            </div>
          </div>

          {/* Validation Main CTA: ~90% Width with Safe Margins */}
          <div className="w-full flex justify-center pt-1">
            <button
              type="button"
              onClick={handleValidate}
              disabled={disabled || selectedBet <= 0 || selectedBet > playerPoints}
              className={`w-[92%] sm:w-[90%] py-3 sm:py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider text-slate-950 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                botPersonality === 'CAUTIOUS' && isChaoticMode
                  ? 'shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                  : 'shadow-[0_0_20px_rgba(251,191,36,0.3)]'
              } transition-all flex items-center justify-center gap-2 ${
                isMax
                  ? 'bg-gradient-to-r from-emerald-400 via-amber-300 to-emerald-400 hover:from-emerald-300 hover:to-amber-200 border border-emerald-300'
                  : botPersonality === 'CAUTIOUS' && isChaoticMode
                  ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 hover:from-purple-300 hover:to-pink-300 text-slate-950 border border-purple-300'
                  : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300'
              }`}
            >
              {botPersonality === 'CAUTIOUS' && isChaoticMode ? (
                <Dices className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 shrink-0" />
              ) : (
                <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 shrink-0" />
              )}
              <span>
                {botPersonality === 'CAUTIOUS' && isChaoticMode
                  ? isChaoticEvolved
                    ? `${selectedBet} Pts • Duel (-10k/+10k)`
                    : `${selectedBet} Pts • Chaos [${Math.min(3, chaoticDailyCount + 1)}/3] 🎲`
                  : activeLanguage === 'en'
                  ? `Bet ${selectedBet} Points & Deal`
                  : activeLanguage === 'ht'
                  ? `Mize ${selectedBet} Pwen & Tire`
                  : activeLanguage === 'es'
                  ? `Apostar ${selectedBet} Puntos y Repartir`
                  : `Parier ${selectedBet} Points & Tirer`}
                {isMax && (
                  <span className="ml-1 text-[10px] sm:text-xs text-slate-950 font-bold opacity-90">
                    ({t('allIn')} • {freeJokersCount} Joker{freeJokersCount > 1 ? 's' : ''} {t('freeJokerTag')})
                  </span>
                )}
              </span>
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
