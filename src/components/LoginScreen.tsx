import React, { useState } from 'react';
import { ShieldCheck, Smartphone, Fingerprint, Lock, CheckCircle2, ArrowRight, Sparkles, Cpu, Volume2 } from 'lucide-react';
import { CustomerProfile } from '../types';
import { speechService } from '../services/speechService';

interface LoginScreenProps {
  customer: CustomerProfile;
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ customer, onLoginSuccess }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStep, setAuthStep] = useState<'idle' | 'biometric' | 'verified'>('idle');

  const handleAuthenticate = () => {
    // Unlock browser audio context and pre-warm natural Indian female welcome voice
    speechService.unlockAudio();
    speechService.prefetch('Hi Mukesh, how can I assist you today?');
    setIsAuthenticating(true);
    setAuthStep('biometric');
    
    // Smooth simulated biometric recognition
    setTimeout(() => {
      setAuthStep('verified');
      setTimeout(() => {
        onLoginSuccess();
      }, 600);
    }, 1100);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar / Branding */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-blue-600 flex items-center justify-center shadow-lg shadow-teal-500/20 font-bold text-lg text-slate-950 font-display">
            1
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-xl text-white font-display">ONE</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-medium border border-teal-500/30">
                AI Banking
              </span>
            </div>
            <p className="text-xs text-slate-400">Just Tell the Bank.</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          <span>Next-Gen Security Simulation</span>
        </div>
      </header>

      {/* Center Auth Card */}
      <main className="max-w-md w-full mx-auto my-auto z-10 py-6">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/80 shadow-inner mb-4 relative group">
              {authStep === 'verified' ? (
                <CheckCircle2 className="w-8 h-8 text-teal-400 animate-bounce" />
              ) : authStep === 'biometric' ? (
                <Fingerprint className="w-8 h-8 text-teal-300 animate-pulse" />
              ) : (
                <Smartphone className="w-8 h-8 text-teal-400" />
              )}
              {authStep === 'biometric' && (
                <span className="absolute inset-0 rounded-2xl border-2 border-teal-400 animate-ping opacity-30" />
              )}
            </div>

            <h1 className="text-2xl font-bold text-white font-display tracking-tight">
              Welcome back, {customer.name.split(' ')[0]}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              One Customer • One AI Interface • Every Banking Journey
            </p>
          </div>

          {/* Customer & Device Credentials Box */}
          <div className="space-y-3 mb-6">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Registered Mobile</p>
                  <p className="text-sm font-semibold text-slate-200 tracking-wider font-mono">
                    {customer.mobile}
                  </p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                ID: {customer.customerId}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-teal-950/30 border border-teal-800/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-300">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-teal-300/80">Device Recognition</p>
                  <p className="text-xs font-medium text-teal-200">
                    Trusted Device Enclave Detected
                  </p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-xs text-teal-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
              <span>Relationship: <strong className="text-slate-200">{customer.relationshipYears}+ years</strong></span>
              <span>Bureau Score: <strong className="text-teal-300 font-semibold">{customer.bureauScore} CIBIL</strong></span>
            </div>
          </div>

          {/* Action Button */}
          <button
            id="btn-login-authenticate"
            onClick={handleAuthenticate}
            disabled={isAuthenticating}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-slate-950 font-semibold text-sm tracking-wide transition-all shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-80"
          >
            {authStep === 'biometric' ? (
              <>
                <Fingerprint className="w-4 h-4 animate-spin text-slate-950" />
                <span>Verifying Biometric Token...</span>
              </>
            ) : authStep === 'verified' ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>Device Authenticated</span>
              </>
            ) : (
              <>
                <span>Continue Securely</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>

          {/* Security Note */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 text-center">
            <Lock className="w-3 h-3 text-slate-500" />
            <span>AI orchestrates journeys. Security controls remain mandatory.</span>
          </div>
        </div>
      </main>

      {/* Paradigm shift visual footer */}
      <footer className="max-w-4xl mx-auto w-full text-center z-10">
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-widest text-teal-400 font-semibold mb-1">
            The Paradigm Shift
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 line-through text-slate-500">
              <span>Search</span> → <span>Menu</span> → <span>Product</span> → <span>Forms</span> → <span>Uploads</span>
            </div>
            <span className="hidden sm:inline text-teal-400 font-bold">vs</span>
            <div className="flex items-center gap-1.5 text-teal-300 font-medium">
              <span>Ask</span> → <span>Intelligence</span> → <span>Offer</span> → <span>Consent</span> → <span>Done</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
