import React, { useState, useMemo } from 'react';
import { 
  Sliders, 
  Calculator, 
  Calendar, 
  Percent, 
  Check, 
  Info, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  TrendingDown
} from 'lucide-react';

export interface LoanConfiguratorWidgetProps {
  messageId: string;
  widgetData?: {
    loanType?: string;
    isPersonalLine?: boolean;
    minAmount?: number;
    maxAmount?: number;
    defaultAmount?: number;
    defaultTenure?: number;
    interestRate?: number;
    allowedTenures?: number[];
    bureauScore?: number;
    applicant?: string;
    totalLimit?: number;
    utilizedLimit?: number;
    remainingLimit?: number;
  };
  onProceedToConsent: (configuredData: {
    amount: number;
    tenure: string;
    tenureMonths: number;
    indicativeEMI: number;
    interestRate: string;
    totalInterest: number;
    totalPayable: number;
  }) => void;
  onOpenExplainability: (context?: string) => void;
}

export const LoanConfiguratorWidget: React.FC<LoanConfiguratorWidgetProps> = ({
  messageId,
  widgetData,
  onProceedToConsent,
  onOpenExplainability,
}) => {
  const isPersonalLine = widgetData?.isPersonalLine !== false && (!widgetData?.loanType || widgetData?.loanType.toLowerCase().includes('personal') || widgetData?.loanType.toLowerCase().includes('instant'));
  const minAmount = widgetData?.minAmount || (isPersonalLine ? 10000 : 100000);
  const maxAmount = widgetData?.maxAmount || (isPersonalLine ? 200000 : 1200000);
  const defaultAmount = Math.min(widgetData?.defaultAmount || (isPersonalLine ? 50000 : 800000), maxAmount);
  const defaultTenure = widgetData?.defaultTenure || (isPersonalLine ? 12 : 60);
  const annualRate = widgetData?.interestRate || (isPersonalLine ? 10.5 : 8.35);
  const allowedTenures = widgetData?.allowedTenures || (isPersonalLine ? [6, 12, 18, 24, 36, 48, 60] : [12, 24, 36, 48, 60, 84]);
  const totalLimit = widgetData?.totalLimit;
  const utilizedLimit = widgetData?.utilizedLimit || 0;

  const [amount, setAmount] = useState<number>(() => Math.min(Math.max(defaultAmount, minAmount), maxAmount));
  const [tenureMonths, setTenureMonths] = useState<number>(defaultTenure);

  // Accurate reducing balance EMI calculation
  const { emi, totalInterest, totalPayable } = useMemo(() => {
    if (amount <= 0 || tenureMonths <= 0) {
      return { emi: 0, totalInterest: 0, totalPayable: 0 };
    }
    const monthlyRate = annualRate / 12 / 100;
    const calculatedEmi = Math.round(
      (amount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
        (Math.pow(1 + monthlyRate, tenureMonths) - 1)
    );
    const calculatedTotalPayable = calculatedEmi * tenureMonths;
    const calculatedTotalInterest = Math.max(0, calculatedTotalPayable - amount);

    return {
      emi: calculatedEmi,
      totalInterest: calculatedTotalInterest,
      totalPayable: calculatedTotalPayable,
    };
  }, [amount, tenureMonths, annualRate]);

  // Preset Amount options strictly bounded by max eligible amount
  const presetAmounts = useMemo(() => {
    const candidates = [10000, 25000, 50000, 75000, 100000, 150000, 200000, 300000, 500000, 800000, 1000000, 1200000, 1500000, 2000000, 2500000];
    const filtered = candidates.filter((p) => p >= minAmount && p <= maxAmount);
    if (!filtered.includes(maxAmount) && maxAmount >= minAmount) {
      filtered.push(maxAmount);
      filtered.sort((a, b) => a - b);
    }
    return filtered.slice(0, 6);
  }, [minAmount, maxAmount]);

  const stepSize = maxAmount > 500000 ? 50000 : 10000;

  const handleStepAmount = (delta: number) => {
    setAmount((prev) => {
      const next = prev + delta;
      return Math.min(Math.max(next, minAmount), maxAmount);
    });
  };

  const handleProceed = () => {
    onProceedToConsent({
      amount: Math.min(amount, maxAmount),
      tenure: `${tenureMonths} months`,
      tenureMonths,
      indicativeEMI: emi,
      interestRate: `${annualRate}% p.a.`,
      totalInterest,
      totalPayable,
    });
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
            <Calculator className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-200 block">
              {widgetData?.loanType || 'Customize Loan'} Amount & Tenure
            </span>
            <span className="text-[11px] text-teal-300 font-medium">
              Eligible Limit Available: ₹{maxAmount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-medium self-start sm:self-auto">
          <Sparkles className="w-3 h-3 text-teal-400" />
          <span>{annualRate}% p.a. Special Rate</span>
        </div>
      </div>

      {/* Credit Line Status Bar if personal line */}
      {isPersonalLine && utilizedLimit > 0 && totalLimit && (
        <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <span className="text-slate-400">
            Pre-approved Line: <strong className="text-slate-200">₹{totalLimit.toLocaleString('en-IN')}</strong>
          </span>
          <span className="text-amber-400 font-medium">
            Active Loans: <strong>₹{utilizedLimit.toLocaleString('en-IN')}</strong>
          </span>
          <span className="text-teal-300 font-bold">
            Max Selectable: <strong>₹{maxAmount.toLocaleString('en-IN')}</strong>
          </span>
        </div>
      )}

      {!isPersonalLine && (
        <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-[11px]">
          <span className="text-slate-300 font-medium">
            Independent Asset Loan Facility
          </span>
          <span className="text-teal-400 font-semibold">
            Zero impact on personal line
          </span>
        </div>
      )}

      {/* Main Configuration Card */}
      <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-5">
        {/* 1. AMOUNT SELECTOR */}
        <div className="space-y-2.5">
          <div className="flex items-baseline justify-between">
            <div>
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-teal-400" />
                <span>Select Loan Amount</span>
              </label>
              <span className="text-[10px] text-slate-500">Max capped at eligible limit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleStepAmount(-stepSize)}
                disabled={amount <= minAmount}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 font-bold text-xs flex items-center justify-center cursor-pointer transition-colors"
                title={`Decrease ₹${stepSize.toLocaleString('en-IN')}`}
              >
                -
              </button>
              <span className="text-lg sm:text-xl font-extrabold text-teal-300 font-display min-w-[110px] text-right">
                ₹{amount.toLocaleString('en-IN')}
              </span>
              <button
                type="button"
                onClick={() => handleStepAmount(stepSize)}
                disabled={amount >= maxAmount}
                className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 font-bold text-xs flex items-center justify-center cursor-pointer transition-colors"
                title={`Increase ₹${stepSize.toLocaleString('en-IN')}`}
              >
                +
              </button>
            </div>
          </div>

          {/* Amount Range Slider */}
          <div className="pt-1">
            <input
              type="range"
              min={minAmount}
              max={maxAmount}
              step={stepSize}
              value={amount}
              onChange={(e) => {
                const val = Number(e.target.value);
                setAmount(Math.min(Math.max(val, minAmount), maxAmount));
              }}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400 focus:outline-none"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>Min: ₹{minAmount.toLocaleString('en-IN')}</span>
              <span className="text-teal-400 font-semibold">Max Eligible: ₹{maxAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Quick Preset Amount Pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {presetAmounts.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(Math.min(preset, maxAmount))}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                  amount === preset
                    ? 'bg-teal-500 text-slate-950 font-bold shadow-sm shadow-teal-500/20'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                ₹{preset >= 100000 ? `${(preset / 100000).toFixed(preset % 100000 === 0 ? 0 : 1)}L` : `${preset / 1000}k`}
                {preset === maxAmount && <span className="ml-1 text-[9px] opacity-80">(Max)</span>}
              </button>
            ))}
          </div>
        </div>

        {/* 2. TENURE SELECTOR */}
        <div className="space-y-2.5 pt-2 border-t border-slate-900">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-400" />
              <span>Select Repayment Tenure</span>
            </label>
            <span className="text-xs font-bold text-slate-200">
              {tenureMonths} Months ({Math.floor(tenureMonths / 12) > 0 ? `${Math.floor(tenureMonths / 12)} yr ` : ''}{tenureMonths % 12 > 0 ? `${tenureMonths % 12} mo` : ''})
            </span>
          </div>

          {/* Tenure Selection Pills */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
            {allowedTenures.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTenureMonths(t)}
                className={`py-2 px-1 rounded-xl text-center text-xs transition-all cursor-pointer ${
                  tenureMonths === t
                    ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20 ring-1 ring-teal-400'
                    : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800/90'
                }`}
              >
                <span className="block font-bold">{t}</span>
                <span className="block text-[9px] opacity-80 uppercase tracking-tighter">Months</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. DYNAMIC CALCULATED EMI & REPAYMENT SUMMARY */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-teal-950/40 via-slate-900 to-slate-950 border border-teal-500/30 space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-teal-800/30">
            <div>
              <span className="text-[11px] text-teal-300/80 font-medium block">
                Calculated Monthly EMI
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight text-teal-300">
                  ₹{emi.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-400">/month</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Interest Rate</span>
              <span className="text-xs font-bold text-teal-300">{annualRate}% p.a.</span>
              <span className="text-[10px] text-slate-500 block">Reducing Balance</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[11px] pt-0.5">
            <div>
              <span className="text-slate-400 block text-[10px]">Principal</span>
              <span className="font-semibold text-slate-200">₹{amount.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Total Interest</span>
              <span className="font-semibold text-slate-200">₹{totalInterest.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Total Payable</span>
              <span className="font-semibold text-slate-200">₹{totalPayable.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-teal-300/90 pt-2 border-t border-teal-900/30">
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3 text-teal-400" />
              <span>Zero Processing Fees</span>
            </span>
            <span>Instant Credit to Savings ••••8832</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          onClick={handleProceed}
          className="flex-1 min-w-[200px] py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
        >
          <Check className="w-4 h-4" />
          <span>Accept EMI of ₹{emi.toLocaleString('en-IN')}/mo & Proceed →</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenExplainability('Instant Personal Loan Customization')}
          className="px-3.5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <Info className="w-3.5 h-3.5 text-teal-400" />
          <span>Why this rate?</span>
        </button>
      </div>
    </div>
  );
};
