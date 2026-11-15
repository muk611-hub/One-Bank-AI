import React from 'react';
import { X, Network, Cpu, Database, ShieldCheck, CheckCircle2, ArrowRight, UserCheck, Layers, Server } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl shadow-black/80 relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-display">
                How This Works — AI Orchestration Layer
              </h2>
              <p className="text-xs text-slate-400">
                AI is the front-door intelligence; core banking remains secure behind it
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diagram Flow */}
        <div className="py-6 space-y-6">
          
          {/* Layer 1: Customer */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Level 1</span>
                <h4 className="text-sm font-bold text-slate-100">Customer Intent First</h4>
                <p className="text-xs text-slate-400">Customer states intent in plain language: <em>“I need a loan”</em>, <em>“Send ₹5k to wife”</em></p>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-400">Voice / Natural Text</span>
          </div>

          <div className="flex justify-center -my-3">
            <div className="w-0.5 h-6 bg-teal-500/50" />
          </div>

          {/* Layer 2: AI Interface & Intent Orchestrator */}
          <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
                <Cpu className="w-4 h-4" />
                <span>Level 2: AI Orchestrator & Contextual Memory</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono">
                Real-Time NLP & Routing
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Interprets intent without asking for specific product codes. Retrieves remembered beneficiary preferences, checks context history, and queries banking subsystems in parallel.
            </p>
          </div>

          <div className="flex justify-center -my-3">
            <div className="w-0.5 h-6 bg-teal-500/50" />
          </div>

          {/* Layer 3: Subsystem Core Engines */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <Database className="w-3.5 h-3.5 text-teal-400" />
                <span>CRM & Profile</span>
              </div>
              <p className="text-[11px] text-slate-400">12-year history, existing loans, account balances.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>BRE & Bureau</span>
              </div>
              <p className="text-[11px] text-slate-400">Score 782, external home loan detection, policy checks.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <Server className="w-3.5 h-3.5 text-teal-400" />
                <span>Product Engines</span>
              </div>
              <p className="text-[11px] text-slate-400">Auto pricing, EMI computation, instant pre-approvals.</p>
            </div>
          </div>

          <div className="flex justify-center -my-3">
            <div className="w-0.5 h-6 bg-teal-500/50" />
          </div>

          {/* Layer 4: Consent & Secure Execution */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">Level 4</span>
                <h4 className="text-sm font-bold text-slate-100">Review → Consent → Core Execution</h4>
                <p className="text-xs text-slate-400">User provides 1-tap consent; Core banking books transaction / disbursal instantly.</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-teal-400">Final Action</span>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            “The customer tells the bank what they need. The bank figures out the journey.”
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
