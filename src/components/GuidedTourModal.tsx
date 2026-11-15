import React, { useState, useEffect } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  ShieldCheck,
  CreditCard,
  Building,
  TrendingDown
} from 'lucide-react';

interface GuidedTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToChat: (initialPrompt?: string) => void;
}

interface TourStep {
  title: string;
  category: string;
  customerQuery: string;
  aiExplanation: string;
  keyFeature: string;
  widgetDetails?: any;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'The AI Front Door',
    category: 'Concept & Philosophy',
    customerQuery: '“Hi Mukesh. How can I help you today?”',
    aiExplanation: 'The customer is greeted by an intelligent orchestration layer. No product tiles, no nested menus, no complex navigation.',
    keyFeature: 'Zero Menu Navigation • Intent First',
  },
  {
    title: 'Instant Personal Loan Offer',
    category: 'Lending Without Forms',
    customerQuery: '“I need a personal loan.”',
    aiExplanation: 'The AI checks customer history (12 yrs), bureau score (782), and pre-approved limit of ₹2,00,000 (Two Lacs). It immediately structures an instant offer without asking which product category.',
    keyFeature: 'No Application Forms • Zero Documents',
    widgetDetails: {
      type: 'LOAN',
      amount: '₹50,000',
      tenure: '12 Months',
      emi: '₹4,409',
      status: 'Instant Disbursal Pre-Approved',
    }
  },
  {
    title: 'Amount & Tenure EMI Customizer',
    category: 'Dynamic Structuring',
    customerQuery: '“Accept Offer & Select Amount/Tenure”',
    aiExplanation: 'Customer can interactively adjust loan amount (up to ₹2,00,000 line) and tenure (6 to 60 mos). The AI dynamically computes exact reducing-balance monthly EMI in real time.',
    keyFeature: 'Live Reducing-Balance EMI • Zero Hidden Charges',
    widgetDetails: {
      type: 'LOAN',
      amount: '₹50,000 (Adjustable to ₹2,00,000)',
      tenure: '6 to 60 Months',
      emi: '₹4,409 / month',
      status: 'Customized in Real-Time',
    }
  },
  {
    title: '1-Tap Consent & Instant Credit',
    category: 'Execution',
    customerQuery: '“Confirm Terms & Disburse”',
    aiExplanation: 'Customer gives biometric/e-consent in 1 tap. Funds are immediately credited to savings account with reference TXN-PL-204845.',
    keyFeature: 'Review → Consent → Authenticate → Done',
    widgetDetails: {
      type: 'SUCCESS',
      title: '₹50,000 Credited Successfully',
      ref: 'TXN-PL-204845',
      time: 'In 3 seconds',
    }
  },
  {
    title: 'Beneficiary Memory',
    category: 'Intelligent Payments',
    customerQuery: '“Transfer ₹5,000 to my wife.”',
    aiExplanation: 'AI checks remembered preferences. If first time, it asks once and saves the primary account. Next time, it transfers instantly without asking for IFSC or account numbers.',
    keyFeature: 'Contextual Customer Memory • Zero Repetition',
    widgetDetails: {
      type: 'TRANSFER',
      to: 'Mrs. Bansal (Wife)',
      bank: 'HDFC Bank (XXXX1234)',
      amount: '₹5,000',
    }
  },
  {
    title: 'Natural Bill Settlement',
    category: 'Utilities & Cards',
    customerQuery: '“Pay my Airtel bill using my credit card.”',
    aiExplanation: 'AI fetches the pending Airtel postpaid bill (₹1,249) and auto-selects preferred ONE Signature Metal Card ending 4521 for 1-tap settlement.',
    keyFeature: 'Multi-Product Orchestration',
    widgetDetails: {
      type: 'BILL',
      biller: 'Airtel Postpaid',
      amount: '₹1,249',
      card: 'Signature Metal Card ending 4521',
    }
  },
  {
    title: 'Proactive Balance Transfer',
    category: 'High-Value Savings',
    customerQuery: '“My home loan EMI is too high.”',
    aiExplanation: 'AI inspects external bureau data, detects a ₹42L loan at 8.75% with another bank, and calculates an 8.10% switch saving ₹2,300 every month (₹3.31L total!).',
    keyFeature: 'Proactive Intelligence • ₹2,300/mo Savings',
    widgetDetails: {
      type: 'HOME_LOAN',
      existing: '8.75% (₹46,500/mo)',
      proposed: '8.10% (₹44,200/mo)',
      savings: '₹2,300/month',
    }
  },
  {
    title: 'The AI-Native Banking Future',
    category: 'Vision Achieved',
    customerQuery: '“One Customer. One AI Interface. Every Banking Journey.”',
    aiExplanation: 'From auto loans and tractors to daily payments and high-value refinancing—the customer just tells the bank what they need. The bank figures out the journey.',
    keyFeature: 'Ask → Understand → Check → Offer → Consent → Done',
  }
];

