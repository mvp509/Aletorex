/**
 * ALETOREX - Bank Utilities & Drip & Sink Economy Rules
 */

import { BankState, BankConfig } from '../types';

export const BANK_CONFIG: BankConfig = {
  dripCooldownMs: 60 * 60 * 1000, // 1 heure = 3 600 000 ms
  dripAmount: 50,                 // Recharge passive régulière (+50 points)
  dailyChestMin: 50,              // Récompense min coffre quotidien
  dailyChestMax: 100,             // Récompense max coffre quotidien
  bailoutThreshold: 10,           // Condition de déblocage secours (solde < 10)
  bailoutAmount: 50,              // Montant de sauvetage d'urgence (+50 points)
  maxBankCap: 1000000,            // Plafond élevé
};

export const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const INITIAL_BANK_STATE: BankState = {
  points: 100,
  lastRechargeTimestamp: null,
  hasClaimedDailyChest: false,
  hasClaimedDailyBailout: false,
  lastResetDate: getTodayDateString(),
};

/**
 * Normalise l'état de la banque en vérifiant le passage à minuit (00:00)
 */
export const normalizeBankDailyReset = (state: BankState): BankState => {
  const today = getTodayDateString();
  if (state.lastResetDate !== today) {
    return {
      ...state,
      hasClaimedDailyChest: false,
      hasClaimedDailyBailout: false,
      lastResetDate: today,
    };
  }
  return state;
};

/**
 * Calcule le temps restant avant la prochaine recharge Drip (en ms)
 */
export const getDripRemainingMs = (
  lastRechargeTimestamp: number | null,
  cooldownMs: number = BANK_CONFIG.dripCooldownMs
): number => {
  if (!lastRechargeTimestamp) return 0;
  const elapsed = Date.now() - lastRechargeTimestamp;
  return Math.max(0, cooldownMs - elapsed);
};

/**
 * Formate des millisecondes en texte "MM:SS" ou "X min"
 */
export const formatCooldownTimer = (ms: number): string => {
  if (ms <= 0) return '00:00';
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

/**
 * Calcule le temps restant avant le prochain reset quotidien (Minuit 00:00)
 */
export const getMsUntilMidnight = (): number => {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return tomorrow.getTime() - now.getTime();
};
