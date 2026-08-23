/**
 * ALETOREX - Master Game State Engine Hook
 * Strictly integrated with the Bank Module (Drip & Sink Architecture)
 * Rules: TACTICIEN = 1 Joker, OFFENSIF = 2 Jokers, STRATÈGE = 3 Jokers
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  GameStage,
  CardPosition,
  CardValue,
  GameWinner,
  RoundSummary,
  PlayerStats,
  Trophy,
  BotPersonality,
  GameSpeed,
  AutoPlayStrategy,
} from '../types';
import {
  getStoredBotPoints,
  saveStoredBotPoints,
  getStoredStats,
  saveStoredStats,
  getStoredHistory,
  saveStoredHistory,
  getStoredTrophies,
  saveStoredTrophies,
  getStoredPlayerName,
  saveStoredPlayerName,
  getStoredChaoticMode,
  saveStoredChaoticMode,
  getStoredChaoticDailyCount,
  incrementStoredChaoticDailyCount,
  getStoredChaoticAlertDismissed,
  setStoredChaoticAlertDismissed,
  getStoredAutoPlayEnabled,
  saveStoredAutoPlayEnabled,
  getStoredAutoPlayStrategy,
  saveStoredAutoPlayStrategy,
  getStoredLanguageSetting,
  resetAllGameData,
  INITIAL_TROPHIES,
} from '../utils/storage';
import { useBank } from './useBank';
import {
  getRandomCardValue,
  calculateJokerPrice,
  shouldBotBuyJoker,
  getMaxJokersForPersonality,
  BOT_PROFILES,
} from '../utils/botLogic';
import { playSound, triggerHaptic } from '../utils/audio';
import {
  TRANSLATIONS,
  TranslationKey,
  Language,
  formatTemplate,
  resolveActiveLanguage,
} from '../utils/i18n';

interface UseGameEngineOptions {
  language?: Language;
  t?: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

export const useGameEngine = (options?: UseGameEngineOptions) => {
  const activeLang: Language =
    options?.language || resolveActiveLanguage(getStoredLanguageSetting());

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      if (options?.t) {
        return options.t(key, params);
      }
      const langDict = TRANSLATIONS[activeLang] || TRANSLATIONS.fr;
      const raw = (langDict as any)[key] || (TRANSLATIONS.fr as any)[key] || key;
      return formatTemplate(raw, params);
    },
    [options, activeLang]
  );
  // Bank Module (State, Timers, Sinks & Drips)
  const {
    bankState,
    points: playerPoints,
    dripRemainingMs,
    isDripReady,
    canClaimDailyChest,
    canClaimDailyBailout,
    updatePoints,
    claimPeriodicDrip,
    claimDailyChest,
    claimDailyBailout,
    resetBank,
  } = useBank();

  // Match State
  const [botPoints, setBotPoints] = useState<number>(() => getStoredBotPoints());
  const [currentBet, setCurrentBet] = useState<number>(10);
  const [isMaxBet, setIsMaxBet] = useState<boolean>(false);
  const [stage, setStage] = useState<GameStage>('BETTING');

  // Cards State
  const [leftCard, setLeftCard] = useState<CardValue | null>(null);
  const [rightCard, setRightCard] = useState<CardValue | null>(null);
  const [playerCardChoice, setPlayerCardChoice] = useState<CardPosition | null>(null);
  const [playerCardValue, setPlayerCardValue] = useState<CardValue | null>(null);
  const [botCardValue, setBotCardValue] = useState<CardValue | null>(null);

  // Jokers State
  const [jokersUsedPlayer, setJokersUsedPlayer] = useState<number>(0);
  const [jokersUsedBot, setJokersUsedBot] = useState<number>(0);
  const [isPlayerJokerReroll, setIsPlayerJokerReroll] = useState<boolean>(false);
  const [isBotJokerReroll, setIsBotJokerReroll] = useState<boolean>(false);

  // Match Flow & Bot Configuration
  const [playerName, setPlayerName] = useState<string>(() => getStoredPlayerName());
  const [winner, setWinner] = useState<GameWinner | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>(() => t('statusChooseBet'));
  const [roundCount, setRoundCount] = useState<number>(1);
  const [tieCount, setTieCount] = useState<number>(0);
  const [botPersonality, setBotPersonality] = useState<BotPersonality>('STANDARD');
  const [gameSpeed, setGameSpeed] = useState<GameSpeed>('NORMAL');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isChaoticMode, setIsChaoticMode] = useState<boolean>(() => getStoredChaoticMode());
  const [botChaoticBet, setBotChaoticBet] = useState<number | null>(null);
  const [chaoticDailyCount, setChaoticDailyCount] = useState<number>(() => getStoredChaoticDailyCount());
  const [isChaoticAlertDismissed, setIsChaoticAlertDismissed] = useState<boolean>(() => getStoredChaoticAlertDismissed());
  const [isAutoPlayActive, setIsAutoPlayActive] = useState<boolean>(() => getStoredAutoPlayEnabled());
  const [autoPlayStrategy, setAutoPlayStrategy] = useState<AutoPlayStrategy>(() => getStoredAutoPlayStrategy());

  // Helper for localized adversary name
  const getBotDisplayName = useCallback(
    (personality: BotPersonality): string => {
      if (personality === 'STANDARD') return t('botTactician');
      if (personality === 'AGGRESSIVE') return t('botAggressive');
      return t('botCautious');
    },
    [t]
  );

  // Update default status message on language change if in BETTING stage
  useEffect(() => {
    if (stage === 'BETTING') {
      setStatusMessage(t('statusChooseBet'));
    }
  }, [t, stage]);

  // Maximum allowed Jokers based on adversary profile (Tacticien: 1, Offensif: 2, Stratège: 3)
  const maxJokers = getMaxJokersForPersonality(botPersonality);

  // Persistent Stats & Trophies
  const [stats, setStats] = useState<PlayerStats>(() => getStoredStats());
  const [history, setHistory] = useState<RoundSummary[]>(() => getStoredHistory());
  const [trophies, setTrophies] = useState<Trophy[]>(() => getStoredTrophies());
  const [unlockedTrophyToast, setUnlockedTrophyToast] = useState<Trophy | null>(null);

  // Ref to track latest state during async delays
  const stateRef = useRef({
    playerPoints,
    botPoints,
    currentBet,
    isMaxBet,
    jokersUsedPlayer,
    jokersUsedBot,
    playerCardChoice,
    stats,
    history,
    trophies,
    roundCount,
    tieCount,
    gameSpeed,
    botPersonality,
    maxJokers,
    isChaoticMode,
    botChaoticBet,
    isAutoPlayActive,
    autoPlayStrategy,
  });

  useEffect(() => {
    stateRef.current = {
      playerPoints,
      botPoints,
      currentBet,
      isMaxBet,
      jokersUsedPlayer,
      jokersUsedBot,
      playerCardChoice,
      stats,
      history,
      trophies,
      roundCount,
      tieCount,
      gameSpeed,
      botPersonality,
      maxJokers,
      isChaoticMode,
      botChaoticBet,
      isAutoPlayActive,
      autoPlayStrategy,
    };
  }, [
    playerPoints,
    botPoints,
    currentBet,
    isMaxBet,
    jokersUsedPlayer,
    jokersUsedBot,
    playerCardChoice,
    stats,
    history,
    trophies,
    roundCount,
    tieCount,
    gameSpeed,
    botPersonality,
    maxJokers,
    isChaoticMode,
    botChaoticBet,
    isAutoPlayActive,
    autoPlayStrategy,
  ]);

  const jokerPrice = calculateJokerPrice(currentBet, isMaxBet);
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, gameSpeed === 'FAST' ? ms * 0.5 : ms));

  // Helper for victory confetti
  const triggerVictoryEffects = () => {
    try {
      confetti({
        particleCount: 75,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6'],
      });
    } catch {
      // Ignored if canvas fails
    }
  };

  // Robust Trophy Evaluator with celebratory toast
  const evaluateTrophies = useCallback(
    (
      currentStats: PlayerStats,
      betAmt: number,
      isJokerVictory: boolean,
      balance: number
    ) => {
      setTrophies((prevTrophies) => {
        let newlyUnlocked: Trophy | null = null;
        let changed = false;

        const updated = prevTrophies.map((t) => {
          if (t.isUnlocked) return t;

          let shouldUnlock = false;
          if (t.id === 'first_win' && currentStats.roundsWon >= 1) shouldUnlock = true;
          if (t.id === 'streak_3' && Math.max(currentStats.currentStreak, currentStats.bestStreak) >= 3) shouldUnlock = true;
          if (t.id === 'streak_7' && Math.max(currentStats.currentStreak, currentStats.bestStreak) >= 7) shouldUnlock = true;
          if (t.id === 'high_roller' && (betAmt >= 100 || currentStats.totalPointsBet >= 100)) shouldUnlock = true;
          if (t.id === 'joker_miracle' && (isJokerVictory || currentStats.jokerWins >= 1)) shouldUnlock = true;
          if (t.id === 'bank_500' && balance >= 500) shouldUnlock = true;
          if (t.id === 'bank_1000' && balance >= 1000) shouldUnlock = true;
          if (t.id === 'veteran_50' && currentStats.totalRounds >= 50) shouldUnlock = true;

          if (shouldUnlock) {
            changed = true;
            newlyUnlocked = { ...t, isUnlocked: true };
            return newlyUnlocked;
          }
          return t;
        });

        if (changed) {
          saveStoredTrophies(updated);
          if (newlyUnlocked) {
            setUnlockedTrophyToast(newlyUnlocked);
            playSound('win');
            triggerVictoryEffects();
            setTimeout(() => {
              setUnlockedTrophyToast(null);
            }, 4500);
          }
        }
        return updated;
      });
    },
    []
  );

  // Check balance-based trophies whenever playerPoints updates
  useEffect(() => {
    evaluateTrophies(stats, currentBet, false, playerPoints);
  }, [playerPoints, stats, currentBet, evaluateTrophies]);

  // Evaluate single card comparison
  const evaluateComparison = (pVal: CardValue, bVal: CardValue): GameWinner => {
    if (pVal > bVal) return 'PLAYER';
    if (bVal > pVal) return 'BOT';
    return 'DRAW';
  };

  // Handle Tie Breaker (Relancer un tirage sans prélever de nouvelle mise)
  const triggerTieBreaker = useCallback(
    async (pVal: CardValue, bVal: CardValue) => {
      setIsProcessing(true);
      playSound('draw');
      setStatusMessage(
        t('statusTieBreaker', { playerVal: pVal, botVal: bVal })
      );
      setTieCount((c) => c + 1);

      await delay(1200);

      // Deal two new hidden cards
      const newL = getRandomCardValue();
      const newR = getRandomCardValue();
      setLeftCard(newL);
      setRightCard(newR);
      setPlayerCardChoice(null);
      setPlayerCardValue(null);
      setBotCardValue(null);
      setIsPlayerJokerReroll(false);
      setIsBotJokerReroll(false);

      setStage('SELECTION');
      setIsProcessing(false);
      playSound('deal');
      setStatusMessage(t('statusTieSelection'));
    },
    [delay, t]
  );

  // Finalize round and credit/deduct pot (Economy Sink & Win)
  const finalizeRound = useCallback(
    (finalWinner: GameWinner, finalPVal: CardValue, finalBVal: CardValue) => {
      setIsProcessing(false);
      setWinner(finalWinner);
      setStage('GAME_OVER');

      const currentBetAmt = stateRef.current.currentBet;
      const curPlayerPts = stateRef.current.playerPoints;
      const curBotPts = stateRef.current.botPoints;
      const curJokersP = stateRef.current.jokersUsedPlayer;
      const curJokersB = stateRef.current.jokersUsedBot;
      const curStats = stateRef.current.stats;
      const isChaoticActive =
        stateRef.current.botPersonality === 'CAUTIOUS' && stateRef.current.isChaoticMode;
      const actualBotBet =
        isChaoticActive && stateRef.current.botChaoticBet !== null
          ? stateRef.current.botChaoticBet
          : currentBetAmt;
      const actualPotTotal = currentBetAmt + actualBotBet;
      const botName = getBotDisplayName(botPersonality);

      let newPlayerPts = curPlayerPts;
      let newBotPts = curBotPts;
      let newStreak = curStats.currentStreak;
      let bestStreak = curStats.bestStreak;
      let isJokerWin = false;

      if (finalWinner === 'PLAYER') {
        newPlayerPts = Math.max(0, curPlayerPts + actualBotBet);
        newBotPts = Math.max(0, curBotPts - actualBotBet);
        newStreak += 1;
        if (newStreak > bestStreak) bestStreak = newStreak;
        isJokerWin = curJokersP > 0;

        playSound('win');
        triggerVictoryEffects();

        if (isChaoticActive) {
          const signPrefix = actualBotBet >= 0 ? '+' : '';
          setStatusMessage(
            t('statusChaoticWin', {
              botBet: `${signPrefix}${actualBotBet.toLocaleString()}`,
              pot: actualPotTotal.toLocaleString(),
              playerVal: finalPVal,
              botVal: finalBVal,
            })
          );
        } else {
          setStatusMessage(
            t('statusYouWon', {
              pot: currentBetAmt * 2,
              playerVal: finalPVal,
              botVal: finalBVal,
            })
          );
        }
      } else if (finalWinner === 'BOT') {
        newPlayerPts = Math.max(0, curPlayerPts - currentBetAmt);
        newBotPts = curBotPts + currentBetAmt;
        newStreak = 0;

        playSound('loss');
        if (isChaoticActive) {
          const signPrefix = actualBotBet >= 0 ? '+' : '';
          setStatusMessage(
            t('statusChaoticLost', {
              botName,
              botBet: `${signPrefix}${actualBotBet.toLocaleString()}`,
              bet: currentBetAmt,
              botVal: finalBVal,
              playerVal: finalPVal,
            })
          );
        } else {
          setStatusMessage(
            t('statusYouLost', {
              botName,
              pot: currentBetAmt * 2,
              botVal: finalBVal,
              playerVal: finalPVal,
            })
          );
        }
      }

      // Maintain bot points in storage
      updatePoints(newPlayerPts);
      setBotPoints(newBotPts);
      saveStoredBotPoints(newBotPts);

      // Update Stats
      const updatedStats: PlayerStats = {
        ...curStats,
        totalRounds: curStats.totalRounds + 1,
        roundsWon: curStats.roundsWon + (finalWinner === 'PLAYER' ? 1 : 0),
        roundsLost: curStats.roundsLost + (finalWinner === 'BOT' ? 1 : 0),
        roundsDrawn: curStats.roundsDrawn + (finalWinner === 'DRAW' ? 1 : 0),
        currentStreak: newStreak,
        bestStreak: bestStreak,
        totalPointsWon:
          curStats.totalPointsWon + (finalWinner === 'PLAYER' ? actualPotTotal : 0),
        totalPointsBet: curStats.totalPointsBet + currentBetAmt,
        jokersUsed: curStats.jokersUsed + curJokersP,
        jokerWins: curStats.jokerWins + (isJokerWin ? 1 : 0),
        highestSinglePotWon:
          finalWinner === 'PLAYER'
            ? Math.max(curStats.highestSinglePotWon, actualPotTotal)
            : curStats.highestSinglePotWon,
      };

      setStats(updatedStats);
      saveStoredStats(updatedStats);

      // Save Round Summary
      const summary: RoundSummary = {
        roundNumber: stateRef.current.roundCount,
        betAmount: currentBetAmt,
        potAmount: actualPotTotal,
        botBetAmount: actualBotBet,
        isChaotic: isChaoticActive,
        playerCard: finalPVal,
        botCard: finalBVal,
        winner: finalWinner,
        playerJokersUsed: curJokersP,
        botJokersUsed: curJokersB,
        tieCount: stateRef.current.tieCount,
        timestamp: Date.now(),
      };

      setHistory((prev) => {
        const nextHist = [...prev, summary];
        saveStoredHistory(nextHist);
        return nextHist;
      });

      setRoundCount((c) => c + 1);
      evaluateTrophies(updatedStats, currentBetAmt, isJokerWin, newPlayerPts);
    },
    [botPersonality, evaluateTrophies, updatePoints]
  );

  // 1. PLACE BET & DEAL CARDS
  const placeBet = useCallback(
    (betAmount: number) => {
      if (betAmount <= 0 || betAmount > playerPoints || isProcessing) {
        playSound('error');
        return false;
      }

      const isMax = betAmount >= playerPoints;
      const isChaoticActive = botPersonality === 'CAUTIOUS' && isChaoticMode;

      // Roll chaotic secret bot bet: 0 to 10 000 (standard, <= 10 games) or -10 000 to +10 000 (evolved, > 10 games)
      let generatedBotBet: number | null = null;
      let nextDailyCount = chaoticDailyCount;
      let isEvolved = false;

      if (isChaoticActive) {
        const currentDaily = getStoredChaoticDailyCount();
        isEvolved = currentDaily >= 10;
        if (isEvolved) {
          // Evolved range: -10 000 to +10 000
          generatedBotBet = Math.floor(Math.random() * 20001) - 10000;
        } else {
          // Standard daily range: 0 to 10 000
          generatedBotBet = Math.floor(Math.random() * 10001);
        }
        setBotChaoticBet(generatedBotBet);

        // Increment daily count on new chaotic round
        nextDailyCount = incrementStoredChaoticDailyCount();
        setChaoticDailyCount(nextDailyCount);
      } else {
        setBotChaoticBet(null);
      }

      setIsProcessing(true);
      setCurrentBet(betAmount);
      setIsMaxBet(isMax);
      setJokersUsedPlayer(0);
      setJokersUsedBot(0);
      setIsPlayerJokerReroll(false);
      setIsBotJokerReroll(false);
      setWinner(null);
      setPlayerCardChoice(null);
      setPlayerCardValue(null);
      setBotCardValue(null);
      setTieCount(0);

      // Evaluate high roller trophy immediately on bet placement
      evaluateTrophies(stats, betAmount, false, playerPoints);

      // Generate random 1-10 cards
      const cardL = getRandomCardValue();
      const cardR = getRandomCardValue();
      setLeftCard(cardL);
      setRightCard(cardR);

      setStage('DEALING');
      playSound('deal');
      setStatusMessage(
        isChaoticActive
          ? isEvolved
            ? t('statusChaoticDealing', { range: '-10 000 .. +10 000' })
            : t('statusChaoticDealing', { range: `0 .. 10 000 (${nextDailyCount}/10)` })
          : t('statusDealing')
      );

      setTimeout(
        () => {
          setStage('SELECTION');
          setIsProcessing(false);
          setStatusMessage(t('statusSelectCard'));
        },
        gameSpeed === 'FAST' ? 250 : 450
      );

      return true;
    },
    [playerPoints, isProcessing, gameSpeed, evaluateTrophies, stats, botPersonality, isChaoticMode, chaoticDailyCount, t]
  );

  // Execute Bot Joker logic with spatial card update
  const executeBotJokerTurn = useCallback(
    async (
      currentPVal: CardValue,
      currentBVal: CardValue,
      nextJokerNumber: number,
      choice: CardPosition
    ) => {
      const activeMaxJokers = stateRef.current.maxJokers;
      const botName = getBotDisplayName(botPersonality);
      setStage('BOT_THINKING');
      setIsProcessing(true);
      setStatusMessage(
        t('statusBotSummoningJoker', {
          botName,
          current: nextJokerNumber,
          max: activeMaxJokers,
        })
      );

      await delay(700);

      const newBVal = getRandomCardValue();
      setBotCardValue(newBVal);
      setIsBotJokerReroll(true);

      // Update physical card location for bot
      if (choice === 'LEFT') {
        setRightCard(newBVal);
      } else {
        setLeftCard(newBVal);
      }

      setBotPoints((prev) => {
        const updated = Math.max(0, prev - jokerPrice);
        saveStoredBotPoints(updated);
        return updated;
      });
      setJokersUsedBot(nextJokerNumber);
      playSound('joker');

      await delay(700);

      const newOutcome = evaluateComparison(currentPVal, newBVal);

      if (newOutcome === 'BOT') {
        // Bot took the lead! Offer player a counter if player has jokers left and can afford it (or if All-In / Free)
        const isFree = stateRef.current.isMaxBet || jokerPrice === 0;
        const playerCanJoker =
          stateRef.current.jokersUsedPlayer < activeMaxJokers &&
          (isFree || (stateRef.current.playerPoints >= jokerPrice && jokerPrice > 0));
        if (playerCanJoker) {
          setStage('JOKER_PHASE');
          setIsProcessing(false);
          setStatusMessage(
            isFree
              ? t('statusJokerAvailableFree', { playerVal: currentPVal, botVal: newBVal, botName })
              : t('statusJokerAvailablePaid', {
                  playerVal: currentPVal,
                  botVal: newBVal,
                  botName,
                  price: jokerPrice,
                  s: jokerPrice > 1 ? 's' : '',
                })
          );
        } else {
          finalizeRound('BOT', currentPVal, newBVal);
        }
      } else if (newOutcome === 'PLAYER') {
        // Bot is still losing: Can bot use another joker?
        if (
          nextJokerNumber < activeMaxJokers &&
          shouldBotBuyJoker(
            stateRef.current.botPoints,
            jokerPrice,
            botPersonality,
            currentBet,
            currentPVal
          )
        ) {
          executeBotJokerTurn(currentPVal, newBVal, nextJokerNumber + 1, choice);
        } else {
          finalizeRound('PLAYER', currentPVal, newBVal);
        }
      } else {
        // Draw after Joker! Trigger tie-breaker
        triggerTieBreaker(currentPVal, newBVal);
      }
    },
    [botPersonality, currentBet, jokerPrice, delay, finalizeRound, triggerTieBreaker, getBotDisplayName, t]
  );

  // 2. SELECT A CARD (LEFT OR RIGHT)
  const selectCard = useCallback(
    async (choice: CardPosition) => {
      if (stage !== 'SELECTION' || isProcessing || !leftCard || !rightCard) return;

      setIsProcessing(true);
      setPlayerCardChoice(choice);

      const pVal = choice === 'LEFT' ? leftCard : rightCard;
      const bVal = choice === 'LEFT' ? rightCard : leftCard;
      const botName = getBotDisplayName(botPersonality);

      setPlayerCardValue(pVal);
      setBotCardValue(bVal);
      setStage('REVEALED');
      playSound('flip');

      await delay(750);

      const outcome = evaluateComparison(pVal, bVal);

      if (outcome === 'PLAYER') {
        // Bot lost: Check if Bot uses a Joker
        const shouldBotJoker =
          maxJokers > 0 &&
          shouldBotBuyJoker(
            stateRef.current.botPoints,
            jokerPrice,
            botPersonality,
            currentBet,
            pVal
          );
        if (shouldBotJoker) {
          executeBotJokerTurn(pVal, bVal, 1, choice);
        } else {
          finalizeRound('PLAYER', pVal, bVal);
        }
      } else if (outcome === 'BOT') {
        const isFree = stateRef.current.isMaxBet || jokerPrice === 0;
        const canAfford = isFree || (stateRef.current.playerPoints >= jokerPrice && jokerPrice > 0);
        if (canAfford && maxJokers > 0) {
          // Player lost: Trigger Joker Phase option if player can afford it or has free All-In jokers
          setStage('JOKER_PHASE');
          setIsProcessing(false);
          setStatusMessage(
            isFree
              ? t('statusJokerAvailableFree', { playerVal: pVal, botVal: bVal, botName })
              : t('statusJokerAvailablePaid', {
                  playerVal: pVal,
                  botVal: bVal,
                  botName,
                  price: jokerPrice,
                  s: jokerPrice > 1 ? 's' : '',
                })
          );
        } else {
          finalizeRound('BOT', pVal, bVal);
        }
      } else {
        // DRAW / ÉGALITÉ: Auto tie breaker
        triggerTieBreaker(pVal, bVal);
      }
    },
    [
      stage,
      isProcessing,
      leftCard,
      rightCard,
      jokerPrice,
      maxJokers,
      botPersonality,
      currentBet,
      delay,
      executeBotJokerTurn,
      finalizeRound,
      triggerTieBreaker,
      getBotDisplayName,
      t,
    ]
  );

  // 3. PLAYER BUYS A JOKER
  const buyPlayerJoker = useCallback(async () => {
    const isFree = isMaxBet || jokerPrice === 0;
    const canAfford = isFree || (playerPoints >= jokerPrice && jokerPrice > 0);

    if (
      jokersUsedPlayer >= maxJokers ||
      !canAfford ||
      isProcessing ||
      botCardValue === null ||
      !playerCardChoice
    ) {
      playSound('error');
      return false;
    }

    setIsProcessing(true);
    const newJokersCount = jokersUsedPlayer + 1;
    setJokersUsedPlayer(newJokersCount);
    setIsPlayerJokerReroll(true);

    // Deduct cost via Bank only if not free
    let updatedPts = playerPoints;
    if (!isFree && jokerPrice > 0) {
      updatedPts = Math.max(0, playerPoints - jokerPrice);
      updatePoints(updatedPts);
    }

    const newPVal = getRandomCardValue();
    setPlayerCardValue(newPVal);

    // Update physical card location for player
    if (playerCardChoice === 'LEFT') {
      setLeftCard(newPVal);
    } else {
      setRightCard(newPVal);
    }

    playSound('joker');
    triggerHaptic('heavy');
    setStatusMessage(
      t('statusJokerInvoked', {
        current: newJokersCount,
        max: maxJokers,
        val: newPVal,
      })
    );

    await delay(750);

    const newOutcome = evaluateComparison(newPVal, botCardValue);
    const botName = getBotDisplayName(botPersonality);

    if (newOutcome === 'PLAYER') {
      // Player is winning now. Check if Bot counters with a Joker
      const botHasJokersLeft = jokersUsedBot < maxJokers;
      if (
        botHasJokersLeft &&
        shouldBotBuyJoker(
          stateRef.current.botPoints,
          jokerPrice,
          botPersonality,
          currentBet,
          newPVal
        )
      ) {
        executeBotJokerTurn(newPVal, botCardValue, jokersUsedBot + 1, playerCardChoice);
      } else {
        finalizeRound('PLAYER', newPVal, botCardValue);
      }
    } else if (newOutcome === 'BOT') {
      // Player still losing: If another joker available and affordable, offer again, else finalize
      const canAffordNext = isFree || (updatedPts >= jokerPrice);
      if (newJokersCount < maxJokers && canAffordNext) {
        setStage('JOKER_PHASE');
        setIsProcessing(false);
        const isLast = newJokersCount === maxJokers - 1;
        setStatusMessage(
          isFree
            ? isLast
              ? t('statusLastJokerAvailableFree', { playerVal: newPVal, botVal: botCardValue, botName })
              : t('statusJokerAvailableFree', { playerVal: newPVal, botVal: botCardValue, botName })
            : isLast
            ? t('statusLastJokerAvailablePaid', {
                playerVal: newPVal,
                botVal: botCardValue,
                botName,
                price: jokerPrice,
                s: jokerPrice > 1 ? 's' : '',
              })
            : t('statusJokerAvailablePaid', {
                playerVal: newPVal,
                botVal: botCardValue,
                botName,
                price: jokerPrice,
                s: jokerPrice > 1 ? 's' : '',
              })
        );
      } else {
        finalizeRound('BOT', newPVal, botCardValue);
      }
    } else {
      // Tie! Trigger tie-breaker
      triggerTieBreaker(newPVal, botCardValue);
    }

    return true;
  }, [
    isMaxBet,
    jokerPrice,
    jokersUsedPlayer,
    maxJokers,
    playerPoints,
    isProcessing,
    botCardValue,
    playerCardChoice,
    updatePoints,
    jokersUsedBot,
    botPersonality,
    currentBet,
    delay,
    executeBotJokerTurn,
    finalizeRound,
    triggerTieBreaker,
    getBotDisplayName,
    t,
  ]);

  // 4. PLAYER PASSES / ACCEPTS DEFEAT
  const passJoker = useCallback(() => {
    if (stage !== 'JOKER_PHASE' || isProcessing || !playerCardValue || !botCardValue) return;
    playSound('chip');
    finalizeRound('BOT', playerCardValue, botCardValue);
  }, [stage, isProcessing, playerCardValue, botCardValue, finalizeRound]);

  // Return to Betting Screen
  const returnToBetting = useCallback(() => {
    if (stage !== 'GAME_OVER') return;
    setStage('BETTING');
    setWinner(null);
    setPlayerCardChoice(null);
    setPlayerCardValue(null);
    setBotCardValue(null);
    setLeftCard(null);
    setRightCard(null);
    setJokersUsedPlayer(0);
    setJokersUsedBot(0);
    setIsPlayerJokerReroll(false);
    setIsBotJokerReroll(false);
    setBotChaoticBet(null);
    setTieCount(0);
    setStatusMessage(t('statusChooseBetNext'));
  }, [stage, t]);

  // Reset all game data
  const resetGame = useCallback(() => {
    resetAllGameData();
    resetBank();
    setBotPoints(100);
    setCurrentBet(10);
    setIsMaxBet(false);
    setStage('BETTING');
    setLeftCard(null);
    setRightCard(null);
    setPlayerCardChoice(null);
    setPlayerCardValue(null);
    setBotCardValue(null);
    setBotChaoticBet(null);
    setJokersUsedPlayer(0);
    setJokersUsedBot(0);
    setIsPlayerJokerReroll(false);
    setIsBotJokerReroll(false);
    setWinner(null);
    setRoundCount(1);
    setStats(getStoredStats());
    setHistory([]);
    setTrophies(INITIAL_TROPHIES);
    setTieCount(0);
    setUnlockedTrophyToast(null);
    playSound('chip');
    setStatusMessage(t('gameResetNotification'));
  }, [resetBank, t]);

  // Player name update
  const updatePlayerName = useCallback((newName: string) => {
    const clean = (newName.trim() || 'VOUS').slice(0, 12);
    setPlayerName(clean);
    saveStoredPlayerName(clean);
  }, []);

  // Bot personality switch
  const changeBotPersonality = useCallback((p: BotPersonality) => {
    setBotPersonality(p);
    if (p !== 'AGGRESSIVE') {
      setIsAutoPlayActive(false);
      saveStoredAutoPlayEnabled(false);
    }
  }, []);

  // Game speed toggle
  const toggleGameSpeed = useCallback(() => {
    setGameSpeed((s) => (s === 'NORMAL' ? 'FAST' : 'NORMAL'));
  }, []);

  // Chaotic mode toggle
  const toggleChaoticMode = useCallback(() => {
    setIsChaoticMode((prev) => {
      const next = !prev;
      saveStoredChaoticMode(next);
      return next;
    });
  }, []);

  // Chaotic alert dismissal
  const dismissChaoticAlert = useCallback(() => {
    setStoredChaoticAlertDismissed(true);
    setIsChaoticAlertDismissed(true);
  }, []);

  // Auto-Play controls (Mode Offensif Spectator)
  const toggleAutoPlay = useCallback(() => {
    if (botPersonality !== 'AGGRESSIVE') return;
    setIsAutoPlayActive((prev) => {
      const next = !prev;
      saveStoredAutoPlayEnabled(next);
      if (next) {
        playSound('chip');
        setStatusMessage(t('autoPlayActivatedStatus'));
      } else {
        playSound('chip');
        setStatusMessage(t('autoPlayDeactivatedStatus'));
      }
      return next;
    });
  }, [botPersonality, t]);

  const changeAutoPlayStrategy = useCallback((newStrategy: AutoPlayStrategy) => {
    setAutoPlayStrategy(newStrategy);
    saveStoredAutoPlayStrategy(newStrategy);
  }, []);

  const stopAutoPlay = useCallback(() => {
    setIsAutoPlayActive(false);
    saveStoredAutoPlayEnabled(false);
    playSound('chip');
    setStatusMessage(t('autoPlayDeactivatedStatus'));
  }, [t]);

  // Auto-Play execution loop for AGGRESSIVE mode (Spectator)
  useEffect(() => {
    if (!isAutoPlayActive || botPersonality !== 'AGGRESSIVE' || isProcessing) {
      return;
    }

    let timerId: ReturnType<typeof setTimeout> | null = null;
    const speedMult = gameSpeed === 'FAST' ? 0.5 : 1;

    // 1. SELECTION: Auto pick card according to strategy
    if (stage === 'SELECTION' && leftCard && rightCard) {
      const delayMs = 1200 * speedMult;
      timerId = setTimeout(() => {
        let chosenSide: CardPosition;
        if (autoPlayStrategy === 'LEFT') {
          chosenSide = 'LEFT';
        } else if (autoPlayStrategy === 'RIGHT') {
          chosenSide = 'RIGHT';
        } else {
          chosenSide = Math.random() < 0.5 ? 'LEFT' : 'RIGHT';
        }
        selectCard(chosenSide);
      }, delayMs);
    }

    // 2. JOKER_PHASE: Auto buy joker if possible or pass
    else if (stage === 'JOKER_PHASE') {
      const delayMs = 1000 * speedMult;
      timerId = setTimeout(() => {
        const isFree = stateRef.current.isMaxBet || jokerPrice === 0;
        const canAfford = isFree || (stateRef.current.playerPoints >= jokerPrice && jokerPrice > 0);
        if (stateRef.current.jokersUsedPlayer < maxJokers && canAfford) {
          buyPlayerJoker();
        } else {
          passJoker();
        }
      }, delayMs);
    }

    // 3. GAME_OVER: Auto replay next round
    else if (stage === 'GAME_OVER') {
      if (playerPoints > 0) {
        const delayMs = 1800 * speedMult;
        timerId = setTimeout(() => {
          const nextBet = Math.min(currentBet > 0 ? currentBet : 10, playerPoints);
          placeBet(nextBet);
        }, delayMs);
      } else {
        setIsAutoPlayActive(false);
        saveStoredAutoPlayEnabled(false);
        setStatusMessage(t('autoPlayPausedEmpty'));
      }
    }

    // 4. BETTING: Auto place bet if newly starting or returning
    else if (stage === 'BETTING') {
      if (playerPoints > 0) {
        const delayMs = 1100 * speedMult;
        timerId = setTimeout(() => {
          const nextBet = Math.min(currentBet > 0 ? currentBet : 10, playerPoints);
          placeBet(nextBet);
        }, delayMs);
      } else {
        setIsAutoPlayActive(false);
        saveStoredAutoPlayEnabled(false);
        setStatusMessage(t('autoPlayPausedEmpty'));
      }
    }

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [
    isAutoPlayActive,
    botPersonality,
    stage,
    isProcessing,
    autoPlayStrategy,
    gameSpeed,
    playerPoints,
    currentBet,
    leftCard,
    rightCard,
    jokerPrice,
    maxJokers,
    selectCard,
    buyPlayerJoker,
    passJoker,
    placeBet,
    t,
  ]);

  return {
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
    isChaoticMode,
    setIsChaoticMode,
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
    dismissTrophyToast: () => setUnlockedTrophyToast(null),
    isProcessing,
    placeBet,
    selectCard,
    buyPlayerJoker,
    passJoker,
    returnToBetting,
    resetGame,
    changeBotPersonality,
    toggleGameSpeed,
  };
};
