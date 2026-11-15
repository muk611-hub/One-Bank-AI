import React from 'react';
import { User, Cpu, Zap, CreditCard, Landmark, CheckCircle2, RotateCcw, ShieldCheck, Heart } from 'lucide-react';
import { CustomerProfile } from '../types';

interface CustomerProfileMemoryProps {
  customer: CustomerProfile;
  setCustomer: React.Dispatch<React.SetStateAction<CustomerProfile>>;
  onOpenExplainability: () => void;
}

export const CustomerProfileMemory: React.FC<CustomerProfileMemoryProps> = ({
  customer,
  setCustomer,
  onOpenExplainability,
}) => {
  const preferredWifeBen = customer.beneficiaries.find(
    (b) => b.id === customer.preferences.preferredBeneficiaryWifeId
  );

  const handleClearWifePreference = () => {
    setCustomer((prev) => ({
      ...prev,
      beneficiaries: prev.beneficiaries.map((b) => ({ ...b, isPrimary: false })),
      preferences: {
        ...prev.preferences,
        preferredBeneficiaryWifeId: null,
      },
    }));
  };

  const handleSetPrimaryWife = (benId: string) => {
    setCustomer((prev) => ({
      ...prev,
      beneficiaries: prev.beneficiaries.map((b) => ({ ...b, isPrimary: b.id === benId })),
      preferences: {
        ...prev.preferences,
        preferredBeneficiaryWifeId: benId,
      },
    }));
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-4">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
            <Cpu className="w-5 h-5 text-teal-400" />
            <span>Customer Profile & AI Memory</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Simulated conversational context and persistent customer preferences
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          <span>Zero Credential Exposure • Simulated Preferences Only</span>
        </div>
      </div>

      {/* Grid of Profile Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Section 1: Customer Master Credentials */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
            <User className="w-4 h-4" />
            <span>Master Profile</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <span className="text-slate-400">Customer Name</span>
              <strong className="text-slate-100">{customer.name}</strong>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <span className="text-slate-400">Customer ID</span>
              <strong className="text-slate-200 font-mono">{customer.customerId}</strong>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <span className="text-slate-400">Relationship Tenure</span>
              <strong className="text-teal-300 font-semibold">{customer.relationshipYears}+ Years</strong>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
              <span className="text-slate-400">Bureau Score</span>
              <strong className="text-teal-300 font-bold font-mono">{customer.bureauScore} (Excellent)</strong>
            </div>
          </div>
        </div>

        {/* Section 2: AI Memory - Beneficiary Preferences */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              <span>Remembered Beneficiary Preferences</span>
            </div>
            {preferredWifeBen && (
              <button
                onClick={handleClearWifePreference}
                className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                title="Reset wife preference so AI asks again"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Memory</span>
              </button>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs text-slate-400">
              When you say <em>“Send ₹5,000 to my wife”</em>, AI automatically selects your primary remembered preference:
            </p>

            {customer.beneficiaries.map((ben) => (
              <div
                key={ben.id}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                  ben.id === customer.preferences.preferredBeneficiaryWifeId
                    ? 'bg-teal-950/30 border-teal-500/40'
                    : 'bg-slate-950/80 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">{ben.bankName}</span>
                    {ben.id === customer.preferences.preferredBeneficiaryWifeId && (
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-medium">
                        Primary Default
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Account: {ben.accountNumber} • {ben.holderName}
                  </p>
                </div>

                {ben.id !== customer.preferences.preferredBeneficiaryWifeId && (
                  <button
                    onClick={() => handleSetPrimaryWife(ben.id)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] cursor-pointer"
                  >
                    Set Default
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Existing External Liabilities (Simulated Bureau) */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
            <Landmark className="w-4 h-4" />
            <span>Simulated Bureau Liability Intelligence</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {customer.existingLoans.map((loan) => (
              <div key={loan.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{loan.name}</span>
                  <span className="text-teal-300 font-mono font-semibold">{loan.currentRate}% p.a.</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">{loan.lender}</p>
                <div className="flex justify-between pt-2 mt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <span>Outstanding: ₹{loan.outstandingAmount.toLocaleString('en-IN')}</span>
                  <span>EMI: ₹{loan.currentEMI.toLocaleString('en-IN')}/mo</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Card Preferences */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
            <CreditCard className="w-4 h-4" />
            <span>Payment Instruments</span>
          </div>

          <div className="space-y-2 text-xs">
            {customer.creditCards.map((card) => (
              <div
                key={card.id}
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  card.isPreferred
                    ? 'bg-teal-950/20 border-teal-500/30'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{card.cardName}</span>
                    {card.isPreferred && (
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-medium">
                        Default Card
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{card.cardNumber}</p>
                </div>
                <span className="text-slate-300 font-mono font-semibold">
                  Limit: ₹{(card.limit / 100000).toFixed(1)}L
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
