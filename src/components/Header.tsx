import React from 'react';
import { 
  Sparkles, 
  PlayCircle, 
  Network, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Clock, 
  Tag, 
  User, 
  Cpu
} from 'lucide-react';
import { CustomerProfile } from '../types';
import { VoiceLanguage } from '../services/speechService';

interface HeaderProps {
  customer: CustomerProfile;
  activeTab: 'chat' | 'activity' | 'offers' | 'memory' | 'security';
  setActiveTab: (tab: 'chat' | 'activity' | 'offers' | 'memory' | 'security') => void;
  onOpenGuidedTour: () => void;
  onOpenArchitecture: () => void;
  onResetDemo: () => void;
  speechEnabled: boolean;
  setSpeechEnabled: (val: boolean) => void;
  voiceLanguage: VoiceLanguage;
  onChangeVoiceLanguage: (lang: VoiceLanguage) => void;
}

export const Header: React.FC<HeaderProps> = ({
  customer,
  activeTab,
  setActiveTab,
  onOpenGuidedTour,
  onOpenArchitecture,
  onResetDemo,
  speechEnabled,
  setSpeechEnabled,
  voiceLanguage,
  onChangeVoiceLanguage,
}) => {
  const primaryAccount = customer.accounts.find((a) => a.isPrimary) || customer.accounts[0];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo & Brand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                id="btn-nav-home-logo"
                onClick={() => setActiveTab('chat')}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-blue-600 flex items-center justify-center shadow-md shadow-teal-500/20 font-bold text-base text-slate-950 font-display transition-transform hover:scale-105 cursor-pointer"
              >
                1
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold tracking-tight text-lg text-white font-display">ONE</span>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30">
                    AI Banking
                  </span>
                  <span className="hidden sm:inline-block text-[11px] text-slate-400 border-l border-slate-800 pl-2">
                    Just Tell the Bank.
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-1.5 md:hidden">
              <div
                className="inline-flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-[10px] font-semibold"
                title="Voice Language"
              >
                <button
                  type="button"
                  onClick={() => onChangeVoiceLanguage('en')}
                  className={`px-1.5 py-1 rounded-md cursor-pointer transition-colors ${
                    voiceLanguage === 'en'
                      ? 'bg-teal-500 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => onChangeVoiceLanguage('hi')}
                  className={`px-1.5 py-1 rounded-md cursor-pointer transition-colors ${
                    voiceLanguage === 'hi'
                      ? 'bg-teal-500 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  हिं
                </button>
              </div>
              <button
                id="btn-mobile-guided-tour"
                onClick={onOpenGuidedTour}
                className="p-1.5 rounded-lg bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs flex items-center gap-1 font-medium"
              >
                <PlayCircle className="w-4 h-4" />
                <span className="text-[11px]">Demo</span>
              </button>
              <button
                id="btn-mobile-reset"
                onClick={onResetDemo}
                title="Reset Demo State"
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Desktop Center Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Guided Tour Launcher */}
            <button
              id="btn-header-experience-future"
              onClick={onOpenGuidedTour}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-500 via-teal-400 to-blue-500 hover:from-teal-400 hover:to-blue-400 text-slate-950 font-bold text-xs tracking-wide shadow-md shadow-teal-500/20 flex items-center gap-1.5 transition-all hover:scale-102 cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Experience Future of Banking</span>
            </button>

            {/* Architecture Modal */}
            <button
              id="btn-header-how-it-works"
              onClick={onOpenArchitecture}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Network className="w-3.5 h-3.5 text-teal-400" />
              <span>How this Works</span>
            </button>

            {/* Voice Audio Toggle + English / Hindi Language Selector */}
            <div className="flex items-center gap-1.5">
              <button
                id="btn-header-toggle-audio"
                onClick={() => setSpeechEnabled(!speechEnabled)}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  speechEnabled 
                    ? 'bg-teal-950/40 border-teal-500/40 text-teal-300' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-300'
                }`}
                title={speechEnabled ? 'AI Voice readout enabled' : 'AI Voice readout muted'}
              >
                {speechEnabled ? <Volume2 className="w-3.5 h-3.5 text-teal-400" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span className="text-[11px]">{speechEnabled ? 'Voice On' : 'Voice Off'}</span>
              </button>

              <div
                className="inline-flex items-center rounded-xl bg-slate-900 border border-slate-800 p-0.5 text-[11px] font-semibold"
                role="group"
                aria-label="Voice Language"
              >
                <button
                  id="btn-header-voice-en"
                  type="button"
                  onClick={() => onChangeVoiceLanguage('en')}
                  className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                    voiceLanguage === 'en'
                      ? 'bg-teal-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Indian English Female Voice"
                >
                  EN
                </button>
                <button
                  id="btn-header-voice-hi"
                  type="button"
                  onClick={() => onChangeVoiceLanguage('hi')}
                  className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                    voiceLanguage === 'hi'
                      ? 'bg-teal-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Hindi Female Voice"
                >
                  हिंदी
                </button>
              </div>
            </div>

            {/* Reset Demo */}
            <button
              id="btn-header-reset-demo"
              onClick={onResetDemo}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 transition-colors cursor-pointer"
              title="Reset Demo & Beneficiary Preferences"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="text-[11px]">Reset Demo</span>
            </button>
          </div>

          {/* Customer Profile Pill */}
          <div className="flex items-center justify-between md:justify-end gap-3 text-xs">
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-teal-400 flex items-center justify-center text-[11px] font-bold text-white">
                MB
              </div>
              <div className="text-left leading-tight">
                <p className="font-semibold text-slate-200">{customer.name}</p>
                <p className="text-[10px] text-slate-400">
                  {primaryAccount.currency}{primaryAccount.balance.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="hidden lg:block pl-2 border-l border-slate-800">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 font-mono">
                  CIBIL {customer.bureauScore}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <nav className="mt-3 pt-2 border-t border-slate-900 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          <button
            id="tab-ai-banking"
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Banking</span>
          </button>

          <button
            id="tab-activity"
            onClick={() => setActiveTab('activity')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'activity'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Activity</span>
          </button>

          <button
            id="tab-offers"
            onClick={() => setActiveTab('offers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'offers'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Pre-Approved Offers</span>
          </button>

          <button
            id="tab-memory"
            onClick={() => setActiveTab('memory')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'memory'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Customer Memory & Profile</span>
          </button>

          <button
            id="tab-security"
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'security'
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Security Layer</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
