/**
 * ALETOREX - Secure Reset Confirmation Modal with PIN Protection
 * 
 * Flow:
 * 1. Checks if a user PIN exists.
 *    - If NO PIN: Prompts user to create a 4-6 digit PIN.
 *    - If PIN exists: Displays PIN entry prompt (supports user PIN and secret emergency master code).
 * 2. Compares entered PIN using SHA-256 (Master code is verified via secure hash).
 * 3. Once PIN is validated: Displays final irreversible confirmation popup before clearing data.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  X,
  RotateCcw,
  KeyRound,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { playSound } from '../utils/audio';
import {
  hasStoredPin,
  saveUserPin,
  verifyPinOrMaster,
} from '../utils/security';
import { useLanguage } from '../contexts/LanguageContext';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: () => void;
}

type ResetStep = 'ENTER_PIN' | 'CREATE_PIN' | 'FINAL_CONFIRM';

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmReset,
}) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<ResetStep>('ENTER_PIN');
  const [inputPin, setInputPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPinText, setShowPinText] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [shakeError, setShakeError] = useState(0);

  // Initialize or reset internal states on open
  useEffect(() => {
    if (isOpen) {
      const pinExists = hasStoredPin();
      setStep(pinExists ? 'ENTER_PIN' : 'CREATE_PIN');
      setInputPin('');
      setNewPin('');
      setConfirmPin('');
      setErrorMessage(null);
      setShowPinText(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle PIN Creation
  const handleCreatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPin = newPin.trim();
    const cleanConfirm = confirmPin.trim();

    if (!/^\d{4,6}$/.test(cleanPin)) {
      setErrorMessage(t('pinLengthError'));
      setShakeError((s) => s + 1);
      return;
    }

    if (cleanPin !== cleanConfirm) {
      setErrorMessage(t('pinMismatchError'));
      setShakeError((s) => s + 1);
      return;
    }

    const saved = await saveUserPin(cleanPin);
    if (saved) {
      playSound('chip');
      // Transition directly to final confirmation step
      setStep('FINAL_CONFIRM');
    } else {
      setErrorMessage("Erreur d'enregistrement.");
    }
  };

  // Handle PIN Validation
  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanInput = inputPin.trim();
    if (!cleanInput) {
      setErrorMessage(t('enterPinPrompt'));
      setShakeError((s) => s + 1);
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyPinOrMaster(cleanInput);
      if (result.valid) {
        playSound('chip');
        setErrorMessage(null);
        setStep('FINAL_CONFIRM');
      } else {
        setErrorMessage(t('incorrectPinError'));
        setShakeError((s) => s + 1);
        playSound('error');
      }
    } catch {
      setErrorMessage('Erreur.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Final Action Confirmation
  const handleExecuteReset = () => {
    playSound('chip');
    onConfirmReset();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          className="relative w-full max-w-md bg-slate-950 border-2 border-rose-500/60 rounded-3xl shadow-2xl p-5 sm:p-6 overflow-hidden flex flex-col text-slate-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
                {step === 'FINAL_CONFIRM' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <Lock className="w-5 h-5 text-amber-400" />
                )}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {step === 'CREATE_PIN' && t('createPinTitle')}
                  {step === 'ENTER_PIN' && t('enterPinTitle')}
                  {step === 'FINAL_CONFIRM' && t('resetGame')}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  {step === 'FINAL_CONFIRM'
                    ? t('irreversibleAction')
                    : t('resetTitle')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* STEP 1: CREATE PIN IF NONE EXISTS */}
          {step === 'CREATE_PIN' && (
            <form onSubmit={handleCreatePin} className="py-4 space-y-4 text-xs sm:text-sm">
              <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200/90 leading-relaxed text-xs">
                🛡️ {t('createPinDesc')}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {t('newPinLabel')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPinText ? 'text' : 'password'}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={newPin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setNewPin(val);
                        setErrorMessage(null);
                      }}
                      placeholder="••••"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-center tracking-widest text-lg focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPinText((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showPinText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {t('confirmPinLabel')}
                  </label>
                  <input
                    type={showPinText ? 'text' : 'password'}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={confirmPin}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setConfirmPin(val);
                      setErrorMessage(null);
                    }}
                    placeholder="••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-center tracking-widest text-lg focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>

              {/* Error Box */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    key={`create-pin-error-${shakeError}`}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-semibold"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs cursor-pointer shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t('savePinButton')}</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: ENTER EXISTING PIN OR EMERGENCY MASTER CODE */}
          {step === 'ENTER_PIN' && (
            <form onSubmit={handleVerifyPin} className="py-4 space-y-4 text-xs sm:text-sm">
              <div className="text-slate-300 leading-relaxed text-xs">
                {t('enterPinPrompt')}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {t('pinCodeLabel')}
                </label>
                <div className="relative">
                  <input
                    type={showPinText ? 'text' : 'password'}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={8}
                    value={inputPin}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 8);
                      setInputPin(val);
                      setErrorMessage(null);
                    }}
                    placeholder="••••"
                    className="w-full px-3.5 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white font-mono text-center tracking-[0.4em] text-xl focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPinText((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPinText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Box */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    key={`verify-pin-error-${shakeError}`}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-300 text-xs font-semibold"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isVerifying || inputPin.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs cursor-pointer shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isVerifying ? t('validating') : t('validatePinButton')}</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: FINAL IRREVERSIBLE CONFIRMATION */}
          {step === 'FINAL_CONFIRM' && (
            <div className="py-4 space-y-3.5 text-xs sm:text-sm">
              <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-200 font-bold leading-relaxed text-xs">
                ⚠️ <span className="underline">{t('resetWarning')}</span>
              </div>

              <p className="text-slate-300 leading-relaxed text-xs">
                {t('resetDesc')}
              </p>

              <ul className="space-y-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 text-slate-300 text-xs">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span>{t('resetItemBalance')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span>{t('resetItemStats')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span>{t('resetItemHistory')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span>{t('resetItemTrophies')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span>{t('resetItemBank')}</span>
                </li>
              </ul>

              {/* Actions */}
              <div className="pt-3.5 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleExecuteReset}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs cursor-pointer shadow-lg shadow-rose-900/40 flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('resetConfirmButton')}</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
