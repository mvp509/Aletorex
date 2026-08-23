/**
 * ALETOREX - Bot Decision Logic & Game Rules Engine
 * Regles des Jokers par profil d'adversaire :
 * - TACTICIEN : 1 Joker
 * - OFFENSIF : 2 Jokers
 * - STRATÈGE : 3 Jokers
 */

import { CardValue, BotPersonality } from '../types';

/**
 * Generates a random card strictly between 1 and 10.
 */
export const getRandomCardValue = (): CardValue => {
  return (Math.floor(Math.random() * 10) + 1) as CardValue;
};

/**
 * Calculates the dynamic Joker price based on the selected bet.
 * The price is exactly half (50%) of the bet:
 * 1 pt => 0.5 pt, 10 pts => 5 pts, 50 pts => 25 pts.
 * When the player bets their full balance (isMaxBet = true), Jokers are 100% FREE (0 pt).
 */
export const calculateJokerPrice = (betAmount: number, isMaxBet: boolean = false): number => {
  if (isMaxBet) return 0;
  if (betAmount <= 0) return 0;
  const half = betAmount * 0.5;
  return Number.isInteger(half) ? half : Number(half.toFixed(1));
};

/**
 * Returns the maximum number of Jokers allowed per round based on adversary style.
 * - TACTICIEN : 1 Joker
 * - OFFENSIF : 2 Jokers
 * - STRATÈGE : 3 Jokers
 */
export const getMaxJokersForPersonality = (personality: BotPersonality | string = 'STANDARD'): number => {
  switch (personality) {
    case 'STANDARD': // TACTICIEN
      return 1;
    case 'AGGRESSIVE': // OFFENSIF
      return 2;
    case 'CAUTIOUS': // STRATÈGE
      return 3;
    default:
      return 1;
  }
};

/**
 * Determines whether the Bot should buy a Joker when it is losing.
 */
export const shouldBotBuyJoker = (
  botPoints: number,
  jokerPrice: number,
  personality: BotPersonality = 'STANDARD',
  currentBet: number = 10,
  playerCardValue: number = 5
): boolean => {
  // Hard check: Bot must have enough points
  if (botPoints < jokerPrice) return false;

  // Base threshold depending on personality
  let probability = 0.5;

  if (personality === 'AGGRESSIVE') {
    // Offensif takes high risks
    probability = playerCardValue >= 9 ? 0.45 : 0.75;
    if (currentBet >= 50) probability += 0.15;
  } else if (personality === 'CAUTIOUS') {
    // Stratège computes risk carefully with up to 3 jokers
    probability = playerCardValue >= 8 ? 0.55 : 0.4;
  } else {
    // Tacticien: only 1 shot, uses it calculatedly
    probability = playerCardValue >= 8 ? 0.35 : 0.6;
  }

  return Math.random() < probability;
};

export interface BotProfile {
  name: string;
  avatar: string;
  personality: BotPersonality;
  tagline: string;
  maxJokers: number;
}

export const BOT_PROFILES: Record<BotPersonality, BotProfile> = {
  STANDARD: {
    name: 'TACTICIEN',
    avatar: '⚖️',
    personality: 'STANDARD',
    tagline: 'Adversaire Équilibré (1 Joker)',
    maxJokers: 1,
  },
  AGGRESSIVE: {
    name: 'OFFENSIF',
    avatar: '⚔️',
    personality: 'AGGRESSIVE',
    tagline: 'Adversaire Téméraire (2 Jokers)',
    maxJokers: 2,
  },
  CAUTIOUS: {
    name: 'STRATÈGE',
    avatar: '🛡️',
    personality: 'CAUTIOUS',
    tagline: 'Adversaire Prudent (3 Jokers)',
    maxJokers: 3,
  },
};
