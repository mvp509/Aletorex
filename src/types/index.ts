/**
 * ALETOREX - Strict TypeScript Types & Interfaces
 * Bank State, Game Stages, Cards, and Stats
 */

export type GameStage = 
  | 'BETTING'        // Pari initial et validation
  | 'DEALING'        // Animation de distribution
  | 'SELECTION'      // Choix de la carte cachée (Gauche / Droite)
  | 'REVEALED'       // Révélation et comparaison
  | 'BOT_THINKING'   // L'IA analyse sa décision Joker
  | 'JOKER_PHASE'    // Phase de contestation Joker du joueur
  | 'TIE_BREAKER'    // Égalité : Relance sans nouvelle mise
  | 'GAME_OVER';     // Fin de manche, résultat affiché

export type CardPosition = 'LEFT' | 'RIGHT';

export type CardValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type GameWinner = 'PLAYER' | 'BOT' | 'DRAW';

export type GameSpeed = 'NORMAL' | 'FAST';

export type AutoPlayStrategy = 'LEFT' | 'RIGHT' | 'RANDOM';

export interface CardData {
  readonly id: string;
  readonly value: CardValue;
  readonly position: CardPosition;
  readonly isRevealed: boolean;
  readonly isJokerReroll?: boolean;
}

export interface RoundSummary {
  readonly roundNumber: number;
  readonly betAmount: number;
  readonly potAmount: number;
  readonly botBetAmount?: number;
  readonly isChaotic?: boolean;
  readonly playerCard: CardValue;
  readonly botCard: CardValue;
  readonly winner: GameWinner;
  readonly playerJokersUsed: number;
  readonly botJokersUsed: number;
  readonly tieCount?: number;
  readonly timestamp: number;
}

export type BotPersonality = 'STANDARD' | 'AGGRESSIVE' | 'CAUTIOUS';

export interface PlayerStats {
  totalRounds: number;
  roundsWon: number;
  roundsLost: number;
  roundsDrawn: number;
  currentStreak: number;
  bestStreak: number;
  totalPointsWon: number;
  totalPointsBet: number;
  jokersUsed: number;
  jokerWins: number;
  highestSinglePotWon: number;
  highestSingleGain?: number;
  highestBankBalance?: number;
  lastDailyRewardTimestamp: number;
  freeReloadsClaimed: number;
}

/**
 * Bank Module State - Drip & Sink Economy
 */
export interface BankState {
  points: number;
  lastRechargeTimestamp: number | null; // Timestamp UNIX en ms
  hasClaimedDailyChest: boolean;       // Réinitialisé chaque jour à 00:00
  hasClaimedDailyBailout: boolean;     // Réinitialisé chaque jour à 00:00
  lastResetDate: string;               // Format "YYYY-MM-DD" pour détecter le changement de jour
}

export interface BankConfig {
  dripCooldownMs: number;              // 1 heure (3 600 000 ms)
  dripAmount: number;                  // +50 points
  dailyChestMin: number;               // 50 points
  dailyChestMax: number;               // 100 points
  bailoutThreshold: number;            // Solde < 10 points
  bailoutAmount: number;               // +50 points de sauvetage
  maxBankCap: number;                  // Plafond élevé
}

export interface Trophy {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly isUnlocked: boolean;
  readonly progress?: { current: number; max: number };
}

export type SoundEffect =
  | 'deal'
  | 'flip'
  | 'chip'
  | 'joker'
  | 'win'
  | 'loss'
  | 'draw'
  | 'reward'
  | 'click'
  | 'error';
