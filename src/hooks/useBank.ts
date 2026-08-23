/**
 * ALETOREX - Bank State Management Hook
 * Implements strict "Drip & Sink" economy:
 * - Timed periodic drip (+25 pts / 15min)
 * - Daily mystery chest (reset at 00:00)
 * - Daily emergency bailout (available when points < 10, reset at 00:00)
 * - Sinks integration (bets, jokers)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { BankState, BankConfig } from '../types';
import {
  BANK_CONFIG,
  INITIAL_BANK_STATE,
  normalizeBankDailyReset,
  getDripRemainingMs,
} from '../utils/bankLogic';
import { playSound } from '../utils/audio';

const BANK_STORAGE_KEY = 'aletorex_bank_state_v2';
const LEGACY_POINTS_KEY = 'aletorex_player_points_v1';

export const getStoredBankState = (): BankState => {
  try {
    const raw = localStorage.getItem(BANK_STORAGE_KEY);
    if (raw) {
      const parsed: BankState = JSON.parse(raw);
      return normalizeBankDailyReset(parsed);
    }
    // Check legacy storage for backward compatibility
    const legacyPts = localStorage.getItem(LEGACY_POINTS_KEY);
    if (legacyPts !== null) {
      const pts = parseInt(legacyPts, 10);
      if (!isNaN(pts) && pts >= 0) {
        return {
          ...INITIAL_BANK_STATE,
          points: pts,
        };
      }
    }
  } catch (err) {
    console.warn('Error reading bank state from storage', err);
  }
  return INITIAL_BANK_STATE;
};

export const saveStoredBankState = (state: BankState): void => {
  try {
    localStorage.setItem(BANK_STORAGE_KEY, JSON.stringify(state));
    // Keep legacy key synced
    localStorage.setItem(LEGACY_POINTS_KEY, state.points.toString());
  } catch (err) {
    console.warn('Error saving bank state to storage', err);
  }
};

export const useBank = (config: BankConfig = BANK_CONFIG) => {
  const [bankState, setBankState] = useState<BankState>(() => getStoredBankState());
  const [dripRemainingMs, setDripRemainingMs] = useState<number>(() =>
    getDripRemainingMs(bankState.lastRechargeTimestamp, config.dripCooldownMs)
  );

  // Sync ref
  const stateRef = useRef(bankState);
  useEffect(() => {
    stateRef.current = bankState;
  }, [bankState]);

  // Daily reset check & periodic timer tick
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Check daily rollover at 00:00
      setBankState((prev) => {
        const normalized = normalizeBankDailyReset(prev);
        if (normalized !== prev) {
          saveStoredBankState(normalized);
          return normalized;
        }
        return prev;
      });

      // 2. Update drip cooldown timer
      const remaining = getDripRemainingMs(
        stateRef.current.lastRechargeTimestamp,
        config.dripCooldownMs
      );
      setDripRemainingMs(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [config.dripCooldownMs]);

  /**
   * Modifier les points (Gains de manche, paris, jokers - Puits & Drips)
   */
  const updatePoints = useCallback((updater: number | ((prevPoints: number) => number)) => {
    setBankState((prev) => {
      const currentPts = prev.points;
      const nextPts = typeof updater === 'function' ? updater(currentPts) : updater;
      const clampedPts = Math.max(0, Math.min(config.maxBankCap, nextPts));

      const updatedState: BankState = {
        ...prev,
        points: clampedPts,
      };
      saveStoredBankState(updatedState);
      return updatedState;
    });
  }, [config.maxBankCap]);

  /**
   * 1. Action: Réclamer la recharge périodique Drip (+25 pts toutes les 15 min)
   */
  const claimPeriodicDrip = useCallback((): { success: boolean; amount: number; message: string } => {
    const remaining = getDripRemainingMs(
      stateRef.current.lastRechargeTimestamp,
      config.dripCooldownMs
    );

    if (remaining > 0) {
      playSound('error');
      return {
        success: false,
        amount: 0,
        message: 'La recharge périodique est encore en cours de rechargement.',
      };
    }

    const now = Date.now();
    const amount = config.dripAmount;

    setBankState((prev) => {
      const updatedState: BankState = {
        ...prev,
        points: Math.min(config.maxBankCap, prev.points + amount),
        lastRechargeTimestamp: now,
      };
      saveStoredBankState(updatedState);
      return updatedState;
    });

    setDripRemainingMs(config.dripCooldownMs);
    playSound('reward');

    return {
      success: true,
      amount,
      message: `+${amount} points crédités via la recharge périodique !`,
    };
  }, [config]);

  /**
   * 2. Action: Ouvrir le Coffre Quotidien Mystère (1x / jour, reset à 00:00)
   */
  const claimDailyChest = useCallback((): { success: boolean; amount: number; message: string } => {
    const current = normalizeBankDailyReset(stateRef.current);
    if (current.hasClaimedDailyChest) {
      playSound('error');
      return {
        success: false,
        amount: 0,
        message: 'Vous avez déjà ouvert le coffre mystère aujourd\'hui. Revenez demain à 00:00 !',
      };
    }

    // Calcul du gain aléatoire équilibré entre min et max
    const range = config.dailyChestMax - config.dailyChestMin;
    const reward = config.dailyChestMin + Math.floor(Math.random() * (range + 1));

    setBankState((prev) => {
      const normalized = normalizeBankDailyReset(prev);
      const updatedState: BankState = {
        ...normalized,
        points: Math.min(config.maxBankCap, normalized.points + reward),
        hasClaimedDailyChest: true,
      };
      saveStoredBankState(updatedState);
      return updatedState;
    });

    playSound('reward');
    return {
      success: true,
      amount: reward,
      message: `🎉 Coffre Quotidien Déverrouillé : +${reward} points offerts !`,
    };
  }, [config]);

  /**
   * 3. Action: Réclamer l'Aide d'Urgence / Secours (1x / jour si solde < 10)
   */
  const claimDailyBailout = useCallback((): { success: boolean; amount: number; message: string } => {
    const current = normalizeBankDailyReset(stateRef.current);
    if (current.points >= config.bailoutThreshold) {
      playSound('error');
      return {
        success: false,
        amount: 0,
        message: `L'aide de secours n'est active que si votre solde est inférieur à ${config.bailoutThreshold} points.`,
      };
    }

    if (current.hasClaimedDailyBailout) {
      playSound('error');
      return {
        success: false,
        amount: 0,
        message: 'L\'aide de secours quotidienne a déjà été utilisée aujourd\'hui.',
      };
    }

    const amount = config.bailoutAmount;
    setBankState((prev) => {
      const normalized = normalizeBankDailyReset(prev);
      const updatedState: BankState = {
        ...normalized,
        points: Math.min(config.maxBankCap, normalized.points + amount),
        hasClaimedDailyBailout: true,
      };
      saveStoredBankState(updatedState);
      return updatedState;
    });

    playSound('reward');
    return {
      success: true,
      amount,
      message: `🛡️ Secours d'Urgence activé : +${amount} points pour vous relancer dans la partie !`,
    };
  }, [config]);

  /**
   * Réinitialisation de la banque
   */
  const resetBank = useCallback((initialPoints = 100) => {
    const fresh: BankState = {
      points: initialPoints,
      lastRechargeTimestamp: null,
      hasClaimedDailyChest: false,
      hasClaimedDailyBailout: false,
      lastResetDate: normalizeBankDailyReset(INITIAL_BANK_STATE).lastResetDate,
    };
    setBankState(fresh);
    saveStoredBankState(fresh);
    setDripRemainingMs(0);
  }, []);

  return {
    bankState,
    points: bankState.points,
    dripRemainingMs,
    isDripReady: dripRemainingMs <= 0,
    canClaimDailyChest: !bankState.hasClaimedDailyChest,
    canClaimDailyBailout:
      !bankState.hasClaimedDailyBailout && bankState.points < config.bailoutThreshold,
    updatePoints,
    claimPeriodicDrip,
    claimDailyChest,
    claimDailyBailout,
    resetBank,
  };
};
