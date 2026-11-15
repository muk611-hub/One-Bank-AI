import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  CreditCard, 
  Building, 
  Car, 
  Tractor, 
  Truck, 
  TrendingDown, 
  ShieldCheck, 
  Info, 
  RotateCcw, 
  Zap, 
  Lock, 
  UserCheck, 
  Check, 
  DollarSign,
  FileCheck,
  Volume2,
  VolumeX,
  Square,
  Play
} from 'lucide-react';
import { ChatMessage, CustomerProfile, ActivityItem } from '../types';
import { PROACTIVE_INSIGHTS, LENDING_OFFERS } from '../data/mockData';
import { LoanConfiguratorWidget } from './LoanConfiguratorWidget';
import { VoiceLanguage } from '../services/speechService';

interface AIChatInterfaceProps {
  customer: CustomerProfile;
  setCustomer: React.Dispatch<React.SetStateAction<CustomerProfile>>;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onSendMessage: (text: string) => Promise<void>;
  isProcessing: boolean;
  onAddActivity: (activity: ActivityItem) => void;
  onOpenExplainability: (context?: string) => void;
  onOpenArchitecture: () => void;
  speechEnabled: boolean;
  setSpeechEnabled: (enabled: boolean) => void;
  voiceLanguage: VoiceLanguage;
  onChangeVoiceLanguage: (lang: VoiceLanguage) => void;
  isAiSpeaking: boolean;
  speakingMsgId: string | null;
  onSpeakMessage: (text: string, id?: string) => void;
  onStopSpeech: () => void;
}

