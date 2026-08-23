/**
 * ALETOREX - Bank & Treasury Modal Component
 * - Recharge périodique (1 heure cooldown, +50 points) avec compte à rebours dynamique MM:SS
 * - Coffre quotidien mystère (50 à 100 points, reset à 00:00)
 * - Secours d'urgence (+50 points si solde < 10)
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Gift,
  Sparkles,
  Clock,
  CheckCircle2,
  LifeBuoy,
  Lock,
  Coins,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BankState } from '../types';
import { BANK_CONFIG, formatCooldownTimer } from '../utils/bankLogic';
import { playSound } from '../utils/audio';
import { useLanguage } from '../contexts/LanguageContext';

interface BankModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankState: BankState;
  dripRemainingMs: number;
  isDripReady: boolean;
  canClaimDailyChest: boolean;
  canClaimDailyBailout: boolean;
  onClaimDrip: () => { success: boolean; amount: number; message: string };
  onClaimDailyChest: () => { success: boolean; amount: number; message: string };
  onClaimDailyBailout: () => { success: boolean; amount: number; message: string };
}

export const BankModal: React.FC<BankModalProps> = ({
  isOpen,
  onClose,
  bankState,
  dripRemainingMs,
  isDripReady,
  canClaimDailyChest,
  canClaimDailyBailout,
  onClaimDrip,
  onClaimDailyChest,
  onClaimDailyBailout,
}) => {
  const { t } = useLanguage();
  const [notification, setNotification] = useState<string | null>(null);
  const [isOpeningChest, setIsOpeningChest] = useState(false);

  if (!isOpen) return null;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 55,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#6366F1', '#EC4899', '#3B82F6'],
      });
    } catch {
      // Confetti fallback safe
    }
  };

  const handleDrip = () => {
    const res = onClaimDrip();
    if (res.success) {
      triggerConfetti();
      setNotification(res.message);
      setTimeout(() => setNotification(null), 3500);
    }
  };

  const handleChest = () => {
    if (isOpeningChest || !canClaimDailyChest) return;
    setIsOpeningChest(true);
    playSound('joker');

    setTimeout(() => {
      const res = onClaimDailyChest();
      setIsOpeningChest(false);
      if (res.success) {
        triggerConfetti();
        setNotification(res.message);
        setTimeout(() => setNotification(null), 4000);
      }
    }, 700);
  };

  const handleBailout = () => {
    const res = onClaimDailyBailout();
    if (res.success) {
      triggerConfetti();
      setNotification(res.message);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          className="relative w-full max-w-xl bg-slate-900 border-2 border-amber-500/40 rounded-3xl shadow-2xl p-5 sm:p-6 overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {t('bankTitle')}
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  {t('bankSubtitle')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Solde Bar */}
          <div className="my-3.5 p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-bold block">
                {t('bankBalance')}
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 flex items-center gap-1.5">
                <span>{bankState.points}</span>
                <span className="text-xs font-bold text-amber-400">pts</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] sm:text-xs text-slate-400 block font-medium">00:00 Daily Reset</span>
            </div>
          </div>

          {/* Toast Notification */}
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 p-2.5 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-md"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{notification}</span>
            </motion.div>
          )}

          {/* Reward Cards */}
          <div className="space-y-3 overflow-y-auto pr-1 flex-1 py-1">
            {/* 1. Timed Periodic Drip (1h cooldown, +50 pts) */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-white">{t('bankDripRecharge')}</span>
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                      +{BANK_CONFIG.dripAmount} pts
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {isDripReady ? (
                      <span className="text-emerald-400 font-semibold">{t('bankReady')}</span>
                    ) : (
                      <span className="flex items-center gap-1 font-mono text-amber-300">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        {t('bankAvailableIn')} {formatCooldownTimer(dripRemainingMs)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDrip}
                disabled={!isDripReady}
                className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md ${
                  isDripReady
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                }`}
              >
                {isDripReady ? (
                  <>
                    <Gift className="w-3.5 h-3.5" />
                    <span>{t('bankClaim')} (+{BANK_CONFIG.dripAmount})</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>{formatCooldownTimer(dripRemainingMs)}</span>
                  </>
                )}
              </button>
            </div>

            {/* 2. Daily Mystery Chest (50 to 100 pts, 00:00 Reset) */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-purple-950/20 to-slate-900 border border-purple-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-purple-200">{t('bankDailyChest')}</span>
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-purple-950 border border-purple-500/40 text-purple-300">
                      50 à 100 pts
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {canClaimDailyChest ? (
                      <span className="text-purple-300 font-semibold">{t('bankDailyChestDesc')}</span>
                    ) : (
                      <span className="text-slate-500">{t('bankClaimedToday')}</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleChest}
                disabled={!canClaimDailyChest || isOpeningChest}
                className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md ${
                  canClaimDailyChest
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white active:scale-95 shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                }`}
              >
                {canClaimDailyChest ? (
                  <>
                    <Gift className="w-3.5 h-3.5" />
                    <span>{isOpeningChest ? '...' : t('bankClaim')}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t('bankClaimedToday')}</span>
                  </>
                )}
              </button>
            </div>

            {/* 3. Emergency Bailout (< 10 pts & Daily) */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-rose-950/15 to-slate-900 border border-rose-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-rose-200">{t('bankBailout')}</span>
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-950 border border-rose-500/40 text-rose-300">
                      +{BANK_CONFIG.bailoutAmount} pts
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {bankState.points >= BANK_CONFIG.bailoutThreshold ? (
                      <span>{t('bankNeedLowBalance')}</span>
                    ) : canClaimDailyBailout ? (
                      <span className="text-rose-400 font-semibold animate-pulse">
                        {t('bankBailoutDesc')}
                      </span>
                    ) : (
                      <span className="text-slate-500">{t('bankClaimedToday')}</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleBailout}
                disabled={!canClaimDailyBailout}
                className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md ${
                  canClaimDailyBailout
                    ? 'bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 active:scale-95 shadow-[0_0_15px_rgba(244,63,94,0.4)] cursor-pointer'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                }`}
              >
                {canClaimDailyBailout ? (
                  <>
                    <LifeBuoy className="w-3.5 h-3.5" />
                    <span>{t('bankClaim')} (+{BANK_CONFIG.bailoutAmount})</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>{t('statsLocked')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
