/**
 * ALETOREX - Language Selection Modal
 * Allows switching between French, English, Haitian Creole, Spanish, or Auto System Language.
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Check, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { LANGUAGE_OPTIONS, LanguageSetting } from '../utils/i18n';
import { playSound } from '../utils/audio';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({ isOpen, onClose }) => {
  const { languageSetting, systemLanguage, setLanguageSetting, t } = useLanguage();

  if (!isOpen) return null;

  const handleSelect = (code: LanguageSetting) => {
    playSound('click');
    setLanguageSetting(code);
    onClose();
  };

  const getSystemLanguageName = () => {
    switch (systemLanguage) {
      case 'fr':
        return 'Français (🇫🇷)';
      case 'en':
        return 'English (🇺🇸)';
      case 'ht':
        return 'Kreyòl Ayisyen (🇭🇹)';
      case 'es':
        return 'Español (🇪🇸)';
      default:
        return 'Français (🇫🇷)';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          className="relative w-full max-w-md bg-slate-900 border-2 border-amber-500/40 rounded-2xl shadow-2xl p-5 overflow-hidden text-slate-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">{t('languageModalTitle')}</h3>
                <p className="text-xs text-amber-400 font-medium">{t('languageModalSubtitle')}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                playSound('click');
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Language Options List */}
          <div className="py-4 space-y-2">
            {LANGUAGE_OPTIONS.map((option) => {
              const isSelected = languageSetting === option.code;
              const isAuto = option.code === 'auto';

              return (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => handleSelect(option.code)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-amber-400/15 border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.2)] text-amber-200'
                      : 'bg-slate-950/70 border-slate-800 hover:bg-slate-800/80 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl select-none">{option.flag}</span>
                    <div>
                      <div className="font-bold text-sm flex items-center gap-2">
                        <span>{option.nativeName}</span>
                        {isAuto && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                            Auto
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        {isAuto
                          ? `${t('systemDetected')} ${getSystemLanguageName()}`
                          : option.label}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end">
            <button
              type="button"
              onClick={() => {
                playSound('click');
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              {t('close')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
