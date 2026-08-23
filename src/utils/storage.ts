/**
 * Persistent Storage Management for ALETOREX (100% Free Solo Game)
 */

import { PlayerStats, RoundSummary, Trophy, AutoPlayStrategy } from '../types';

const STORAGE_KEYS = {
  POINTS: 'aletorex_player_points_v1',
  BOT_POINTS: 'aletorex_bot_points_v1',
  STATS: 'aletorex_player_stats_v1',
  ROUNDS_HISTORY: 'aletorex_rounds_history_v1',
  TROPHIES: 'aletorex_trophies_v1',
  SOUND_ENABLED: 'aletorex_sound_enabled_v1',
  PLAYER_NAME: 'aletorex_player_name_v1',
  CHAOTIC_MODE: 'aletorex_chaotic_mode_v1',
  CHAOTIC_DAILY_COUNT: 'aletorex_chaotic_daily_count_v1',
  CHAOTIC_DAILY_DATE: 'aletorex_chaotic_daily_date_v1',
  CHAOTIC_ALERT_DISMISSED_DATE: 'aletorex_chaotic_alert_dismissed_date_v1',
  AUTOPLAY_ENABLED: 'aletorex_autoplay_enabled_v1',
  AUTOPLAY_STRATEGY: 'aletorex_autoplay_strategy_v1',
  LANGUAGE_SETTING: 'aletorex_language_setting_v1',
};

export const DEFAULT_LANGUAGE_SETTING = 'auto';

export const DEFAULT_STARTING_POINTS = 100;
export const DEFAULT_BOT_POINTS = 100;
export const DEFAULT_PLAYER_NAME = 'VOUS';

export const INITIAL_STATS: PlayerStats = {
  totalRounds: 0,
  roundsWon: 0,
  roundsLost: 0,
  roundsDrawn: 0,
  currentStreak: 0,
  bestStreak: 0,
  totalPointsWon: 0,
  totalPointsBet: 0,
  jokersUsed: 0,
  jokerWins: 0,
  highestSinglePotWon: 0,
  lastDailyRewardTimestamp: 0,
  freeReloadsClaimed: 0,
};

export const INITIAL_TROPHIES: Trophy[] = [
  {
    id: 'first_win',
    title: 'Premier Triomphe',
    description: 'Remportez votre toute première manche d\'ALETOREX',
    icon: '🏆',
    isUnlocked: false,
  },
  {
    id: 'streak_3',
    title: 'En Pleine Passe',
    description: 'Enchaînez 3 victoires d\'affilée',
    icon: '🔥',
    isUnlocked: false,
  },
  {
    id: 'streak_7',
    title: 'Maître Incontesté',
    description: 'Enchaînez 7 victoires d\'affilée',
    icon: '👑',
    isUnlocked: false,
  },
  {
    id: 'high_roller',
    title: 'Gros Joueur',
    description: 'Misez 100 points ou plus en une seule manche',
    icon: '💎',
    isUnlocked: false,
  },
  {
    id: 'joker_miracle',
    title: 'Miracle du Joker',
    description: 'Gagnez une manche après avoir acheté un Joker',
    icon: '✨',
    isUnlocked: false,
  },
  {
    id: 'bank_500',
    title: 'Fortune Émeraude',
    description: 'Atteignez un solde de 500 points',
    icon: '💰',
    isUnlocked: false,
  },
  {
    id: 'bank_1000',
    title: 'Légende Dorée',
    description: 'Atteignez un solde record de 1 000 points',
    icon: '🌟',
    isUnlocked: false,
  },
  {
    id: 'veteran_50',
    title: 'Stratège Vétéran',
    description: 'Disputez 50 manches au total',
    icon: '⚔️',
    isUnlocked: false,
  },
];

export const getStoredPlayerPoints = (): number => {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.POINTS);
    if (val !== null) {
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed) && parsed >= 0) return parsed;
    }
  } catch (err) {
    console.warn('Storage read error for points', err);
  }
  return DEFAULT_STARTING_POINTS;
};

export const saveStoredPlayerPoints = (pts: number): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.POINTS, pts.toString());
  } catch (err) {
    console.warn('Storage write error for points', err);
  }
};

export const getStoredBotPoints = (): number => {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.BOT_POINTS);
    if (val !== null) {
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed) && parsed >= 0) return parsed;
    }
  } catch (err) {
    console.warn('Storage read error for bot points', err);
  }
  return DEFAULT_BOT_POINTS;
};

export const saveStoredBotPoints = (pts: number): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.BOT_POINTS, pts.toString());
  } catch (err) {
    console.warn('Storage write error for bot points', err);
  }
};

export const getStoredStats = (): PlayerStats => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (raw) {
      return { ...INITIAL_STATS, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.warn('Storage read error for stats', err);
  }
  return { ...INITIAL_STATS };
};

export const saveStoredStats = (stats: PlayerStats): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (err) {
    console.warn('Storage write error for stats', err);
  }
};

export const getStoredHistory = (): RoundSummary[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ROUNDS_HISTORY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Storage read error for history', err);
  }
  return [];
};

export const saveStoredHistory = (history: RoundSummary[]): void => {
  try {
    // Keep last 40 rounds
    const trimmed = history.slice(-40);
    localStorage.setItem(STORAGE_KEYS.ROUNDS_HISTORY, JSON.stringify(trimmed));
  } catch (err) {
    console.warn('Storage write error for history', err);
  }
};

export const getStoredTrophies = (): Trophy[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TROPHIES);
    if (raw) {
      const saved: Trophy[] = JSON.parse(raw);
      // Merge with default list to include new trophies if added
      return INITIAL_TROPHIES.map(initT => {
        const found = saved.find(s => s.id === initT.id);
        return found ? { ...initT, isUnlocked: found.isUnlocked } : initT;
      });
    }
  } catch (err) {
    console.warn('Storage read error for trophies', err);
  }
  return INITIAL_TROPHIES;
};

