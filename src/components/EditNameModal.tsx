/**
 * ALETOREX - Edit Player Name Modal
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Check, X } from 'lucide-react';
import { playSound } from '../utils/audio';
import { useLanguage } from '../contexts/LanguageContext';

interface EditNameModalProps {
  isOpen: boolean;
  currentName: string;
  onSave: (newName: string) => void;
  onClose: () => void;
}

export const EditNameModal: React.FC<EditNameModalProps> = ({
  isOpen,
  currentName,
  onSave,
  onClose,
}) => {
  const { t } = useLanguage();
  const [name, setName] = useState(currentName);

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
    }
  }, [isOpen, currentName]);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanName = (name.trim() || t('you')).slice(0, 12);
    onSave(cleanName);
    playSound('chip');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 p-5 sm:p-6 shadow-[0_0_40px_rgba(251,191,36,0.15)] text-slate-100 z-10"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              aria-label={t('closeButton')}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 rounded-2xl bg-amber-400/10 border border-amber-500/30 text-amber-400">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-amber-300 font-serif">
                  {t('editNameTitle')}
                </h3>
                <p className="text-xs text-slate-400">
                  {t('editNameSubtitle')}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  {t('playerNameLabel')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value.slice(0, 12))}
                    maxLength={12}
                    placeholder={t('playerNamePlaceholder')}
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 focus:outline-none text-slate-100 font-bold placeholder-slate-600 transition-colors"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-colors cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm transition-all shadow-[0_0_15px_rgba(251,191,36,0.3)] flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>{t('save')}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
