/**
 * ALETOREX - Complete Game Rules & Strategy Modal
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Sparkles, Layers, Swords, Award, Radio, Zap, ZapOff, Flame, Dices } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  const { t, activeLanguage } = useLanguage();

  if (!isOpen) return null;

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
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {t('rulesTitle')}
                </h3>
                <p className="text-xs text-amber-400 font-medium">
                  {t('rulesSubtitle')}
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

          {/* Content Scrollable */}
          <div className="overflow-y-auto pr-1 space-y-4 py-3 text-xs sm:text-sm">
            {/* 1. Objectif */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-2 font-bold text-amber-400 mb-1.5 text-sm">
                <Award className="w-4 h-4" />
                <span>{t('rulesObjective')}</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {t('rulesObjectiveDesc')}
              </p>
            </div>

            {/* 2. Déroulement d'une manche */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-2 font-bold text-cyan-400 mb-2 text-sm">
                <Layers className="w-4 h-4" />
                <span>{t('rulesRoundFlow')}</span>
              </div>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                  <span>{t('rulesStep1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                  <span>{t('rulesStep2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                  <span>{t('rulesStep3')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">4</span>
                  <span>{t('rulesStep4')}</span>
                </li>
              </ul>
            </div>

            {/* 3. Les Jokers & Tarification Dynamique */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-purple-950/40 via-slate-950 to-slate-900 border border-purple-800/40">
              <div className="flex items-center gap-2 font-bold text-purple-300 mb-2 text-sm">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>{t('rulesJokersTitle')}</span>
              </div>
              <p className="text-slate-300 leading-relaxed mb-2">
                {t('rulesJokersDesc')}
              </p>

              {/* Joker counts per profile */}
              <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                <div className="p-2 rounded-lg bg-slate-950/90 border border-slate-800 text-center">
                  <div className="text-base">⚖️</div>
                  <div className="font-bold text-[11px] text-purple-300">{t('botTactician')}</div>
                  <div className="text-xs font-black text-amber-400">1 Joker</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/90 border border-slate-800 text-center">
                  <div className="text-base">⚔️</div>
                  <div className="font-bold text-[11px] text-purple-300">{t('botAggressive')}</div>
                  <div className="text-xs font-black text-amber-400">2 Jokers</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/90 border border-slate-800 text-center">
                  <div className="text-base">🛡️</div>
                  <div className="font-bold text-[11px] text-purple-300">{t('botCautious')}</div>
                  <div className="text-xs font-black text-amber-400">3 Jokers</div>
                </div>
              </div>

              <div className="space-y-1.5 p-2.5 rounded-lg bg-slate-950 border border-purple-700/50 text-purple-200">
                <p>
                  {t('rulesJokerPriceDesc')}
                </p>
                <p className="text-emerald-300 font-bold">
                  {t('rulesAllInBonus')}
                </p>
              </div>
            </div>

            {/* 4. TACTICIEN : Switch Mode Zéro */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-cyan-950/60 via-slate-950 to-blue-950/40 border border-cyan-500/50">
              <div className="flex items-center gap-2 font-bold text-cyan-300 mb-1.5 text-sm">
                <ZapOff className="w-4 h-4 text-cyan-400" />
                <span>4. ⚖️ Tacticien : {t('zeroJokerModeTitle')}</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Activez l'interrupteur <strong className="text-cyan-300">{t('zeroJokerModeTitle')}</strong> pour désactiver complètement le Joker. Vous et le Tacticien disputez un duel direct à 0 Joker, basé uniquement sur le tirage pur.
              </p>
            </div>

            {/* 5. OFFENSIF : Switch Mode Aléatoire / Auto-Play */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-red-950/60 via-slate-950 to-amber-950/40 border border-red-500/50">
              <div className="flex items-center gap-2 font-bold text-red-300 mb-1.5 text-sm">
                <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                <span>5. ⚔️ Offensif : {t('randomModeTitle')} ({t('spectatorModeTitle')})</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Activez l'interrupteur <strong className="text-red-300">{t('randomModeTitle')}</strong> pour lancer le mode automatique / spectateur. Choisissez votre stratégie de tirage (Aléatoire 50/50, Carte Gauche ou Carte Droite).
              </p>
            </div>

            {/* 6. STRATÈGE : Switch Mode Chaotique */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-purple-950/60 via-slate-950 to-pink-950/40 border border-purple-500/50">
              <div className="flex items-center gap-2 font-bold text-pink-300 mb-1.5 text-sm">
                <Flame className="w-4 h-4 text-pink-400" />
                <span>6. 🛡️ Stratège : {t('chaoticModeTitle')}</span>
              </div>
              <p className="text-slate-300 leading-relaxed mb-1.5">
                Activez l'interrupteur <strong className="text-pink-300">{t('chaoticModeTitle')}</strong> pour affronter la mise secrète de l'adversaire dévoilée en fin de manche.
              </p>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-purple-800/60 text-purple-200 text-xs space-y-1">
                <div>• <strong>3 premières parties de la journée</strong> : la mise adverse secrète est comprise entre <strong>0 et 10 000 points</strong>.</div>
                <div>• <strong>À partir de la 4ème partie (illimité)</strong> : la plage évolue sans restriction de <strong>-10 000 à +10 000 points</strong> !</div>
              </div>
            </div>

            {/* 7. Conseils Stratégiques */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-2 font-bold text-emerald-400 mb-1.5 text-sm">
                <Swords className="w-4 h-4" />
                <span>7. {t('rulesTips')}</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {t('rulesTipsDesc')}
              </p>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm cursor-pointer shadow-md"
            >
              {t('closeButton')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