export const saveStoredTrophies = (trophies: Trophy[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TROPHIES, JSON.stringify(trophies));
  } catch (err) {
    console.warn('Storage write error for trophies', err);
  }
};

export const getStoredPlayerName = (): string => {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.PLAYER_NAME);
    if (val !== null && val.trim().length > 0) {
      return val.trim().slice(0, 12);
    }
  } catch (err) {
    console.warn('Storage read error for player name', err);
  }
  return DEFAULT_PLAYER_NAME;
};

export const saveStoredPlayerName = (name: string): void => {
  try {
    const clean = (name.trim() || DEFAULT_PLAYER_NAME).slice(0, 12);
    localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, clean);
  } catch (err) {
    console.warn('Storage write error for player name', err);
  }
};

export const getStoredChaoticMode = (): boolean => {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.CHAOTIC_MODE);
    return val === 'true';
  } catch (err) {
    console.warn('Storage read error for chaotic mode', err);
  }
  return false;
};

export const saveStoredChaoticMode = (enabled: boolean): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CHAOTIC_MODE, enabled ? 'true' : 'false');
  } catch (err) {
    console.warn('Storage write error for chaotic mode', err);
  }
};

export const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getStoredChaoticDailyCount = (): number => {
  try {
    const today = getTodayDateString();
    const storedDate = localStorage.getItem(STORAGE_KEYS.CHAOTIC_DAILY_DATE);
    if (storedDate !== today) {
      // New day: reset counter to 0
      localStorage.setItem(STORAGE_KEYS.CHAOTIC_DAILY_DATE, today);
      localStorage.setItem(STORAGE_KEYS.CHAOTIC_DAILY_COUNT, '0');
      return 0;
    }
    const countVal = localStorage.getItem(STORAGE_KEYS.CHAOTIC_DAILY_COUNT);
    const parsed = parseInt(countVal || '0', 10);
    return isNaN(parsed) || parsed < 0 ? 0 : parsed;
  } catch (err) {
    console.warn('Storage read error for chaotic daily count', err);
  }
  return 0;
};

export const incrementStoredChaoticDailyCount = (): number => {
  try {
    const today = getTodayDateString();
    const current = getStoredChaoticDailyCount();
    const next = current + 1;
    localStorage.setItem(STORAGE_KEYS.CHAOTIC_DAILY_DATE, today);
    localStorage.setItem(STORAGE_KEYS.CHAOTIC_DAILY_COUNT, next.toString());
    return next;
  } catch (err) {
    console.warn('Storage write error for chaotic daily count increment', err);
  }
  return 1;
};

export const getStoredChaoticAlertDismissed = (): boolean => {
  try {
    const today = getTodayDateString();
    const dismissedDate = localStorage.getItem(STORAGE_KEYS.CHAOTIC_ALERT_DISMISSED_DATE);
    return dismissedDate === today;
  } catch (err) {
    console.warn('Storage read error for chaotic alert dismissed', err);
  }
  return false;
};

export const setStoredChaoticAlertDismissed = (dismissed: boolean): void => {
  try {
    const today = getTodayDateString();
    if (dismissed) {
      localStorage.setItem(STORAGE_KEYS.CHAOTIC_ALERT_DISMISSED_DATE, today);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CHAOTIC_ALERT_DISMISSED_DATE);
    }
  } catch (err) {
    console.warn('Storage write error for chaotic alert dismissed', err);
  }
};

export const getStoredAutoPlayEnabled = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEYS.AUTOPLAY_ENABLED) === 'true';
  } catch (err) {
    console.warn('Storage read error for autoplay enabled', err);
  }
  return false;
};

export const saveStoredAutoPlayEnabled = (enabled: boolean): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTOPLAY_ENABLED, enabled.toString());
  } catch (err) {
    console.warn('Storage write error for autoplay enabled', err);
  }
};

export const getStoredAutoPlayStrategy = (): AutoPlayStrategy => {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.AUTOPLAY_STRATEGY);
    if (val === 'LEFT' || val === 'RIGHT' || val === 'RANDOM') {
      return val;
    }
  } catch (err) {
    console.warn('Storage read error for autoplay strategy', err);
  }
  return 'RANDOM';
};

export const saveStoredAutoPlayStrategy = (strategy: AutoPlayStrategy): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTOPLAY_STRATEGY, strategy);
  } catch (err) {
    console.warn('Storage write error for autoplay strategy', err);
  }
};

export const getStoredLanguageSetting = (): 'auto' | 'fr' | 'en' | 'ht' | 'es' => {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.LANGUAGE_SETTING);
    if (val === 'auto' || val === 'fr' || val === 'en' || val === 'ht' || val === 'es') {
      return val;
    }
  } catch (err) {
    console.warn('Storage read error for language setting', err);
  }
  return 'auto';
};

export const saveStoredLanguageSetting = (setting: 'auto' | 'fr' | 'en' | 'ht' | 'es'): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE_SETTING, setting);
  } catch (err) {
    console.warn('Storage write error for language setting', err);
  }
};

export const resetAllGameData = (): { points: number; botPoints: number; stats: PlayerStats } => {
  saveStoredPlayerPoints(DEFAULT_STARTING_POINTS);
  saveStoredBotPoints(DEFAULT_BOT_POINTS);
  saveStoredStats(INITIAL_STATS);
  saveStoredHistory([]);
  saveStoredTrophies(INITIAL_TROPHIES);
  return {
    points: DEFAULT_STARTING_POINTS,
    botPoints: DEFAULT_BOT_POINTS,
    stats: INITIAL_STATS,
  };
};
