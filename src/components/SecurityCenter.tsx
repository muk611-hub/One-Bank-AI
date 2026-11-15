import React from 'react';
import { ShieldCheck, Lock, Smartphone, Key, Fingerprint, FileText, CheckCircle2, AlertTriangle, EyeOff } from 'lucide-react';
import { CustomerProfile } from '../types';

interface SecurityCenterProps {
  customer: CustomerProfile;
}

export const SecurityCenter: React.FC<SecurityCenterProps> = ({ customer }) => {
  return (
    <div className="max-w-4xl mx-auto w-full space-y-4">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <span>Security Layer & Transaction Guardrails</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            AI can assist and orchestrate. Security controls remain mandatory.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-teal-300 bg-teal-950/30 px-3 py-1.5 rounded-xl border border-teal-800/40">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>Device Enclave Authenticated</span>
        </div>
      </div>

      {/* Security Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
            <Smartphone className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-200">1. Trusted Device Token</h4>
          <p className="text-xs text-slate-400">
            Hardware-bound cryptographic secure enclave token bound to registered mobile <strong>{customer.mobile}</strong>.
          </p>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-teal-300 font-mono border border-slate-800 block">
            ID: DEV-8832-TOK-VALID
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Fingerprint className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-200">2. Single-Tap E-Consent</h4>
          <p className="text-xs text-slate-400">
            All lending disbursals and high-value transfers mandate explicit cryptographic user consent prior to core banking execution.
          </p>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-blue-300 font-mono border border-slate-800 block">
            Mandatory Human-in-the-Loop
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <EyeOff className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-200">3. Zero Secret Exposure</h4>
          <p className="text-xs text-slate-400">
            The AI engine never sees or exposes CVVs, ATM PINs, OTPs, or unmasked account credentials.
          </p>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-emerald-300 font-mono border border-slate-800 block">
            PCI-DSS & RBI Guideline Compliant
          </span>
        </div>

      </div>

      {/* Live Guardrails Table */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider">
          Active Security Policies & Limits
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
            <span className="text-slate-400">Daily Conversational Transfer Limit:</span>
            <strong className="text-slate-200">₹1,00,000 / day</strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
            <span className="text-slate-400">Instant Pre-Approved Loan Cap:</span>
            <strong className="text-slate-200">₹5,00,000</strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
            <span className="text-slate-400">Anti-Fraud Anomaly Filter:</span>
            <strong className="text-teal-300 font-semibold">Active & Monitoring</strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
            <span className="text-slate-400">Audit Trail Retention:</span>
            <strong className="text-slate-200">10 Years Immutable</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
