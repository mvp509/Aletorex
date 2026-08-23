/**
 * ALETOREX - Mobile & Tablet React Native / Expo Component
 *
 * Spécifications appliquées :
 * 1. Safe Area Insets via `react-native-safe-area-context` avec `paddingBottom: insets.bottom + 20`
 * 2. `ScrollView` fluide avec `contentContainerStyle` (flexGrow + zone tampon de sécurité)
 * 3. Responsive dynamique via `useWindowDimensions()` :
 *    - Mobile (< 600px) : FlexWrap, boutons tactiles, bouton principal ~90% de largeur
 *    - Tablette (>= 600px) : `maxWidth: 650`, centré (`alignSelf: 'center'`)
 * 4. Bouton Unique (+) dans l'en-tête regroupant :
 *    - Banque / Récompenses
 *    - Statistiques & Trophées
 *    - Règles du Jeu
 *    - Son (Activer/Couper)
 *    - Réinitialisation
 * 5. Pot interactif avec animation de tremblement (shake) lors d'une victoire, calcul dynamique et détail cliquable
 * 6. Formatage compact de la manche (k au-dessus de 999, M pour million) et suppression de la mention Série
 * 7. Zéro logos ou images sous copyright
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  Modal,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Types du jeu ALETOREX
type CardChoice = 'LEFT' | 'RIGHT';
type Winner = 'PLAYER' | 'BOT' | 'DRAW';
type GameStage = 'BETTING' | 'DEALING' | 'SELECTION' | 'REVEALED' | 'JOKER_PHASE' | 'GAME_OVER';

type BotPersonality = 'STANDARD' | 'AGGRESSIVE' | 'CAUTIOUS';

interface BotProfile {
  name: string;
  tagline: string;
  avatar: string;
  maxJokers: number;
}

const BOT_PROFILES: Record<BotPersonality, BotProfile> = {
  STANDARD: {
    name: 'TACTICIEN',
    tagline: 'Adversaire Équilibré',
    avatar: '⚖️',
    maxJokers: 1,
  },
  AGGRESSIVE: {
    name: 'OFFENSIF',
    tagline: 'Adversaire Téméraire',
    avatar: '⚔️',
    maxJokers: 2,
  },
  CAUTIOUS: {
    name: 'STRATÈGE',
    tagline: 'Adversaire Prudent',
    avatar: '🛡️',
    maxJokers: 3,
  },
};

const PRESET_BETS = [5, 10, 25, 50];

// Formatage des nombres en k et M (>999 -> k, 1M -> M)
const formatCompactNumber = (val: number): string => {
  if (val === null || val === undefined || isNaN(val)) return '0';
  if (val < 1000) return val.toString();
  if (val < 1000000) {
    const k = val / 1000;
    return k % 1 === 0 ? `${k}k` : `${k.toFixed(1).replace(/\.0$/, '')}k`;
  }
  const m = val / 1000000;
  return m % 1 === 0 ? `${m}M` : `${m.toFixed(1).replace(/\.0$/, '')}M`;
};

export const AletorexNativeApp: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  // Animation de tremblement (shake) du pot
  const potShakeAnim = useRef(new Animated.Value(0)).current;

  // Menu Modal (+)
  const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<'NONE' | 'BANK' | 'STATS' | 'RULES' | 'EDIT_NAME'>('NONE');
  const [isPotDetailsOpen, setIsPotDetailsOpen] = useState<boolean>(false);
  const [soundActive, setSoundActive] = useState<boolean>(true);

  // États du Jeu
  const [playerName, setPlayerName] = useState<string>('VOUS');
  const [nameInput, setNameInput] = useState<string>('VOUS');
  const [botPersonality, setBotPersonality] = useState<BotPersonality>('STANDARD');
  const [playerPoints, setPlayerPoints] = useState<number>(100);
  const [currentBet, setCurrentBet] = useState<number>(10);
  const [betInput, setBetInput] = useState<string>('10');
  const [stage, setStage] = useState<GameStage>('BETTING');

  const currentBot = BOT_PROFILES[botPersonality];
  const maxJokers = currentBot.maxJokers;

  const [leftCard, setLeftCard] = useState<number | null>(null);
  const [rightCard, setRightCard] = useState<number | null>(null);
  const [playerChoice, setPlayerChoice] = useState<CardChoice | null>(null);
  const [playerValue, setPlayerValue] = useState<number | null>(null);
  const [botValue, setBotValue] = useState<number | null>(null);

  const [jokersUsedPlayer, setJokersUsedPlayer] = useState<number>(0);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>(
    'Choisissez votre mise pour débuter la manche.'
  );
  const [roundCount, setRoundCount] = useState<number>(1);
  const [totalWins, setTotalWins] = useState<number>(0);

  const isMaxBet = currentBet >= playerPoints && playerPoints > 0;
  const safeBet = Math.max(0, currentBet || 0);
  const currentPotTotal = safeBet * 2;

  // Calcul du tarif Joker (50% de la mise, gratuit si All-In)
  const jokerPrice = useMemo(() => {
    if (isMaxBet) return 0;
    if (currentBet <= 0) return 0;
    const half = currentBet * 0.5;
    return Number.isInteger(half) ? half : Number(half.toFixed(1));
  }, [currentBet, isMaxBet]);

  const showJokerBadge = useMemo(() => {
    if (isMaxBet) return true;
    const remaining = playerPoints - currentBet;
    return playerPoints > 0 && remaining >= jokerPrice && jokerPrice > 0;
  }, [playerPoints, currentBet, jokerPrice, isMaxBet]);

  // Déclenchement de l'animation de tremblement (shake) lors d'une victoire
  const triggerPotShake = () => {
    potShakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(potShakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(potShakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(potShakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(potShakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(potShakeAnim, { toValue: -3, duration: 50, useNativeDriver: true }),
      Animated.timing(potShakeAnim, { toValue: 3, duration: 50, useNativeDriver: true }),
      Animated.timing(potShakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    if (winner === 'PLAYER') {
      triggerPotShake();
    }
  }, [winner]);

  // Synchronisation de l'input avec la mise
  const handleSelectPreset = (amount: number) => {
    const clamped = Math.min(amount, playerPoints);
    setCurrentBet(clamped);
    setBetInput(clamped.toString());
  };

  const handleAdjustBet = (delta: number) => {
    const next = Math.max(1, Math.min(playerPoints, currentBet + delta));
    setCurrentBet(next);
    setBetInput(next.toString());
  };

  const handleAllSolde = () => {
    if (playerPoints <= 0) return;
    setCurrentBet(playerPoints);
    setBetInput(playerPoints.toString());
  };

  const handleTextChange = (text: string) => {
    const clean = text.replace(/[^0-9]/g, '');
    setBetInput(clean);
    const parsed = parseInt(clean, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setCurrentBet(Math.min(playerPoints, parsed));
    }
  };

  // 1. Lancement de la mise et distribution
  const handlePlaceBet = () => {
    if (currentBet <= 0 || currentBet > playerPoints) return;
    setPlayerPoints((prev) => Math.max(0, prev - currentBet));
    setJokersUsedPlayer(0);
    setWinner(null);
    setPlayerChoice(null);
    setLeftCard(null);
    setRightCard(null);

    setStage('DEALING');
    setStatusMessage('Distribution des 2 cartes...');

    setTimeout(() => {
      const c1 = Math.floor(Math.random() * 10) + 1;
      const c2 = Math.floor(Math.random() * 10) + 1;
      setLeftCard(c1);
      setRightCard(c2);
      setStage('SELECTION');
      setStatusMessage('Choisissez votre carte : Gauche ou Droite !');
    }, 500);
  };

  // 2. Sélection d'une carte
  const handleSelectCard = (choice: CardChoice) => {
    if (stage !== 'SELECTION' || leftCard === null || rightCard === null) return;
    setPlayerChoice(choice);
    const pVal = choice === 'LEFT' ? leftCard : rightCard;
    const bVal = choice === 'LEFT' ? rightCard : leftCard;
    setPlayerValue(pVal);
    setBotValue(bVal);

    setStage('REVEALED');

    if (pVal > bVal) {
      // Victoire immédiate -> Tremblement du pot
      const gain = currentBet * 2;
      setPlayerPoints((prev) => prev + gain);
      setWinner('PLAYER');
      setTotalWins((prev) => prev + 1);
      setStage('GAME_OVER');
      setStatusMessage(`Victoire ! +${gain} pts remportés (${pVal} vs ${bVal})`);
      triggerPotShake();
    } else if (pVal < bVal) {
      // Défaite -> Joker Phase si le joueur peut se payer un joker ou s'il est en All-In
      const isFree = isMaxBet || jokerPrice === 0;
      const canAfford = isFree || (playerPoints >= jokerPrice && jokerPrice > 0);
      if (canAfford && maxJokers > 0) {
        setStage('JOKER_PHASE');
        setStatusMessage(
          isFree
            ? `Carte inférieure (${pVal} vs ${bVal}). Invoquez votre Joker GRATUIT (${maxJokers} offert${maxJokers > 1 ? 's' : ''} en All-In) ou acceptez la défaite.`
            : `Carte inférieure (${pVal} vs ${bVal}). Invoquez un Joker (${jokerPrice} pt) ou acceptez la défaite.`
        );
      } else {
        setWinner('BOT');
        setStage('GAME_OVER');
        setStatusMessage(`Défaite (${pVal} vs ${bVal}). Solde insuffisant pour un Joker.`);
      }
    } else {
      // Égalité
      setWinner('DRAW');
      setPlayerPoints((prev) => prev + currentBet);
      setStage('GAME_OVER');
      setStatusMessage(`Égalité parfaite (${pVal} = ${bVal}) ! Mise remboursée.`);
    }
  };

  // 3. Invocation d'un Joker
  const handleBuyJoker = () => {
    if (jokersUsedPlayer >= maxJokers || botValue === null || playerValue === null) return;
    const isFree = isMaxBet || jokerPrice === 0;
    if (!isFree && (playerPoints < jokerPrice || jokerPrice <= 0)) return;

    let updatedPts = playerPoints;
    if (!isFree && jokerPrice > 0) {
      updatedPts = Math.max(0, playerPoints - jokerPrice);
      setPlayerPoints(updatedPts);
    }

    const newJokersCount = jokersUsedPlayer + 1;
    setJokersUsedPlayer(newJokersCount);

    const newPVal = Math.floor(Math.random() * 10) + 1;
    setPlayerValue(newPVal);
    if (playerChoice === 'LEFT') setLeftCard(newPVal);
    else setRightCard(newPVal);

    if (newPVal > botValue) {
      const gain = currentBet * 2;
      setPlayerPoints((prev) => prev + gain);
      setWinner('PLAYER');
      setTotalWins((prev) => prev + 1);
      setStage('GAME_OVER');
      setStatusMessage(
        isFree
          ? `✦ Joker Gratuit (${newJokersCount}/${maxJokers}) Réussi ! Vous tirez un ${newPVal} et gagnez +${gain} pts !`
          : `✦ Joker (${newJokersCount}/${maxJokers}) Réussi ! Vous tirez un ${newPVal} et gagnez +${gain} pts !`
      );
      triggerPotShake();
    } else if (newPVal < botValue) {
      const canAffordNext = isFree || (updatedPts >= jokerPrice);
      if (newJokersCount < maxJokers && canAffordNext) {
        const isLast = newJokersCount === maxJokers - 1;
        setStatusMessage(
          isFree
            ? `Votre ${newPVal} reste inférieur au ${botValue}. ${isLast ? 'Dernier' : 'Autre'} Joker GRATUIT disponible !`
            : `Votre ${newPVal} reste inférieur au ${botValue}. ${isLast ? 'Dernier' : 'Autre'} Joker disponible (${jokerPrice} pt) !`
        );
      } else {
        setWinner('BOT');
        setStage('GAME_OVER');
        setStatusMessage(`Défaite (${newPVal} vs ${botValue}).`);
      }
    } else {
      setWinner('DRAW');
      setPlayerPoints((prev) => prev + currentBet);
      setStage('GAME_OVER');
      setStatusMessage(`Égalité sur Joker (${newPVal} = ${botValue}). Mise remboursée.`);
    }
  };

  // 4. Abandon / Passer le Joker
  const handlePassJoker = () => {
    setWinner('BOT');
    setStage('GAME_OVER');
    setStatusMessage(`Défaite acceptée (${playerValue} vs ${botValue}).`);
  };

  // 5. Relancer une manche
  const handleNextRound = () => {
    setRoundCount((prev) => prev + 1);
    setStage('BETTING');
    setLeftCard(null);
    setRightCard(null);
    setPlayerChoice(null);
    setWinner(null);
    setStatusMessage('Choisissez votre mise pour la manche suivante.');
  };

  // 6. Réinitialiser la partie
  const handleResetAll = () => {
    setPlayerPoints(100);
    setCurrentBet(10);
    setBetInput('10');
    setStage('BETTING');
    setLeftCard(null);
    setRightCard(null);
    setPlayerChoice(null);
    setWinner(null);
    setRoundCount(1);
    setTotalWins(0);
    setIsMenuVisible(false);
    setStatusMessage('Partie réinitialisée à 100 points.');
  };

  // Safe Area Bottom Buffer dynamique (+20px minimum)
  const dynamicPaddingBottom = insets.bottom + 20;

  return (
    <View style={[styles.rootContainer, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      {/* HEADER COMPACT AVEC BOUTON UNIQUE (+) */}
      <View style={styles.header}>
        {/* Titre texte épuré (sans couronne) */}
        <View style={styles.brandRow}>
          <Text style={styles.brandTitle}>ALETOREX</Text>
        </View>

        {/* Scores Badges */}
        <View style={styles.scoresRow}>
          <View style={styles.scoreBadgePlayer}>
            <Text style={styles.scoreLabel}>{playerName}</Text>
            <Text style={styles.scoreValuePlayer}>{playerPoints} ✦</Text>
          </View>
          <Text style={styles.vsText}>VS</Text>
          <View style={styles.scoreBadgeBot}>
            <Text style={styles.scoreLabel}>ADVERSAIRE</Text>
            <Text style={styles.scoreValueBot}>{currentBot.name}</Text>
          </View>
        </View>

        {/* Bouton Unique (+) Hub d'options */}
        <TouchableOpacity
          style={styles.plusMenuButton}
          onPress={() => setIsMenuVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.plusMenuText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* CONTENEUR PRINCIPAL SCROLLABLE (Tablette maxWidth 650, Mobile Responsive) */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            maxWidth: isTablet ? 650 : '100%',
            paddingBottom: dynamicPaddingBottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Ruban Info Manche & Sélecteur Profil */}
        <View style={styles.infoRibbon}>
          <Text style={styles.roundBadge}>Manche #{formatCompactNumber(roundCount)}</Text>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {(['STANDARD', 'AGGRESSIVE', 'CAUTIOUS'] as BotPersonality[]).map((p) => {
              const b = BOT_PROFILES[p];
              const isSelected = botPersonality === p;
              return (
                <React.Fragment key={p}>
                  <TouchableOpacity
                    disabled={stage !== 'BETTING'}
                    onPress={() => setBotPersonality(p)}
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 8,
                      backgroundColor: isSelected ? '#581c87' : '#0f172a',
                      borderWidth: 1,
                      borderColor: isSelected ? '#a855f7' : '#334155',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 3,
                    }}
                  >
                    <Text style={{ fontSize: 10 }}>{b.avatar}</Text>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: isSelected ? '#f3e8ff' : '#94a3b8' }}>
                      {b.name} ({b.maxJokers}J)
                    </Text>
                  </TouchableOpacity>
                </React.Fragment>
              );
            })}
          </View>
        </View>

        {/* TAPIS DE JEU DU CASINO */}
        <View style={styles.feltTable}>
          {/* Adversaire Profile */}
          <View style={styles.botProfileCard}>
            <Text style={styles.botAvatar}>{currentBot.avatar}</Text>
            <View>
              <Text style={styles.botName}>{currentBot.name} ({maxJokers} Joker{maxJokers > 1 ? 's' : ''})</Text>
              <Text style={styles.botSub}>{currentBot.tagline}</Text>
            </View>
          </View>

          {/* POT CENTRAL INTERACTIF AVEC SHAKE ANIMATION ET CALCUL DYNAMIQUE */}
          <Animated.View style={{ transform: [{ translateX: potShakeAnim }] }}>
            <TouchableOpacity
              style={[
                styles.potContainer,
                winner === 'PLAYER' && styles.potContainerWinning,
              ]}
              onPress={() => setIsPotDetailsOpen((prev) => !prev)}
              activeOpacity={0.85}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={styles.potIconBadge}>
                  <Text style={{ fontSize: 13 }}>🪙</Text>
                </View>
                <View style={{ alignItems: 'flex-start' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={styles.potLabel}>POT EN JEU</Text>
                    <View style={styles.potMultiplierBadge}>
                      <Text style={styles.potMultiplierText}>×2</Text>
                    </View>
                  </View>
                  <Text style={styles.potValueText}>
                    {formatCompactNumber(currentPotTotal)} <Text style={styles.potPtsText}>PTS</Text>
                  </Text>
                </View>
                <View style={styles.potInfoIcon}>
                  <Text style={{ fontSize: 10, color: '#fbbf24', fontWeight: '800' }}>ⓘ</Text>
                </View>
              </View>

              {/* Barre Calculatrice Directe (×2 Gagne/Perd) */}
              <View style={styles.potCalcRow}>
                <View style={styles.potWinTag}>
                  <Text style={styles.potWinTagText}>📈 Gagne : +{safeBet}</Text>
                </View>
                <View style={styles.potLossTag}>
                  <Text style={styles.potLossTagText}>📉 Perd : -{safeBet}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* CARTES DE JEU */}
          <View style={styles.cardsRow}>
            {/* Carte Gauche */}
            <TouchableOpacity
              style={[
                styles.cardBox,
                playerChoice === 'LEFT' && styles.cardSelected,
                stage === 'SELECTION' && styles.cardInteractive,
              ]}
              disabled={stage !== 'SELECTION'}
              onPress={() => handleSelectCard('LEFT')}
              activeOpacity={0.8}
            >
              <Text style={styles.cardHeader}>GAUCHE</Text>
              {leftCard !== null && stage !== 'DEALING' && stage !== 'SELECTION' ? (
                <Text style={styles.cardValueText}>{leftCard}</Text>
              ) : (
                <Text style={styles.cardBackSymbol}>A</Text>
              )}
              <Text style={styles.cardOwner}>
                {playerChoice === 'LEFT'
                  ? playerName
                  : playerChoice === 'RIGHT'
                  ? currentBot.name
                  : 'Tirer (Gauche)'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.cardVsText}>VS</Text>

            {/* Carte Droite */}
            <TouchableOpacity
              style={[
                styles.cardBox,
                playerChoice === 'RIGHT' && styles.cardSelected,
                stage === 'SELECTION' && styles.cardInteractive,
              ]}
              disabled={stage !== 'SELECTION'}
              onPress={() => handleSelectCard('RIGHT')}
              activeOpacity={0.8}
            >
              <Text style={styles.cardHeader}>DROITE</Text>
              {rightCard !== null && stage !== 'DEALING' && stage !== 'SELECTION' ? (
                <Text style={styles.cardValueText}>{rightCard}</Text>
              ) : (
                <Text style={styles.cardBackSymbol}>A</Text>
              )}
              <Text style={styles.cardOwner}>
                {playerChoice === 'RIGHT'
                  ? playerName
                  : playerChoice === 'LEFT'
                  ? currentBot.name
                  : 'Tirer (Droite)'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Message de Statut */}
          <View
            style={[
              styles.statusBox,
              winner === 'PLAYER' && styles.statusBoxWin,
              winner === 'BOT' && styles.statusBoxLose,
            ]}
          >
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>
        </View>

        {/* SECTION DES CONTRÔLES INTERACTIFS */}
        <View style={styles.controlsContainer}>
          {/* 1. ÉTAPE DE MISE (BETTING) */}
          {stage === 'BETTING' && (
            <View style={styles.betCard}>
              <View style={styles.betHeaderRow}>
                <Text style={styles.betTitle}>Choisissez votre mise :</Text>
                {showJokerBadge && (
                  <Text style={[styles.jokerTarifBadge, isMaxBet && styles.jokerTarifBadgeMax]}>
                    Tarif Joker :{' '}
                    {isMaxBet
                      ? `GRATUIT (${maxJokers} offert${maxJokers > 1 ? 's' : ''})`
                      : `${jokerPrice} pt${jokerPrice > 1 ? 's' : ''}`}
                  </Text>
                )}
              </View>

              {/* Boutons Rapides : 5 | 10 | 25 | 50 (FlexWrap 2 lignes sur mobile) */}
              <View style={styles.presetButtonsRow}>
                {[5, 10, 25, 50].map((amount) => {
                  const isSelected = currentBet === amount;
                  const isTooHigh = amount > playerPoints;
                  const btnStyle: any = [
                    styles.presetButton,
                    isSelected && styles.presetButtonSelected,
                    isTooHigh && styles.buttonDisabled,
                  ];
                  return React.createElement(
                    TouchableOpacity,
                    {
                      key: `preset-${amount}`,
                      style: btnStyle,
                      disabled: isTooHigh,
                      onPress: () => handleSelectPreset(amount),
                      activeOpacity: 0.7,
                    },
                    React.createElement(
                      Text,
                      {
                        style: [
                          styles.presetButtonText,
                          isSelected && styles.presetButtonTextSelected,
                        ],
                      },
                      `${amount} pts`
                    )
                  );
                })}
              </View>

              {/* Ligne d'ajustement : [-1] | [Input] | [+1] | [All solde] */}
              <View style={styles.stepperRow}>
                <TouchableOpacity
                  style={[styles.stepButton, currentBet <= 1 && styles.buttonDisabled]}
                  disabled={currentBet <= 1}
                  onPress={() => handleAdjustBet(-1)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.stepButtonText}>-1</Text>
                </TouchableOpacity>

                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.numericInput}
                    keyboardType="numeric"
                    value={betInput}
                    onChangeText={handleTextChange}
                    maxLength={5}
                  />
                  <Text style={styles.inputUnit}>pts</Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.stepButton,
                    currentBet >= playerPoints && styles.buttonDisabled,
                  ]}
                  disabled={currentBet >= playerPoints}
                  onPress={() => handleAdjustBet(1)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.stepButtonText}>+1</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.allSoldeButton,
                    isMaxBet && styles.allSoldeButtonActive,
                    playerPoints <= 0 && styles.buttonDisabled,
                  ]}
                  disabled={playerPoints <= 0}
                  onPress={handleAllSolde}
                  activeOpacity={0.7}
                >
                  <Text style={styles.allSoldeText}>All solde</Text>
                </TouchableOpacity>
              </View>

              {/* BOUTON D'ACTION PRINCIPAL : ~90% DE LARGEUR AVEC DEAD-ZONE */}
              <TouchableOpacity
                style={[
                  styles.mainActionButton,
                  (currentBet <= 0 || currentBet > playerPoints) && styles.buttonDisabled,
                ]}
                disabled={currentBet <= 0 || currentBet > playerPoints}
                onPress={handlePlaceBet}
                activeOpacity={0.8}
              >
                <Text style={styles.mainActionText}>
                  PARIER {currentBet} POINTS & TIRER
                </Text>
                {isMaxBet && (
                  <Text style={styles.mainActionSub}>
                    (All-In • {maxJokers} Joker{maxJokers > 1 ? 's' : ''} offert{maxJokers > 1 ? 's' : ''})
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* 2. PHASE JOKER (JOKER_PHASE) */}
          {stage === 'JOKER_PHASE' && (
            <View style={styles.jokerCard}>
              <Text style={styles.jokerTitle}>✦ CONTESTATION JOKER</Text>
              <Text style={styles.jokerDesc}>
                Votre carte est inférieure. Invoquez un Joker pour tirer une nouvelle carte !
              </Text>

              <View style={styles.jokerActionsRow}>
                <TouchableOpacity
                  style={[
                    styles.jokerBuyButton,
                    (!isMaxBet && playerPoints < jokerPrice) && styles.buttonDisabled,
                  ]}
                  disabled={!isMaxBet && playerPoints < jokerPrice}
                  onPress={handleBuyJoker}
                  activeOpacity={0.8}
                >
                  <Text style={styles.jokerBuyText}>
                    Invoquer Joker {isMaxBet ? '(GRATUIT)' : `(${jokerPrice} pt${jokerPrice > 1 ? 's' : ''})`}
                  </Text>
                  <Text style={styles.jokerSubText}>
                    {isMaxBet ? '✨ Offert (All-In)' : 'Utilisation'} : {jokersUsedPlayer}/{maxJokers}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.jokerPassButton}
                  onPress={handlePassJoker}
                  activeOpacity={0.7}
                >
                  <Text style={styles.jokerPassText}>Accepter la défaite</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 3. FIN DE MANCHE (GAME_OVER) */}
          {stage === 'GAME_OVER' && (
            <View style={styles.gameOverCard}>
              <TouchableOpacity
                style={[
                  styles.mainActionButton,
                  playerPoints <= 0 && styles.buttonDisabled,
                ]}
                disabled={playerPoints <= 0}
                onPress={handleNextRound}
                activeOpacity={0.8}
              >
                <Text style={styles.mainActionText}>MANCHE SUIVANTE</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* MODAL DÉTAILS DU POT */}
      <Modal
        visible={isPotDetailsOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsPotDetailsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsPotDetailsOpen(false)}
        >
          <View style={styles.infoModalBox}>
            <Text style={styles.infoModalTitle}>🧮 Calculatrice de Duel (×2)</Text>
            <View style={{ marginVertical: 10, gap: 6 }}>
              <Text style={styles.infoModalBody}>
                • Votre mise engagée : <Text style={{ color: '#34d399', fontWeight: 'bold' }}>+{safeBet} pts</Text>{'\n'}
                • Mise adverse ({currentBot.name}) : <Text style={{ color: '#f87171', fontWeight: 'bold' }}>+{safeBet} pts</Text>{'\n'}
                • Total du Pot en jeu : <Text style={{ color: '#fbbf24', fontWeight: 'bold' }}>{currentPotTotal} pts (×2)</Text>
              </Text>

              <View style={{ height: 1, backgroundColor: '#334155', marginVertical: 4 }} />

              <View style={{ backgroundColor: 'rgba(6, 78, 59, 0.4)', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#059669' }}>
                <Text style={{ color: '#6ee7b7', fontSize: 11, fontWeight: '700' }}>
                  📈 Si Victoire : +{safeBet} pts net ({currentPotTotal} pts remportés)
                </Text>
              </View>

              <View style={{ backgroundColor: 'rgba(136, 19, 55, 0.4)', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#e11d48' }}>
                <Text style={{ color: '#fda4af', fontSize: 11, fontWeight: '700' }}>
                  📉 Si Défaite : -{safeBet} pts (perte de la mise)
                </Text>
              </View>

              <View style={{ backgroundColor: 'rgba(30, 41, 59, 0.6)', padding: 6, borderRadius: 8, borderWidth: 1, borderColor: '#475569' }}>
                <Text style={{ color: '#cbd5e1', fontSize: 10 }}>
                  ⚖️ Si Égalité : 0 pt (mise restituée intégralement)
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setIsPotDetailsOpen(false)}
            >
              <Text style={styles.closeModalButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* MODAL DU MENU UNIQUE (+) */}
      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsMenuVisible(false)}
        >
          <View style={styles.menuDropdown}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>MENU RAPIDE (+)</Text>
              <TouchableOpacity onPress={() => setIsMenuVisible(false)}>
                <Text style={styles.menuCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setIsMenuVisible(false);
                setActiveModal('BANK');
              }}
            >
              <Text style={styles.menuItemText}>💰 Banque & Récompenses (+50 pts)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setNameInput(playerName);
                setIsMenuVisible(false);
                setActiveModal('EDIT_NAME');
              }}
            >
              <Text style={styles.menuItemText}>👤 Modifier mon nom ({playerName})</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setIsMenuVisible(false);
                setActiveModal('STATS');
              }}
            >
              <Text style={styles.menuItemText}>🏆 Statistiques & Trophées ({totalWins} Victoires)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setIsMenuVisible(false);
                setActiveModal('RULES');
              }}
            >
              <Text style={styles.menuItemText}>📖 Règles du Jeu & Tarifs Joker</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setSoundActive((prev) => !prev)}
            >
              <Text style={styles.menuItemText}>
                {soundActive ? '🔊 Effets Sonores (Activés)' : '🔇 Effets Sonores (Coupés)'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemReset]}
              onPress={handleResetAll}
            >
              <Text style={styles.menuItemResetText}>🔄 Réinitialiser le jeu</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* MODALES SECONDAIRES */}
      <Modal
        visible={activeModal !== 'NONE'}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActiveModal('NONE')}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.infoModalBox}>
            {activeModal === 'BANK' && (
              <View>
                <Text style={styles.infoModalTitle}>💰 Trésorerie & Banque</Text>
                <Text style={styles.infoModalBody}>
                  Besoin de points ? Obtenez une recharge de 50 points d'urgence.
                </Text>
                <TouchableOpacity
                  style={styles.actionModalButton}
                  onPress={() => {
                    setPlayerPoints((prev) => prev + 50);
                    setActiveModal('NONE');
                  }}
                >
                  <Text style={styles.actionModalButtonText}>Recharger +50 pts</Text>
                </TouchableOpacity>
              </View>
            )}

            {activeModal === 'STATS' && (
              <View>
                <Text style={styles.infoModalTitle}>🏆 Statistiques</Text>
                <Text style={styles.infoModalBody}>
                  Manches jouées : {formatCompactNumber(roundCount)}{'\n'}
                  Victoires : {totalWins}
                </Text>
              </View>
            )}

            {activeModal === 'RULES' && (
              <View>
                <Text style={styles.infoModalTitle}>📖 Règles du Jeu</Text>
                <Text style={styles.infoModalBody}>
                  • Deux cartes face cachée sont distribuées (1 à 10).{'\n'}
                  • Choisissez la carte la plus forte.{'\n'}
                  • Règles des Jokers par Adversaire :{'\n'}
                    - ⚖️ Tacticien : 1 Joker max{'\n'}
                    - ⚔️ Offensif : 2 Jokers max{'\n'}
                    - 🛡️ Stratège : 3 Jokers max{'\n'}
                  • Coût Joker : 50% de la mise.{'\n'}
                  • Mise Maximale (All-In) : Jokers 100% GRATUITS !
                </Text>
              </View>
            )}

            {activeModal === 'EDIT_NAME' && (
              <View>
                <Text style={styles.infoModalTitle}>👤 Modifier votre nom</Text>
                <TextInput
                  style={[
                    styles.numericInput,
                    {
                      width: '100%',
                      marginBottom: 14,
                      textAlign: 'left',
                      paddingHorizontal: 12,
                      fontSize: 14,
                    },
                  ]}
                  value={nameInput}
                  onChangeText={(t) => setNameInput(t.slice(0, 12))}
                  maxLength={12}
                  placeholder="Votre nom"
                  placeholderTextColor="#64748b"
                  autoFocus
                />
                <TouchableOpacity
                  style={styles.actionModalButton}
                  onPress={() => {
                    const clean = (nameInput.trim() || 'VOUS').slice(0, 12);
                    setPlayerName(clean);
                    setActiveModal('NONE');
                  }}
                >
                  <Text style={styles.actionModalButtonText}>Enregistrer</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setActiveModal('NONE')}
            >
              <Text style={styles.closeModalButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// FEUILLE DE STYLE REACT NATIVE NATIVE (StyleSheet.create)
const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#020617', // slate-950
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#090d16',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#fbbf24',
    letterSpacing: 1.5,
  },
  scoresRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreBadgePlayer: {
    backgroundColor: '#064e3b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#059669',
  },
  scoreLabel: {
    fontSize: 7,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  scoreValuePlayer: {
    fontSize: 11,
    fontWeight: '900',
    color: '#34d399',
  },
  vsText: {
    color: '#64748b',
    fontWeight: '900',
    fontSize: 9,
    marginHorizontal: 4,
  },
  scoreBadgeBot: {
    backgroundColor: '#4c0519',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e11d48',
  },
  scoreValueBot: {
    fontSize: 12,
    fontWeight: '900',
    color: '#fb7185',
  },
  plusMenuButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  plusMenuText: {
    color: '#fbbf24',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 22,
  },

  // SCROLLVIEW & LAYOUT
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  infoRibbon: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  roundBadge: {
    backgroundColor: '#0f172a',
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1e293b',
  },

  // CASINO FELT TABLE
  feltTable: {
    backgroundColor: '#064e3b',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#78350f',
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  botProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#020617',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e11d48',
    marginBottom: 6,
  },
  botAvatar: {
    fontSize: 14,
    marginRight: 5,
  },
  botName: {
    color: '#fda4af',
    fontSize: 10,
    fontWeight: '800',
  },
  botSub: {
    color: '#94a3b8',
    fontSize: 8,
  },
  potContainer: {
    backgroundColor: '#020617',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#f59e0b',
    marginBottom: 8,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  potContainerWinning: {
    borderColor: '#fde047',
    backgroundColor: '#451a03',
    shadowOpacity: 0.6,
  },
  potCalcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(245, 158, 11, 0.2)',
  },
  potWinTag: {
    backgroundColor: 'rgba(6, 78, 59, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#059669',
  },
  potWinTagText: {
    color: '#6ee7b7',
    fontSize: 9,
    fontWeight: '800',
  },
  potLossTag: {
    backgroundColor: 'rgba(136, 19, 55, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#e11d48',
  },
  potLossTagText: {
    color: '#fda4af',
    fontSize: 9,
    fontWeight: '800',
  },
  potIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#78350f',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  potLabel: {
    color: '#fbbf24',
    fontWeight: '900',
    fontSize: 9,
    letterSpacing: 1,
  },
  potMultiplierBadge: {
    backgroundColor: '#78350f',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: '#f59e0b',
  },
  potMultiplierText: {
    color: '#fef08a',
    fontSize: 8,
    fontWeight: '800',
  },
  potValueText: {
    color: '#fef08a',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 0.5,
    lineHeight: 18,
  },
  potPtsText: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: '700',
  },
  potInfoIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#475569',
    marginLeft: 4,
  },

  // CARDS
  cardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  cardBox: {
    width: 85,
    height: 110,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  cardInteractive: {
    borderColor: '#fbbf24',
    borderStyle: 'dashed',
  },
  cardSelected: {
    borderColor: '#34d399',
    backgroundColor: '#022c22',
  },
  cardHeader: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94a3b8',
  },
  cardValueText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fbbf24',
  },
  cardBackSymbol: {
    fontSize: 22,
    color: '#64748b',
  },
  cardOwner: {
    fontSize: 8,
    fontWeight: '700',
    color: '#e2e8f0',
  },
  cardVsText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#fbbf24',
    marginHorizontal: 10,
  },

  // STATUS BOX
  statusBox: {
    backgroundColor: '#020617',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginTop: 6,
    width: '100%',
  },
  statusBoxWin: {
    borderColor: '#10b981',
    backgroundColor: '#064e3b',
  },
  statusBoxLose: {
    borderColor: '#f43f5e',
    backgroundColor: '#4c0519',
  },
  statusText: {
    color: '#f8fafc',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },

  // CONTROLS CONTAINER
  controlsContainer: {
    width: '100%',
  },
  betCard: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 10,
  },
  betHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  betTitle: {
    color: '#e2e8f0',
    fontWeight: '800',
    fontSize: 11,
  },
  jokerTarifBadge: {
    color: '#c084fc',
    backgroundColor: '#3b0764',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 9,
    fontWeight: '800',
  },
  jokerTarifBadgeMax: {
    color: '#34d399',
    backgroundColor: '#064e3b',
    borderColor: '#059669',
    borderWidth: 1,
  },

  // PRESETS (FlexWrap sur mobile)
  presetButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  presetButton: {
    width: '23%',
    backgroundColor: '#020617',
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  presetButtonSelected: {
    backgroundColor: '#d97706',
    borderColor: '#fbbf24',
  },
  presetButtonText: {
    color: '#e2e8f0',
    fontSize: 10,
    fontWeight: '800',
  },
  presetButtonTextSelected: {
    color: '#020617',
  },

  // STEPPER ROW
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#020617',
    padding: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 8,
  },
  stepButton: {
    width: 38,
    height: 34,
    backgroundColor: '#1e293b',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '900',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  numericInput: {
    color: '#fbbf24',
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
    minWidth: 35,
    padding: 0,
  },
  inputUnit: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '700',
    marginLeft: 2,
  },
  allSoldeButton: {
    backgroundColor: '#064e3b',
    paddingHorizontal: 8,
    height: 34,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  allSoldeButtonActive: {
    backgroundColor: '#059669',
  },
  allSoldeText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '800',
  },

  // MAIN ACTION BUTTON (90% width, dead zone padding)
  mainActionButton: {
    width: '92%',
    alignSelf: 'center',
    backgroundColor: '#d97706',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  mainActionText: {
    color: '#020617',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  mainActionSub: {
    color: '#020617',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },

  // JOKER CONTROLS
  jokerCard: {
    backgroundColor: '#2e1065',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#9333ea',
    padding: 10,
    alignItems: 'center',
  },
  jokerTitle: {
    color: '#e9d5ff',
    fontWeight: '900',
    fontSize: 12,
    marginBottom: 2,
  },
  jokerDesc: {
    color: '#cbd5e1',
    fontSize: 9,
    textAlign: 'center',
    marginBottom: 8,
  },
  jokerActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  jokerBuyButton: {
    flex: 1,
    backgroundColor: '#7e22ce',
    borderRadius: 8,
    paddingVertical: 8,
    marginRight: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c084fc',
  },
  jokerBuyText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 10,
  },
  jokerSubText: {
    color: '#e9d5ff',
    fontSize: 8,
    marginTop: 2,
  },
  jokerPassButton: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingVertical: 8,
    marginLeft: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  jokerPassText: {
    color: '#94a3b8',
    fontWeight: '700',
    fontSize: 10,
  },

  // GAME OVER
  gameOverCard: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },

  // ÉTAT INACTIF DÉSACTIVÉ
  buttonDisabled: {
    opacity: 0.5,
  },

  // MODALES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  menuDropdown: {
    width: '85%',
    maxWidth: 320,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 14,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  menuTitle: {
    color: '#fbbf24',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  menuCloseText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: 'bold',
  },
  menuItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  menuItemText: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '700',
  },
  menuItemReset: {
    borderBottomWidth: 0,
    marginTop: 4,
  },
  menuItemResetText: {
    color: '#fb7185',
    fontSize: 11,
    fontWeight: '800',
  },
  infoModalBox: {
    width: '92%',
    maxWidth: 360,
    backgroundColor: '#020617',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#f59e0b',
    padding: 18,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  infoModalTitle: {
    color: '#fbbf24',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  infoModalBody: {
    color: '#f1f5f9',
    fontSize: 12,
    lineHeight: 20,
    marginBottom: 6,
  },
  actionModalButton: {
    backgroundColor: '#d97706',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  actionModalButtonText: {
    color: '#020617',
    fontSize: 11,
    fontWeight: '900',
  },
  closeModalButton: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
});

export default AletorexNativeApp;
