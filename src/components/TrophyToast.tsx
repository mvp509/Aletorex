/**
 * ALETOREX - Real-time Trophy Unlock Toast Notification
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Sparkles, X } from 'lucide-react';
import { Trophy } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslationKey } from '../utils/i18n';

interface TrophyToastProps {
  trophy: Trophy | null;
  onDismiss: () => void;
}

export const TrophyToast: React.FC<TrophyToastProps> = ({ trophy, onDismiss }) => {
  const { t } = useLanguage();

  const getTrophyTitle = (tItem: Trophy) => {
    const key = `trophy_${tItem.id}_title` as TranslationKey;
    const translated = t(key);
    return translated !== key ? translated : tItem.title;
  };

  const getTrophyDesc = (tItem: Trophy) => {
    const key = `trophy_${tItem.id}_desc` as TranslationKey;
    const translated = t(key);
    return translated !== key ? translated : tItem.description;
  };

  return (
    <AnimatePresence>
      {trophy && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.9 }}
          className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md pointer-events-auto"
        >
          <div className="relative rounded-2xl bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-2 border-amber-400 p-3.5 sm:p-4 shadow-[0_0_30px_rgba(251,191,36,0.6)] flex items-center gap-3 overflow-hidden backdrop-blur-md">
            {/* Ambient Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-2xl shrink-0 shadow-lg border border-amber-200">
              {trophy.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-400">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('trophyUnlocked')}</span>
                <Sparkles className="w-3 h-3 text-amber-300 animate-spin" />
              </div>
              <div className="text-sm font-extrabold text-white truncate">
                {getTrophyTitle(trophy)}
              </div>
              <div className="text-xs text-slate-300 line-clamp-1">
                {getTrophyDesc(trophy)}
              </div>
            </div>

            {/* Dismiss */}
            <button
              type="button"
              onClick={onDismiss}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              title={t('closeButton')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