export const AIChatInterface: React.FC<AIChatInterfaceProps> = ({
  customer,
  setCustomer,
  messages,
  setMessages,
  onSendMessage,
  isProcessing,
  onAddActivity,
  onOpenExplainability,
  onOpenArchitecture,
  speechEnabled,
  setSpeechEnabled,
  voiceLanguage,
  onChangeVoiceLanguage,
  isAiSpeaking,
  speakingMsgId,
  onSpeakMessage,
  onStopSpeech,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [activeConsentChecked, setActiveConsentChecked] = useState(false);
  const [isVerifyingSecurity, setIsVerifyingSecurity] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing, isVerifyingSecurity]);

  // Voice Recognition setup (Web Speech API with graceful fallback)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = voiceLanguage === 'hi' ? 'hi-IN' : 'en-IN';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [voiceLanguage]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          // If already started or error, simulate voice input
          simulateVoiceInput();
        }
      } else {
        simulateVoiceInput();
      }
    }
  };

  const simulateVoiceInput = () => {
    setIsListening(true);
    const demoQueries = [
      'I need a personal loan.',
      'Transfer ₹5,000 to my wife.',
      'Pay my Airtel bill using my credit card.',
      'My home loan EMI is too high.',
      'I am exploring for an auto loan.',
      'I want to buy a tractor.',
      'What loans am I eligible for?'
    ];
    const randomQuery = demoQueries[Math.floor(Math.random() * demoQueries.length)];
    setTimeout(() => {
      setInputText(randomQuery);
      setIsListening(false);
    }, 1200);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    const text = inputText;
    setInputText('');
    await onSendMessage(text);
  };

  const handleQuickPrompt = async (prompt: string) => {
    if (isProcessing) return;
    await onSendMessage(prompt);
  };

  // --- INTERACTIVE ACTION HANDLERS ---

  // 1a. Loan: Proceed to Amount & Tenure Configurator
  const handlePLProceedToConfigurator = (msgId: string, widgetData: any) => {
    const isPersonalLine = widgetData?.isPersonalLine !== false && 
      (!widgetData?.loanType || widgetData?.loanType.toLowerCase().includes('personal') || widgetData?.loanType.toLowerCase().includes('instant'));

    let totalLimit: number | undefined;
    let utilizedLimit: number | undefined;
    let remainingLimit: number | undefined;
    let maxSelectable: number;
    let minSelectable: number;
    let defaultAmt: number;

    if (isPersonalLine) {
      totalLimit = customer.totalPreApprovedLimit || 200000;
      utilizedLimit = customer.utilizedPreApprovedLimit || 0;
      remainingLimit = Math.max(0, totalLimit - utilizedLimit);
      maxSelectable = Math.min(widgetData?.maxAmount || remainingLimit, remainingLimit);
      minSelectable = Math.min(widgetData?.minAmount || 10000, maxSelectable);
      defaultAmt = Math.min(widgetData?.amount || widgetData?.defaultAmount || maxSelectable, maxSelectable);
    } else {
      // Independent loans (Auto Loan, Tractor Finance, Commercial Vehicle Loan) have independent eligibility!
      maxSelectable = widgetData?.maxAmount || 1200000;
      minSelectable = widgetData?.minAmount || 100000;
      defaultAmt = Math.min(Math.max(widgetData?.amount || widgetData?.defaultAmount || 800000, minSelectable), maxSelectable);
    }

    const loanTitle = widgetData?.loanType || (isPersonalLine ? 'Personal Loan' : 'Asset Loan');

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === msgId
          ? {
              ...msg,
              text: isPersonalLine
                ? `Select your desired loan amount (up to your available limit of ₹${maxSelectable.toLocaleString('en-IN')}) and repayment tenure below to see your customized monthly EMI.`
                : `Select your desired ${loanTitle} amount (up to ₹${maxSelectable.toLocaleString('en-IN')}) and repayment tenure below to see your customized monthly EMI.`,
              widgetType: 'LOAN_CONFIGURATOR',
              widgetData: {
                loanType: loanTitle,
                isPersonalLine,
                minAmount: minSelectable,
                maxAmount: maxSelectable,
                totalLimit: isPersonalLine ? totalLimit : undefined,
                utilizedLimit: isPersonalLine ? utilizedLimit : 0,
                remainingLimit: isPersonalLine ? maxSelectable : undefined,
                defaultAmount: defaultAmt,
                defaultTenure: widgetData?.defaultTenure || (isPersonalLine ? 12 : 60),
                interestRate: widgetData?.interestRateNum || widgetData?.interestRate || (isPersonalLine ? 10.5 : 8.35),
                allowedTenures: widgetData?.allowedTenures || (isPersonalLine ? [6, 12, 18, 24, 36, 48, 60] : [12, 24, 36, 48, 60, 84]),
                bureauScore: customer.bureauScore,
                applicant: customer.name,
              },
            }
          : msg
      )
    );
    onSpeakMessage(`Please select your preferred loan amount up to ₹${maxSelectable} and tenure to calculate your monthly EMI.`);
  };

  // 1b. Configurator: Proceed to Review & Consent
  const handlePLProceedToConsent = (msgId: string, configuredData: any) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === msgId
          ? {
              ...msg,
              text: `Review your loan details for ₹${configuredData.amount.toLocaleString('en-IN')} with an EMI of ₹${configuredData.indicativeEMI.toLocaleString('en-IN')}/mo.`,
              widgetType: 'PERSONAL_LOAN_CONSENT',
              widgetData: {
                ...msg.widgetData,
                ...configuredData,
              },
            }
          : msg
      )
    );
    onSpeakMessage(
      `You have selected ${configuredData.amount} rupees for ${configuredData.tenure} with a monthly EMI of ${configuredData.indicativeEMI} rupees. Please review and provide your consent.`
    );
  };

  // 2. Final Consent & Disbursal
  const handlePLConfirmDisbursement = async (
    msgId: string, 
    amount: number, 
    tenure?: string, 
    emi?: number,
    passedWidgetData?: any
  ) => {
    setIsVerifyingSecurity(true);
    setTimeout(() => {
      setIsVerifyingSecurity(false);
      const isPersonalLine = passedWidgetData?.isPersonalLine !== false && 
        (!passedWidgetData?.loanType || passedWidgetData?.loanType.toLowerCase().includes('personal') || passedWidgetData?.loanType.toLowerCase().includes('instant'));
      
      const totalLimit = customer.totalPreApprovedLimit || 200000;
      let newUtilized = customer.utilizedPreApprovedLimit || 0;
      let newRemaining = Math.max(0, totalLimit - newUtilized);

      if (isPersonalLine) {
        newUtilized = (customer.utilizedPreApprovedLimit || 0) + amount;
        newRemaining = Math.max(0, totalLimit - newUtilized);
      }

      const tenureMonths = parseInt(tenure?.replace(/\D/g, '') || (isPersonalLine ? '12' : '60'), 10) || (isPersonalLine ? 12 : 60);
      const loanTypeName = passedWidgetData?.loanType || (isPersonalLine ? 'Personal Loan' : 'Auto Loan');
      const interestRate = passedWidgetData?.interestRate || (isPersonalLine ? 10.5 : 8.35);

      // Update customer balance, utilized limit & add loan record
      setCustomer((prev) => {
        const updatedUtilized = isPersonalLine 
          ? (prev.utilizedPreApprovedLimit || 0) + amount 
          : (prev.utilizedPreApprovedLimit || 0);

        const newLoanRecord = {
          id: `loan_${isPersonalLine ? 'pl' : 'asset'}_${Date.now()}`,
          type: isPersonalLine ? ('PERSONAL_LOAN' as const) : ('VEHICLE_LOAN' as const),
          name: `${loanTypeName} (${tenure || `${tenureMonths} months`})`,
          lender: 'ONE Digital Bank',
          outstandingAmount: amount,
          currentRate: typeof interestRate === 'number' ? interestRate : parseFloat(String(interestRate)) || 10.5,
          currentEMI: emi || Math.round(amount * 0.02),
          remainingTenureMonths: tenureMonths,
          disbursedDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        };

        return {
          ...prev,
          utilizedPreApprovedLimit: updatedUtilized,
          accounts: prev.accounts.map((acc, idx) =>
            idx === 0 ? { ...acc, balance: acc.balance + amount } : acc
          ),
          existingLoans: [newLoanRecord, ...prev.existingLoans],
        };
      });

      // Add to activity
      const refNum = `TXN-${isPersonalLine ? 'PL' : 'LN'}-${Math.floor(100000 + Math.random() * 900000)}`;
      onAddActivity({
        id: `act_${Date.now()}`,
        title: `${loanTypeName} Disbursed`,
        category: 'DISBURSEMENT',
        amount: amount,
        subtitle: isPersonalLine 
          ? `₹${amount.toLocaleString('en-IN')} credited to Savings ••••8832`
          : `₹${amount.toLocaleString('en-IN')} sanctioned at ${interestRate}% p.a.`,
        timestamp: 'Just now',
        status: 'DISBURSED',
        referenceNumber: refNum,
        details: {
          Loan: loanTypeName,
          Tenure: tenure || `${tenureMonths} months`,
          EMI: emi ? `₹${emi.toLocaleString('en-IN')}/mo` : `₹${Math.round(amount * 0.02).toLocaleString('en-IN')}/mo`,
          Applicant: customer.name,
        },
      });

      const successText = isPersonalLine
        ? `Loan Approved ✓ ₹${amount.toLocaleString('en-IN')} has been credited instantly to your Primary Savings Account. Remaining pre-approved credit line: ₹${newRemaining.toLocaleString('en-IN')}.`
        : `${loanTypeName} Approved ✓ ₹${amount.toLocaleString('en-IN')} has been sanctioned at ${interestRate}% p.a. (Independent loan — your ₹${(totalLimit - (customer.utilizedPreApprovedLimit || 0)).toLocaleString('en-IN')} personal credit line remains 100% intact).`;

      // Update message widget to success with remaining line info
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === msgId
            ? {
                ...msg,
                text: successText,
                widgetType: 'PERSONAL_LOAN_SUCCESS',
                widgetData: {
                  ...msg.widgetData,
                  amount,
                  tenure: tenure || `${tenureMonths} months`,
                  indicativeEMI: emi || Math.round(amount * 0.02),
                  refNum,
                  isPersonalLine,
                  totalLimit: isPersonalLine ? totalLimit : undefined,
                  newUtilized: isPersonalLine ? newUtilized : undefined,
                  newRemaining: isPersonalLine ? newRemaining : undefined,
                  loanType: loanTypeName,
                  disbursedAt: new Date().toLocaleTimeString(),
                },
              }
            : msg
        )
      );

      // Speak confirmation
      const speakText = isPersonalLine
        ? `Loan Approved! ₹${amount} has been credited instantly to your Savings Account. Your remaining credit line is ${newRemaining} rupees.`
        : `${loanTypeName} Approved! ₹${amount} has been sanctioned successfully.`;

      onSpeakMessage(speakText, msgId);
    }, 1200);
  };

  // 3. Beneficiary Selection & Memory Saving
  const handleSelectWifeAccount = (benId: string, msgId: string, amount: number) => {
    const selectedBen = customer.beneficiaries.find((b) => b.id === benId);
    if (!selectedBen) return;

    // Update Customer Memory in state!
    setCustomer((prev) => ({
      ...prev,
      beneficiaries: prev.beneficiaries.map((b) => ({
        ...b,
        isPrimary: b.id === benId,
      })),
      preferences: {
        ...prev.preferences,
        preferredBeneficiaryWifeId: benId,
      },
    }));

    // Update message to confirm memory & ready for transfer
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === msgId
          ? {
              ...msg,
              text: `Done. I'll use ${selectedBen.bankName} (${selectedBen.accountNumber}) as your preferred primary account for future transfers. Would you like to complete the ₹${amount.toLocaleString('en-IN')} transfer now?`,
              widgetType: 'TRANSFER_CONFIRM',
              widgetData: {
                beneficiary: selectedBen,
                amount,
                sourceAccount: customer.accounts[0],
                isRememberedPreference: true,
                justSavedPreference: true,
              },
            }
          : msg
      )
    );
  };

  // 4. Money Transfer Execution
  const handleExecuteTransfer = (msgId: string, ben: any, amount: number) => {
    setIsVerifyingSecurity(true);
    setTimeout(() => {
      setIsVerifyingSecurity(false);
      // Deduct balance
      setCustomer((prev) => ({
        ...prev,
        accounts: prev.accounts.map((acc, idx) =>
          idx === 0 ? { ...acc, balance: Math.max(0, acc.balance - amount) } : acc
        ),
      }));

      const refNum = `TXN-FT-${Math.floor(100000 + Math.random() * 900000)}`;
      onAddActivity({
        id: `act_${Date.now()}`,
        title: `Transferred to Wife (${ben.holderName})`,
        category: 'TRANSFER',
        amount: amount,
        subtitle: `${ben.bankName} (${ben.accountNumber})`,
        timestamp: 'Just now',
        status: 'COMPLETED',
        referenceNumber: refNum,
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === msgId
            ? {
                ...msg,
                text: `₹${amount.toLocaleString('en-IN')} transferred successfully to your wife's account at ${ben.bankName}.`,
                widgetType: 'TRANSFER_SUCCESS',
                widgetData: {
                  beneficiary: ben,
                  amount,
                  refNum,
                  timestamp: new Date().toLocaleTimeString(),
                },
              }
            : msg
        )
      );

      // Speak verbal confirmation
      onSpeakMessage(`₹${amount.toLocaleString('en-IN')} transferred successfully to your wife's account at ${ben.bankName}.`, msgId);
    }, 1000);
  };

  // 5. Bill Payment Execution
  const handleExecuteBillPay = (msgId: string, biller: any, card: any, amount: number) => {
    setIsVerifyingSecurity(true);
    setTimeout(() => {
      setIsVerifyingSecurity(false);
      const refNum = `TXN-BP-${Math.floor(100000 + Math.random() * 900000)}`;
      onAddActivity({
        id: `act_${Date.now()}`,
        title: `Airtel Bill Paid`,
        category: 'BILL_PAY',
        amount: amount,
        subtitle: `Paid via ${card.cardName} (${card.cardNumber.slice(-4)})`,
        timestamp: 'Just now',
        status: 'PAID',
        referenceNumber: refNum,
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === msgId
            ? {
                ...msg,
                text: `Airtel Postpaid bill of ₹${amount.toLocaleString('en-IN')} paid successfully ✓`,
                widgetType: 'BILL_PAYMENT_SUCCESS',
                widgetData: {
                  biller,
                  card,
                  amount,
                  refNum,
                  paidAt: new Date().toLocaleTimeString(),
                },
              }
            : msg
        )
      );

      // Speak verbal confirmation
      onSpeakMessage(`Airtel Postpaid bill of ₹${amount.toLocaleString('en-IN')} paid successfully.`, msgId);
    }, 1100);
  };

  // 6. Home Loan Balance Transfer E-Consent
  const handleHLBTProceed = (msgId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === msgId
          ? {
              ...msg,
              widgetType: 'HOME_LOAN_BT_CONSENT',
            }
          : msg
      )
    );
  };

  const handleHLBTConfirm = (msgId: string, widgetData: any) => {
    setIsVerifyingSecurity(true);
    setTimeout(() => {
      setIsVerifyingSecurity(false);
      const refNum = `REQ-HLBT-${Math.floor(100000 + Math.random() * 900000)}`;
      onAddActivity({
        id: `act_${Date.now()}`,
        title: `Home Loan Balance Transfer Initiated`,
        category: 'BALANCE_TRANSFER',
        amount: 4200000,
        subtitle: `Rate reduced to 8.10% (Saving ₹2,300/month)`,
        timestamp: 'Just now',
        status: 'EXPLORED',
        referenceNumber: refNum,
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === msgId
            ? {
                ...msg,
                text: `Home Loan Balance Transfer E-Consent Received ✓ Your digital paperwork has been initiated with Apex Housing Bank. Your new EMI will be ₹44,200.`,
                widgetType: 'HOME_LOAN_BT_SUCCESS',
                widgetData: {
                  ...msg.widgetData,
                  refNum,
                },
              }
            : msg
        )
      );
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto w-full flex flex-col flex-1 pb-4">
      
      {/* Proactive Next Best Action Banner (relationship manager intelligence) */}
      <section className="mb-4">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-teal-950/40 border border-slate-800/80 shadow-lg shadow-black/30">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 mt-0.5 border border-teal-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs uppercase tracking-wider text-teal-400 font-bold">
                    Something You May Want to Know
                  </h3>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Proactive AI
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  You currently have a home loan with another institution. Based on your profile, you are pre-qualified for a <strong className="text-teal-300 font-semibold">Balance Transfer to save ₹2,300/month</strong>.
                </p>
              </div>
            </div>

            <button
              id="btn-proactive-explore-bt"
              onClick={() => handleQuickPrompt('My home loan EMI is too high')}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-teal-500/20 flex items-center gap-1 cursor-pointer"
            >
              <span>Explore</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Main Conversation Stream */}
      <div className="flex-1 space-y-4 mb-4 min-h-[360px]">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* Sender Label & Timestamp */}
            <div className="flex items-center justify-between w-full max-w-2xl mb-1 px-1 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                {message.sender === 'ai' ? (
                  <>
                    <div className="w-4 h-4 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-[9px]">
                      1
                    </div>
                    <span className="font-semibold text-teal-300">ONE Banking AI</span>
                    {isAiSpeaking && speakingMsgId === message.id && (
                      <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-[10px] text-teal-300">
                        <span className="w-1 h-2.5 bg-teal-400 rounded-full animate-pulse" />
                        <span className="w-1 h-3.5 bg-teal-300 rounded-full animate-pulse delay-75" />
                        <span className="w-1 h-2 bg-teal-400 rounded-full animate-pulse delay-150" />
                        <span className="ml-1 text-[9px] font-medium">Speaking</span>
                      </div>
                    )}
                  </>
                ) : (
                  <span className="font-semibold text-slate-300">Mukesh Bansal</span>
                )}
                <span>•</span>
                <span>{message.timestamp}</span>
              </div>

              {/* Speaker action button for AI messages */}
              {message.sender === 'ai' && (
                <button
                  type="button"
                  onClick={() => {
                    if (isAiSpeaking && speakingMsgId === message.id) {
                      onStopSpeech();
                    } else {
                      onSpeakMessage(message.text, message.id);
                    }
                  }}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] transition-all cursor-pointer ${
                    isAiSpeaking && speakingMsgId === message.id
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                      : 'hover:bg-slate-800 text-slate-400 hover:text-teal-300'
                  }`}
                  title={isAiSpeaking && speakingMsgId === message.id ? 'Stop audio' : 'Listen to this response'}
                >
                  {isAiSpeaking && speakingMsgId === message.id ? (
                    <>
                      <Square className="w-3 h-3 fill-current text-teal-400" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3 h-3 text-slate-400 group-hover:text-teal-300" />
                      <span>Listen</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Bubble Container */}
            <div
              className={`max-w-2xl rounded-2xl p-4 sm:p-5 transition-all ${
                message.sender === 'user'
                  ? 'bg-blue-600/90 text-white rounded-br-xs shadow-md'
                  : `bg-slate-900/95 border text-slate-100 rounded-bl-xs shadow-xl shadow-black/40 ${
                      isAiSpeaking && speakingMsgId === message.id
                        ? 'border-teal-500/60 ring-1 ring-teal-500/30'
                        : 'border-slate-800/90'
                    }`
              }`}
            >
              {/* Text Message */}
              <p className="text-sm sm:text-base leading-relaxed text-slate-100">
                {message.text}
              </p>

              {/* ============================================================ */}
              {/* INTERACTIVE EMBEDDED WIDGETS */}
              {/* ============================================================ */}

              {/* 1. PERSONAL LOAN OFFER WIDGET */}
              {message.widgetType === 'PERSONAL_LOAN_OFFER' && message.widgetData && (
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-teal-500/30 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-400">Pre-Approved Offer</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 font-medium">
                        Instant Credit Line
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 block">Offered Amount</span>
                        <div className="text-3xl font-extrabold text-white font-display tracking-tight text-teal-300">
                          ₹{message.widgetData.amount.toLocaleString('en-IN')}
                        </div>
                      </div>
                      {message.widgetData.remainingLimit !== undefined && (
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Remaining Line</span>
                          <span className="text-xs font-bold text-teal-400">
                            Up to ₹{message.widgetData.remainingLimit.toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Pre-Approved Line Progress Tracker */}
                    {message.widgetData.totalLimit && (
                      <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1.5 text-[11px]">
                        <div className="flex justify-between items-center text-slate-400">
                          <span>Pre-Approved Line: <strong className="text-slate-200">₹{message.widgetData.totalLimit.toLocaleString('en-IN')}</strong></span>
                          <span>
                            {message.widgetData.utilizedLimit > 0 ? (
                              <span className="text-amber-400">Used: ₹{message.widgetData.utilizedLimit.toLocaleString('en-IN')}</span>
                            ) : (
                              <span className="text-teal-300">100% Available</span>
                            )}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full"
                            style={{ 
                              width: `${Math.min(100, Math.max(10, ((message.widgetData.remainingLimit || message.widgetData.amount) / message.widgetData.totalLimit) * 100))}%` 
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Max Selectable: ₹{(message.widgetData.maxAmount || message.widgetData.remainingLimit || message.widgetData.amount).toLocaleString('en-IN')}</span>
                          <span>Instant Paperless</span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800/80 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Indicative Tenure</span>
                        <span className="font-semibold text-slate-200">{message.widgetData.tenure}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Indicative EMI</span>
                        <span className="font-semibold text-slate-200">₹{message.widgetData.indicativeEMI.toLocaleString('en-IN')}/mo</span>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-slate-400 block text-[11px]">Processing</span>
                        <span className="font-semibold text-teal-300">Instant (0 docs)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      id="btn-pl-proceed"
                      onClick={() => handlePLProceedToConfigurator(message.id, message.widgetData)}
                      className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept Offer & Select Amount/Tenure</span>
                    </button>
                    <button
                      id="btn-pl-why"
                      onClick={() => onOpenExplainability('Instant Personal Loan')}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Info className="w-3.5 h-3.5 text-teal-400" />
                      <span>Why am I seeing this?</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 1B. LOAN AMOUNT & TENURE CONFIGURATOR WIDGET */}
              {message.widgetType === 'LOAN_CONFIGURATOR' && (
                <LoanConfiguratorWidget
                  messageId={message.id}
                  widgetData={message.widgetData}
                  onProceedToConsent={(configuredData) =>
                    handlePLProceedToConsent(message.id, configuredData)
                  }
                  onOpenExplainability={onOpenExplainability}
                />
              )}

              {/* 2. PERSONAL LOAN REVIEW & CONSENT WIDGET */}
              {message.widgetType === 'PERSONAL_LOAN_CONSENT' && message.widgetData && (
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800 text-xs font-bold text-slate-200">
                      <FileCheck className="w-4 h-4 text-teal-400" />
                      <span>Review & Consent (Single-Tap Execution)</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Loan Amount</span>
                        <span className="font-bold text-slate-100 text-base">₹{message.widgetData.amount.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Tenure</span>
                        <span className="font-semibold text-slate-200">{message.widgetData.tenure}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Monthly EMI</span>
                        <span className="font-bold text-teal-300 text-base">₹{message.widgetData.indicativeEMI.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Disbursal Account</span>
                        <span className="font-semibold text-slate-200">Savings ••••8832</span>
                      </div>
                    </div>

                    {message.widgetData.totalInterest !== undefined && (
                      <div className="flex items-center justify-between text-[11px] text-slate-400 py-2 border-t border-slate-900 mb-2">
                        <span>Total Interest: <strong className="text-slate-300 font-mono">₹{message.widgetData.totalInterest.toLocaleString('en-IN')}</strong></span>
                        <span>Total Repayment: <strong className="text-slate-300 font-mono">₹{message.widgetData.totalPayable?.toLocaleString('en-IN') || (message.widgetData.amount + message.widgetData.totalInterest).toLocaleString('en-IN')}</strong></span>
                      </div>
                    )}

                    <p className="text-[11px] text-slate-400 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      “I have configured the loan according to your selected amount and tenure. Please review and provide your single-tap consent to disburse.”
                    </p>

                    <label className="flex items-start gap-2.5 mt-3 pt-2 text-xs text-slate-300 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={activeConsentChecked}
                        onChange={(e) => setActiveConsentChecked(e.target.checked)}
                        className="mt-0.5 rounded border-slate-700 text-teal-500 focus:ring-teal-400"
                      />
                      <span>I confirm details and authorize instant disbursal under digital banking terms.</span>
                    </label>
                  </div>

                  <button
                    id="btn-pl-confirm-consent"
                    disabled={!activeConsentChecked || isVerifyingSecurity}
                    onClick={() =>
                      handlePLConfirmDisbursement(
                        message.id,
                        message.widgetData.amount,
                        message.widgetData.tenure,
                        message.widgetData.indicativeEMI,
                        message.widgetData
                      )
                    }
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                  >
                    {isVerifyingSecurity ? (
                      <>
                        <ShieldCheck className="w-4 h-4 animate-spin" />
                        <span>Verifying Secure Transaction Token...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Continue Securely & Disburse ₹{message.widgetData.amount.toLocaleString('en-IN')}</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* 3. PERSONAL / ASSET LOAN SUCCESS RECEIPT */}
              {message.widgetType === 'PERSONAL_LOAN_SUCCESS' && message.widgetData && (
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                  <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-500/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                        <CheckCircle2 className="w-5 h-5 text-teal-400" />
                        <span>{message.widgetData.loanType || 'Loan'} Approved & Sanctioned ✓</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
                        {message.widgetData.refNum}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-slate-950/80 border border-teal-900/40 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Disbursed Amount</span>
                        <strong className="text-teal-300 font-display text-base">₹{message.widgetData.amount.toLocaleString('en-IN')}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Monthly EMI</span>
                        <strong className="text-slate-200">₹{message.widgetData.indicativeEMI.toLocaleString('en-IN')}/mo</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Tenure</span>
                        <strong className="text-slate-200">{message.widgetData.tenure}</strong>
                      </div>
                    </div>

                    {message.widgetData.isPersonalLine !== false && message.widgetData.newRemaining !== undefined && (
                      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px]">
                        <span className="text-slate-400">
                          Remaining Pre-Approved Line: <strong className="text-teal-400 font-bold">₹{message.widgetData.newRemaining.toLocaleString('en-IN')}</strong> (out of ₹{(message.widgetData.totalLimit || 200000).toLocaleString('en-IN')})
                        </span>
                        <span className="text-slate-400 text-[10px]">
                          Credited to Savings ending 8832
                        </span>
                      </div>
                    )}

                    {message.widgetData.isPersonalLine === false && (
                      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px]">
                        <span className="text-slate-300">
                          Personal Credit Line: <strong className="text-teal-400 font-bold">₹{(customer.totalPreApprovedLimit - customer.utilizedPreApprovedLimit).toLocaleString('en-IN')}</strong> (100% Intact)
                        </span>
                        <span className="text-emerald-400 text-[10px] font-medium">
                          Independent Facility
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
                      <span>Disbursed at: {message.widgetData.disbursedAt || 'Just now'}</span>
                      <span className="text-teal-300 font-sans">Instant 1-Click Disbursal</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. WIFE ACCOUNT SELECTOR (BENEFICIARY MEMORY) */}
              {message.widgetType === 'WIFE_ACCOUNT_SELECTOR' && message.widgetData && (
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                  <p className="text-xs font-semibold text-teal-300">
                    Select account to set as your remembered primary beneficiary:
                  </p>

                  <div className="space-y-2">
                    {message.widgetData.accounts.map((ben: any) => (
                      <button
                        key={ben.id}
                        onClick={() => handleSelectWifeAccount(ben.id, message.id, message.widgetData.amount)}
                        className="w-full p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/50 flex items-center justify-between text-left transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-xs">
                            {ben.bankName.slice(0, 4)}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-200 group-hover:text-teal-300 transition-colors">
                              {ben.bankName}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              Account: {ben.accountNumber} • {ben.holderName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-teal-400 font-medium group-hover:translate-x-0.5 transition-transform">
                          <span>Set Primary</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. TRANSFER CONFIRMATION WIDGET */}
              {message.widgetType === 'TRANSFER_CONFIRM' && message.widgetData && (
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    {message.widgetData.isRememberedPreference && (
                      <div className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded bg-teal-950/50 text-teal-300 border border-teal-800/40 font-medium">
                        <Zap className="w-3.5 h-3.5 text-teal-400" />
                        <span>Remembered Preference Recognized: Primary Wife Account</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 block">Transfer Amount</span>
                        <span className="text-2xl font-bold text-white font-display">
                          ₹{message.widgetData.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block">Destination</span>
                        <span className="text-xs font-semibold text-slate-200">
                          {message.widgetData.beneficiary.bankName} ({message.widgetData.beneficiary.accountNumber})
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span>From: Savings ({message.widgetData.sourceAccount.accountNumber})</span>
                      <span>Zero Transfer Charges</span>
                    </div>
                  </div>

                  <button
                    id="btn-confirm-transfer"
                    disabled={isVerifyingSecurity}
                    onClick={() => handleExecuteTransfer(message.id, message.widgetData.beneficiary, message.widgetData.amount)}
                    className="w-full py-3 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                  >
                    {isVerifyingSecurity ? (
                      <>
                        <ShieldCheck className="w-4 h-4 animate-spin" />
                        <span>Authorizing Fast Payment...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Confirm & Send ₹{message.widgetData.amount.toLocaleString('en-IN')}</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* 6. TRANSFER SUCCESS RECEIPT */}
              {message.widgetType === 'TRANSFER_SUCCESS' && message.widgetData && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-500/40 space-y-1.5">
                    <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-teal-400" />
                      <span>₹{message.widgetData.amount.toLocaleString('en-IN')} Transferred Successfully ✓</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Sent to {message.widgetData.beneficiary.holderName} • {message.widgetData.beneficiary.bankName} ({message.widgetData.beneficiary.accountNumber})
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-teal-800/30 font-mono">
                      <span>Ref: {message.widgetData.refNum}</span>
                      <span>IMPS / UPI-Instant</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 7. BILL PAYMENT CONFIRM WIDGET */}
              {message.widgetType === 'BILL_PAYMENT_CONFIRM' && message.widgetData && (
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 block">Biller</span>
                        <span className="text-sm font-bold text-slate-100">{message.widgetData.biller.billerName}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block">Bill Amount</span>
                        <span className="text-xl font-bold text-teal-300 font-display">
                          ₹{message.widgetData.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-teal-400" />
                        <span className="text-slate-300">{message.widgetData.paymentCard.cardName}</span>
                      </div>
                      <span className="font-mono text-slate-400">{message.widgetData.paymentCard.cardNumber.slice(-8)}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Due Date: {message.widgetData.biller.dueDate}</span>
                      <span>Reward Points Eligible</span>
                    </div>
                  </div>

                  <button
                    id="btn-confirm-bill-pay"
                    disabled={isVerifyingSecurity}
                    onClick={() => handleExecuteBillPay(message.id, message.widgetData.biller, message.widgetData.paymentCard, message.widgetData.amount)}
                    className="w-full py-3 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                  >
                    {isVerifyingSecurity ? (
                      <>
                        <ShieldCheck className="w-4 h-4 animate-spin" />
                        <span>Processing Bill Settlement...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Pay ₹{message.widgetData.amount.toLocaleString('en-IN')}</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* 8. BILL PAYMENT SUCCESS */}
              {message.widgetType === 'BILL_PAYMENT_SUCCESS' && message.widgetData && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-500/40 space-y-1.5">
                    <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-teal-400" />
                      <span>Bill Paid Successfully ✓</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      ₹{message.widgetData.amount.toLocaleString('en-IN')} settled for {message.widgetData.biller.billerName}.
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-teal-800/30 font-mono">
                      <span>Ref: {message.widgetData.refNum}</span>
                      <span>Instant Biller Confirmation</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 9. HOME LOAN BALANCE TRANSFER OFFER */}
              {message.widgetType === 'HOME_LOAN_BT_OFFER' && message.widgetData && (
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                  {/* Comparative Rate & EMI Card */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Existing */}
                    <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                        <span>Current External Loan</span>
                        <span className="text-red-400 font-medium">8.75% p.a.</span>
                      </div>
                      <p className="text-lg font-bold text-slate-300 font-display">₹46,500<span className="text-xs font-normal text-slate-500">/mo</span></p>
                      <p className="text-[11px] text-slate-400 mt-1">Outstanding: ₹42 Lakhs • 12 yrs left</p>
                    </div>

                    {/* Proposed */}
                    <div className="p-3.5 rounded-xl bg-teal-950/40 border border-teal-500/40">
                      <div className="flex items-center justify-between text-xs text-teal-300 mb-1.5">
                        <span className="font-semibold">ONE Bank Transfer</span>
                        <span className="font-bold text-teal-400">8.10% p.a.</span>
                      </div>
                      <p className="text-lg font-bold text-white font-display">₹44,200<span className="text-xs font-normal text-slate-400">/mo</span></p>
                      <div className="flex items-center gap-1 text-[11px] text-teal-300 font-semibold mt-1">
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>Save ₹2,300 every month!</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Savings */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Total Interest Savings over tenure:</span>
                    <strong className="text-teal-300 font-bold text-sm">₹3,31,200</strong>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      id="btn-hlbt-proceed"
                      onClick={() => handleHLBTProceed(message.id)}
                      className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Check className="w-4 h-4" />
                      <span>Yes, Explore & Switch</span>
                    </button>
                    <button
                      id="btn-hlbt-why"
                      onClick={() => onOpenExplainability('Home Loan Balance Transfer')}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Info className="w-3.5 h-3.5 text-teal-400" />
                      <span>Why this offer?</span>
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-500 italic">
                    *Illustrative calculation only. Final eligibility, rate and savings subject to verification and policy.
                  </p>
                </div>
              )}

              {/* 10. HOME LOAN BT CONSENT */}
              {message.widgetType === 'HOME_LOAN_BT_CONSENT' && message.widgetData && (
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-teal-400 font-bold">
                      <FileCheck className="w-4 h-4" />
                      <span>Digital Balance Transfer Initiation</span>
                    </div>
                    <p className="text-slate-300">
                      We will coordinate digital document retrieval with Apex Housing Bank. Zero branch visits required.
                    </p>
                    <div className="pt-2 border-t border-slate-800 flex justify-between text-slate-400">
                      <span>New Target Rate: <strong>8.10%</strong></span>
                      <span>Target EMI: <strong>₹44,200</strong></span>
                    </div>
                  </div>

                  <button
                    id="btn-hlbt-confirm-consent"
                    disabled={isVerifyingSecurity}
                    onClick={() => handleHLBTConfirm(message.id, message.widgetData)}
                    className="w-full py-3 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
                  >
                    {isVerifyingSecurity ? (
                      <>
                        <ShieldCheck className="w-4 h-4 animate-spin" />
                        <span>Authorizing E-Consent Token...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Authorize Fast-Track Transfer</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* 11. HOME LOAN BT SUCCESS */}
              {message.widgetType === 'HOME_LOAN_BT_SUCCESS' && message.widgetData && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-500/40 space-y-1.5">
                    <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-teal-400" />
                      <span>Balance Transfer Initiated ✓</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Ref: {message.widgetData.refNum}. Your relationship manager has been assigned.
                    </p>
                  </div>
                </div>
              )}

              {/* 12. AUTO LOAN OFFER WIDGET */}
              {message.widgetType === 'AUTO_LOAN_OFFER' && message.widgetData && (
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400">Indicative Auto Loan Eligibility</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        Zero Processing Fee
                      </span>
                    </div>

                    <div className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                      Up to ₹{(message.widgetData.maxAmount / 100000).toFixed(1)} Lakhs
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Indicative Tenure</span>
                        <span className="font-semibold text-slate-200">{message.widgetData.tenure}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Indicative EMI</span>
                        <span className="font-semibold text-slate-200">₹{message.widgetData.indicativeEMI.toLocaleString('en-IN')}/mo</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Interest Rate</span>
                        <span className="font-semibold text-teal-300">{message.widgetData.rate}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Existing Loan Status</span>
                        <span className="font-semibold text-emerald-400">Matures in 2 mos</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handlePLProceedToConfigurator(message.id, message.widgetData)}
                      className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md shadow-teal-500/20 transition-all"
                    >
                      Accept Offer & Customize EMI
                    </button>
                    <button
                      onClick={() => onOpenExplainability('Auto Loan')}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer flex items-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5 text-teal-400" />
                      <span>Why ₹12 Lakh?</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 13. TRACTOR FINANCE OFFER */}
              {message.widgetType === 'TRACTOR_FINANCE_OFFER' && message.widgetData && (
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400">Tractor & Equipment Finance</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        Agri Priority
                      </span>
                    </div>

                    <div className="text-2xl font-bold text-white font-display">
                      Up to ₹{(message.widgetData.maxAmount / 100000).toFixed(1)} Lakhs
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Tenure</span>
                        <span className="font-semibold text-slate-200">{message.widgetData.tenure}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Indicative EMI</span>
                        <span className="font-semibold text-slate-200">₹{message.widgetData.indicativeEMI.toLocaleString('en-IN')}/mo</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handlePLProceedToConfigurator(message.id, message.widgetData)}
                      className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md shadow-teal-500/20"
                    >
                      Accept Offer & Customize EMI
                    </button>
                    <button
                      onClick={() => onSendMessage('Explore tractor dealer network')}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                    >
                      Explore Dealer Network
                    </button>
                  </div>
                </div>
              )}

              {/* 14. COMMERCIAL VEHICLE OFFER */}
              {message.widgetType === 'COMMERCIAL_VEHICLE_OFFER' && message.widgetData && (
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400">Commercial Vehicle & Fleet Finance</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        Commercial Line
                      </span>
                    </div>

                    <div className="text-2xl font-bold text-white font-display">
                      Up to ₹{(message.widgetData.maxAmount / 100000).toFixed(1)} Lakhs
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Tenure</span>
                        <span className="font-semibold text-slate-200">{message.widgetData.tenure}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Indicative Rate</span>
                        <span className="font-semibold text-teal-300">{message.widgetData.rate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handlePLProceedToConfigurator(message.id, message.widgetData)}
                      className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md shadow-teal-500/20"
                    >
                      Accept Offer & Customize EMI
                    </button>
                    <button
                      onClick={() => onSendMessage('Show commercial fleet options')}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                    >
                      View Fleet Options
                    </button>
                  </div>
                </div>
              )}

              {/* 15. OFFERS SUMMARY LIST */}
              {message.widgetType === 'OFFERS_SUMMARY' && message.widgetData && (
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-2.5">
                  {message.widgetData.offers.map((offer: any) => (
                    <div
                      key={offer.id}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-100">{offer.title}</span>
                          <span className="text-[9px] px-2 py-0.2 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-medium">
                            {offer.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{offer.tagline}</p>
                      </div>

                      <button
                        onClick={() => handleQuickPrompt(`Tell me more about ${offer.title}`)}
                        className="px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500 text-teal-300 hover:text-slate-950 text-xs font-semibold shrink-0 transition-colors cursor-pointer"
                      >
                        Explore
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 16. BALANCE CARD */}
              {message.widgetType === 'BALANCE_CARD' && message.widgetData && (
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
                  {message.widgetData.accounts.map((acc: any) => (
                    <div
                      key={acc.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-slate-200">{acc.type.replace('_', ' ')} Account</p>
                        <p className="text-[11px] text-slate-400 font-mono">{acc.accountNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white font-mono text-sm">
                          {acc.currency}{acc.balance.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 17. EXPLAINABILITY CARD */}
              {message.widgetType === 'EXPLAINABILITY_CARD' && message.widgetData && (
                <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 text-xs">
                  <p className="font-semibold text-teal-300">Key AI Underwriting Signals:</p>
                  <ul className="space-y-1 text-slate-300">
                    {message.widgetData.factors.map((f: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex items-center gap-2 p-3 text-xs text-slate-400">
            <div className="w-4 h-4 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-[9px] animate-pulse">
              1
            </div>
            <span className="animate-pulse">Checking available options & simulated bureau parameters...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Pills */}
      <div className="mb-3">
        <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-2 px-1">
          Try saying or typing:
        </p>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => handleQuickPrompt('Transfer ₹5,000 to my wife')}
            className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>💸 Transfer ₹5,000 to wife</span>
          </button>
          <button
            onClick={() => handleQuickPrompt('Pay my Airtel bill using my credit card')}
            className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>💳 Pay Airtel bill</span>
          </button>
          <button
            onClick={() => handleQuickPrompt('I need a personal loan')}
            className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>💰 Instant Loan Line</span>
          </button>
          <button
            onClick={() => handleQuickPrompt('My home loan EMI is too high')}
            className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>🏠 Reduce Home Loan EMI</span>
          </button>
          <button
            onClick={() => handleQuickPrompt('I am exploring for an auto loan')}
            className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>🚗 Buy a Car</span>
          </button>
          <button
            onClick={() => handleQuickPrompt('I want to buy a tractor')}
            className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>🚜 Tractor Loan</span>
          </button>
          <button
            onClick={() => handleQuickPrompt('What loans am I eligible for?')}
            className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>📊 Show My Eligibility</span>
          </button>
        </div>
      </div>

      {/* Floating Conversational Command Input */}
      <form onSubmit={handleFormSubmit} className="relative">
        <div className="p-2 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-800/90 shadow-2xl flex items-center gap-2">
          
          {/* Voice Input Button */}
          <button
            type="button"
            id="btn-chat-mic"
            onClick={toggleListening}
            className={`p-3 rounded-xl transition-all cursor-pointer ${
              isListening
                ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-teal-400'
            }`}
            title={isListening ? 'Listening...' : 'Speak naturally (Voice Input)'}
          >
            {isListening ? <Mic className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <input
            id="input-ai-chat"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isListening
                ? 'Listening to your voice...'
                : 'Tell me what you need... e.g. "Transfer ₹5k to wife" or "I need a loan"'
            }
            className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />

          {/* Send Button */}
          <button
            type="submit"
            id="btn-chat-send"
            disabled={!inputText.trim() || isProcessing}
            className="p-3 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-slate-950 font-bold transition-all shadow-md shadow-teal-500/20 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Security, Voice & Disclaimer Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-2 pt-2 text-[10px] text-slate-500 gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-slate-500" />
              <span>Simulated Intelligence & Verification</span>
            </div>

            {/* Voice Status Pill */}
            <button
              type="button"
              onClick={() => {
                const next = !speechEnabled;
                setSpeechEnabled(next);
                if (next) {
                  onSpeakMessage(
                    voiceLanguage === 'hi'
                      ? 'नमस्ते, आवाज़ चालू है और मैं मदद के लिए तैयार हूँ।'
                      : 'AI Voice response is active and ready.'
                  );
                } else {
                  onStopSpeech();
                }
              }}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                speechEnabled
                  ? 'bg-teal-500/10 text-teal-300 border-teal-500/30 hover:bg-teal-500/20'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
              title="Toggle AI Speech Voice"
            >
              {speechEnabled ? (
                <>
                  <Volume2 className="w-3 h-3 text-teal-400" />
                  <span className="font-medium">Voice AI: Speaking On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3 h-3 text-slate-500" />
                  <span>Voice AI: Muted</span>
                </>
              )}
            </button>

            {/* Language Selector (English / Hindi) */}
            <div
              className="inline-flex items-center rounded-full bg-slate-900 border border-slate-800 p-0.5 text-[10px] font-semibold"
              role="group"
              aria-label="Voice Language"
            >
              <button
                type="button"
                onClick={() => onChangeVoiceLanguage('en')}
                className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                  voiceLanguage === 'en'
                    ? 'bg-teal-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => onChangeVoiceLanguage('hi')}
                className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                  voiceLanguage === 'hi'
                    ? 'bg-teal-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                हिंदी (Hindi)
              </button>
            </div>
          </div>

          <span>Indicative offers only • No real financial transactions performed</span>
        </div>
      </form>

    </div>
  );
};
