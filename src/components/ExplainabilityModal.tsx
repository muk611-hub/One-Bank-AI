import React from 'react';
import { X, Info, CheckCircle2, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { CustomerProfile } from '../types';

interface ExplainabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  contextTitle?: string;
  customer: CustomerProfile;
}

export const ExplainabilityModal: React.FC<ExplainabilityModalProps> = ({
  isOpen,
  onClose,
  contextTitle = 'General Financial Recommendation',
  customer,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl shadow-black/80 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                Why am I seeing this offer?
              </h3>
              <p className="text-xs text-slate-400">{contextTitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Factors */}
        <div className="py-4 space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed">
            This recommendation is personalized based on your verified banking relationship data, external liability records, and credit profile:
          </p>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200 block">12+ Years Flawless History with ONE Bank</strong>
                <span className="text-slate-400">Zero default instances, consistent average quarterly balance over ₹2,40,000.</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200 block">Bureau Rating: {customer.bureauScore} (CIBIL Prime)</strong>
                <span className="text-slate-400">Qualifies in the top 5% risk tier, unlocking our lowest tier interest rates.</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200 block">Liability & EMI Headroom Analysis</strong>
                <span className="text-slate-400">Existing vehicle loan maturing in 2 months; external home loan eligible for substantial interest savings.</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-teal-950/20 border border-teal-500/20 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
            <span>Privacy Guard: No raw financial models or third-party advertising cookies are used.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs cursor-pointer transition-all shadow-md shadow-teal-500/20"
          >
            Got it
          </button>
        </div>

      </div>
    </div>
  );
};