export const GuidedTourModal: React.FC<GuidedTourModalProps> = ({
  isOpen,
  onClose,
  onJumpToChat,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto-advance slideshow if playing
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < TOUR_STEPS.length - 1) {
          return prev + 1;
        } else {
          setIsPlaying(false);
          return prev;
        }
      });
    }, 6000);

    return () => clearInterval(timer);
  }, [isOpen, isPlaying]);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setIsPlaying(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl shadow-black/80 relative overflow-hidden flex flex-col justify-between">
        
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-blue-600 flex items-center justify-center font-bold text-slate-950 text-xs font-display">
              1
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white font-display">
                Experience the Future of Banking
              </h2>
              <p className="text-[11px] text-slate-400">
                Step {currentStep + 1} of {TOUR_STEPS.length}: {step.category}
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

        {/* Step Progress Indicators */}
        <div className="grid grid-cols-7 gap-1.5 my-4">
          {TOUR_STEPS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentStep(idx);
                setIsPlaying(false);
              }}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentStep
                  ? 'bg-teal-400'
                  : idx < currentStep
                  ? 'bg-teal-800'
                  : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Content Box */}
        <div className="py-3 space-y-4">
          <div>
            <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">
              {step.title}
            </span>
            <div className="mt-2 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <p className="text-xs text-slate-400 mb-1">Customer Input / Intent:</p>
              <p className="text-base sm:text-lg font-semibold text-white font-display">
                {step.customerQuery}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
            <p className="text-xs text-slate-400 mb-1">How AI Solves This:</p>
            <p className="text-sm text-slate-200 leading-relaxed">
              {step.aiExplanation}
            </p>
          </div>

          {/* Widget preview if applicable */}
          {step.widgetDetails && (
            <div className="p-3 rounded-xl bg-teal-950/20 border border-teal-500/30 flex items-center justify-between text-xs">
              {step.widgetDetails.type === 'LOAN' && (
                <>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Pre-Approved Line</span>
                    <strong className="text-teal-300 text-sm">{step.widgetDetails.amount}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">EMI</span>
                    <strong className="text-slate-200">{step.widgetDetails.emi}/mo</strong>
                  </div>
                </>
              )}
              {step.widgetDetails.type === 'SUCCESS' && (
                <div className="flex items-center gap-2 text-teal-300 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  <span>{step.widgetDetails.title} • {step.widgetDetails.ref}</span>
                </div>
              )}
              {step.widgetDetails.type === 'TRANSFER' && (
                <div>
                  <span className="text-slate-400 block text-[10px]">Recognized Beneficiary</span>
                  <span className="text-slate-200 font-semibold">{step.widgetDetails.to} • {step.widgetDetails.bank}</span>
                </div>
              )}
              {step.widgetDetails.type === 'BILL' && (
                <div>
                  <span className="text-slate-400 block text-[10px]">Auto-Prepared Bill Payment</span>
                  <span className="text-slate-200 font-semibold">{step.widgetDetails.biller} ({step.widgetDetails.amount}) via {step.widgetDetails.card}</span>
                </div>
              )}
              {step.widgetDetails.type === 'HOME_LOAN' && (
                <div className="flex items-center justify-between w-full">
                  <div>
                    <span className="text-slate-400 text-[10px]">Rate Reduction</span>
                    <p className="text-teal-300 font-bold">{step.widgetDetails.existing} → {step.widgetDetails.proposed}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px]">Monthly Benefit</span>
                    <p className="text-teal-300 font-bold">{step.widgetDetails.savings}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-teal-300 font-medium pt-1">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Key Difference: {step.keyFeature}</span>
          </div>
        </div>

        {/* Controls Footer */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <button
              onClick={handleRestart}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
              title="Restart Tour"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {currentStep < TOUR_STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-md shadow-teal-500/20"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onJumpToChat('I need a personal loan');
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-teal-500/30"
              >
                <span>Try Live in Chat</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
