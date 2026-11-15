import { ChatMessage, CustomerProfile, LendingOffer } from '../types';
import { AIRTEL_BILL, LENDING_OFFERS } from '../data/mockData';

export interface ProcessResult {
  aiMessage: ChatMessage;
  updatedProfile?: CustomerProfile;
}

function parseAmountFromQuery(query: string): number | null {
  const q = query.toLowerCase();

  // Spoken / English words
  if (q.includes('two lacs') || q.includes('two lakh') || q.includes('two lakhs')) return 200000;
  if (q.includes('one lac fifty') || q.includes('one lakh fifty') || q.includes('one point five lac') || q.includes('one point five lakh')) return 150000;
  if (q.includes('one lac') || q.includes('one lakh') || q.includes('one lakhs')) return 100000;
  if (q.includes('seventy five thousand')) return 75000;
  if (q.includes('eighty thousand')) return 80000;
  if (q.includes('seventy thousand')) return 70000;
  if (q.includes('sixty thousand')) return 60000;
  if (q.includes('fifty thousand')) return 50000;
  if (q.includes('forty thousand')) return 40000;
  if (q.includes('twenty five thousand')) return 25000;
  if (q.includes('twenty thousand')) return 20000;
  if (q.includes('ten thousand')) return 10000;
  if (q.includes('three lacs') || q.includes('three lakh')) return 300000;
  if (q.includes('five lacs') || q.includes('five lakh')) return 500000;

  // Check for lakh / lac (e.g. 1.5 lakh, 2 lac, 2 lacs, 0.8 lakh)
  const lakhMatch = query.match(/(\d+(?:\.\d+)?)\s*(?:lakhs?|lacs?|l)\b/i);
  if (lakhMatch) {
    return Math.round(parseFloat(lakhMatch[1]) * 100000);
  }

  // Check for k / thousand (e.g. 50k, 80 thousand, 75k)
  const kMatch = query.match(/(\d+(?:\.\d+)?)\s*(?:k|thousand)\b/i);
  if (kMatch) {
    return Math.round(parseFloat(kMatch[1]) * 1000);
  }

  // Check for currency numbers like ₹50,000 or ₹80000 or 200000
  const numMatch = query.match(/(?:₹|rs\.?|inr)?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d+)?|\d{4,7})/i);
  if (numMatch) {
    const raw = numMatch[1].replace(/,/g, '');
    const val = parseInt(raw, 10);
    if (!isNaN(val) && val >= 1000) {
      return val;
    }
  }

  const generalMatch = query.match(/\b(\d{4,7})\b/);
  if (generalMatch) {
    const val = parseInt(generalMatch[1], 10);
    if (!isNaN(val) && val >= 1000) {
      return val;
    }
  }

  return null;
}

export async function processUserMessage(
  userInput: string,
  profile: CustomerProfile,
  conversationHistory: ChatMessage[]
): Promise<ChatMessage> {
  const query = userInput.trim().toLowerCase();
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Compute pre-approved line limits
  const totalLimit = profile.totalPreApprovedLimit || 200000;
  const utilizedLimit = profile.utilizedPreApprovedLimit || 0;
  const remainingLimit = Math.max(0, totalLimit - utilizedLimit);

  // 1b. Accept Loan Offer / Customize Loan & EMI Intent
  if (
    query.includes('accept loan') ||
    query.includes('accept offer') ||
    query.includes('customize loan') ||
    query.includes('customize emi') ||
    query.includes('select tenure') ||
    query.includes('proceed with loan') ||
    ((query === 'yes' || query === 'proceed' || query === 'accept' || query.includes('yes proceed') || query.includes('i want to take')) &&
      conversationHistory.length > 0 &&
      conversationHistory[conversationHistory.length - 1].widgetType === 'PERSONAL_LOAN_OFFER')
  ) {
    if (remainingLimit <= 0) {
      return {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: `Mukesh, your pre-approved limit of ₹${totalLimit.toLocaleString('en-IN')} is already fully utilized across active loans. No additional instant loan line is available right now.`,
        timestamp,
        intentCategory: 'LOAN_PERSONAL_INSTANT',
      };
    }

    const defaultAmt = Math.min(50000, remainingLimit);
    return {
      id: `ai_${Date.now()}`,
      sender: 'ai',
      text: `Great! You can customize your loan amount (up to your remaining pre-approved line of ₹${remainingLimit.toLocaleString('en-IN')}) and repayment tenure below to see your exact monthly EMI.`,
      timestamp,
      intentCategory: 'LOAN_PERSONAL_INSTANT',
      widgetType: 'LOAN_CONFIGURATOR',
      widgetData: {
        loanType: 'Personal Loan',
        minAmount: Math.min(10000, remainingLimit),
        maxAmount: remainingLimit, // Strictly capped at remaining eligible amount!
        totalLimit,
        utilizedLimit,
        remainingLimit,
        defaultAmount: defaultAmt,
        defaultTenure: 12,
        interestRate: 10.5,
        allowedTenures: [6, 12, 18, 24, 36, 48, 60],
        bureauScore: profile.bureauScore,
        applicant: profile.name,
      },
    };
  }

  // 1. Personal Loan / Urgent Money Intent
  const isPersonalLoanIntent =
    !query.includes('home loan') &&
    !query.includes('auto loan') &&
    !query.includes('car loan') &&
    !query.includes('vehicle loan') &&
    !query.includes('tractor') &&
    !query.includes('commercial vehicle') &&
    !query.includes('truck') &&
    !query.includes('fleet') &&
    !query.includes('reduce emi') &&
    !query.includes('balance transfer') &&
    !query.includes('airtel') &&
    !query.includes('bill') &&
    (
      query.includes('loan') ||
      query.includes('borrow') ||
      query.includes('urgent') ||
      query.includes('credit line') ||
      query.includes('instant cash') ||
      (query.includes('need') && (query.includes('money') || query.includes('cash') || query.includes('fund') || query.includes('₹') || query.includes('rs'))) ||
      query.includes('50,000') ||
      query.includes('50000') ||
      query.includes('50k') ||
      query.includes('1 lakh') ||
      query.includes('100000') ||
      query.includes('2 lakh') ||
      query.includes('200000') ||
      query.includes('2 lacs') ||
      query.includes('2 lac')
    );

  if (isPersonalLoanIntent) {
    if (remainingLimit <= 0) {
      return {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: `Mukesh, you have currently utilized your full ₹${totalLimit.toLocaleString('en-IN')} pre-approved instant credit limit across active loans (Disbursed: ₹${utilizedLimit.toLocaleString('en-IN')}). No additional instant loan line is available right now until earlier installments are serviced.`,
        timestamp,
        intentCategory: 'LOAN_PERSONAL_INSTANT',
      };
    }

    const requestedAmount = parseAmountFromQuery(query);
    let offeredAmount: number;
    let explanationText = '';

    if (requestedAmount && requestedAmount > 0) {
      if (requestedAmount > remainingLimit) {
        // Asked amount is MORE than line limit -> capped at line limit amount
        offeredAmount = remainingLimit;
        explanationText = `You requested ₹${requestedAmount.toLocaleString('en-IN')}. Since your remaining pre-approved line is ₹${remainingLimit.toLocaleString('en-IN')} (out of total line of ₹${totalLimit.toLocaleString('en-IN')}), your offer is capped at your line limit of ₹${offeredAmount.toLocaleString('en-IN')}.`;
      } else {
        // Asked amount is EQUAL or LESS than line limit -> offer amount equals asked amount
        offeredAmount = requestedAmount;
        if (utilizedLimit > 0) {
          explanationText = `Good news, Mukesh. As requested, your instant loan offer for ₹${offeredAmount.toLocaleString('en-IN')} is ready at 10.5% p.a. (Remaining eligible line: ₹${remainingLimit.toLocaleString('en-IN')} out of ₹${totalLimit.toLocaleString('en-IN')}).`;
        } else {
          explanationText = `Good news, Mukesh. As requested, your instant loan offer for ₹${offeredAmount.toLocaleString('en-IN')} is ready at 10.5% p.a. (Pre-approved line up to ₹${totalLimit.toLocaleString('en-IN')}).`;
        }
      }
    } else {
      // No specific amount asked -> offer the available remaining line limit
      offeredAmount = remainingLimit;
      if (utilizedLimit > 0) {
        explanationText = `Good news, Mukesh. Your remaining pre-approved line is ₹${remainingLimit.toLocaleString('en-IN')} (Total: ₹${totalLimit.toLocaleString('en-IN')}, prior loan: ₹${utilizedLimit.toLocaleString('en-IN')}). Here is your instant offer for ₹${offeredAmount.toLocaleString('en-IN')}, or you can customize the amount.`;
      } else {
        explanationText = `Good news, Mukesh. Based on your 12-year relationship with verified 782 bureau score, you are pre-approved for an instant credit line of ₹${totalLimit.toLocaleString('en-IN')}. Here is your instant offer for ₹${offeredAmount.toLocaleString('en-IN')}.`;
      }
    }

    const defaultTenure = 12;
    const annualRate = 10.5;
    const monthlyRate = annualRate / 12 / 100;
    const indicativeEMI = Math.round(
      (offeredAmount * monthlyRate * Math.pow(1 + monthlyRate, defaultTenure)) /
        (Math.pow(1 + monthlyRate, defaultTenure) - 1)
    );

    return {
      id: `ai_${Date.now()}`,
      sender: 'ai',
      text: explanationText,
      timestamp,
      intentCategory: 'LOAN_PERSONAL_INSTANT',
      widgetType: 'PERSONAL_LOAN_OFFER',
      widgetData: {
        amount: offeredAmount,
        totalLimit,
        utilizedLimit,
        remainingLimit,
        maxAmount: remainingLimit, // Strictly cannot select more than eligible amount!
        minAmount: Math.min(10000, remainingLimit),
        tenure: '12 months',
        defaultTenure: 12,
        indicativeEMI,
        interestRate: '10.5% p.a.',
        interestRateNum: 10.5,
        processing: 'Instant Disbursal (Zero paperwork)',
        purpose: 'Personal Need',
        applicant: profile.name,
        bureauScore: profile.bureauScore,
      },
    };
  }

  // 2. Beneficiary Transfer / Wife Account Memory
  if (
    (query.includes('transfer') || query.includes('send') || query.includes('pay')) &&
    (query.includes('wife') || query.includes('bansal') || query.includes('5,000') || query.includes('5000') || query.includes('5k'))
  ) {
    // Extract amount if mentioned
    let amount = 5000;
    const numMatch = query.match(/(\d[\d,]*)/);
    if (numMatch) {
      amount = parseInt(numMatch[1].replace(/,/g, ''), 10) || 5000;
    }

    // Check if preference already set in customer profile memory
    const preferredBenId = profile.preferences.preferredBeneficiaryWifeId;
    const preferredBen = profile.beneficiaries.find((b) => b.id === preferredBenId);

    if (preferredBen) {
      // Memory exists!
      return {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: `Sure. Ready to transfer ₹${amount.toLocaleString('en-IN')} to your wife's primary account at ${preferredBen.bankName} (${preferredBen.accountNumber}).`,
        timestamp,
        intentCategory: 'PAYMENT_TRANSFER',
        widgetType: 'TRANSFER_CONFIRM',
        widgetData: {
          beneficiary: preferredBen,
          amount,
          sourceAccount: profile.accounts[0],
          isRememberedPreference: true,
        },
      };
    } else {
      // First time: Show 3 accounts and ask to set primary memory
      return {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: `I found 3 saved accounts associated with your wife (Mrs. Bansal). Which account would you like to set as your primary account for this and future transfers?`,
        timestamp,
        intentCategory: 'PAYMENT_TRANSFER',
        widgetType: 'WIFE_ACCOUNT_SELECTOR',
        widgetData: {
          accounts: profile.beneficiaries,
          amount,
        },
      };
    }
  }

  // 3. Bill Payment (Airtel / Mobile / Utilities)
  if (
    query.includes('airtel') ||
    query.includes('bill') ||
    query.includes('mobile bill') ||
    query.includes('postpaid')
  ) {
    const preferredCard = profile.creditCards.find((c) => c.isPreferred) || profile.creditCards[0];
    return {
      id: `ai_${Date.now()}`,
      sender: 'ai',
      text: `Your Airtel postpaid bill of ₹1,249 is due on ${AIRTEL_BILL.dueDate}. I have prepared payment via your preferred ${preferredCard.cardName} (${preferredCard.cardNumber.slice(-4)}).`,
      timestamp,
      intentCategory: 'PAYMENT_BILL',
      widgetType: 'BILL_PAYMENT_CONFIRM',
      widgetData: {
        biller: AIRTEL_BILL,
        paymentCard: preferredCard,
        amount: AIRTEL_BILL.amount,
      },
    };
  }

  // 4. Home Loan Balance Transfer / High EMI
  if (
    query.includes('home loan') ||
    query.includes('emi is too high') ||
    query.includes('high emi') ||
    query.includes('reduce emi') ||
    query.includes('balance transfer') ||
    query.includes('lower interest')
  ) {
    const hl = profile.existingLoans.find((l) => l.type === 'HOME_LOAN') || {
      outstandingAmount: 4200000,
      currentRate: 8.75,
      currentEMI: 46500,
      remainingTenureMonths: 144,
      lender: 'Apex Housing Bank (External)',
    };

    return {
      id: `ai_${Date.now()}`,
      sender: 'ai',
      text: `I can help reduce your home loan burden. I noticed your existing ₹42,00,000 home loan with an external lender at 8.75%. Based on your bureau rating of 782, you are pre-qualified to transfer to ONE Bank at 8.10% and save ₹2,300 every month.`,
      timestamp,
      intentCategory: 'LOAN_HOME_BALANCE_TRANSFER',
      widgetType: 'HOME_LOAN_BT_OFFER',
      widgetData: {
        existing: {
          lender: hl.lender,
          outstanding: hl.outstandingAmount,
          rate: hl.currentRate,
          emi: hl.currentEMI,
          remainingYears: 12,
        },
        proposed: {
          rate: 8.10,
          emi: 44200,
          monthlySavings: 2300,
          totalSavings: 331200,
          tenureYears: 12,
        },
      },
    };
  }

  // 5. Auto Loan / Buy a car (Independent Loan)
  if (
    query.includes('car') ||
    query.includes('auto loan') ||
    query.includes('vehicle loan') ||
    query.includes('buy a car') ||
    query.includes('drive')
  ) {
    const requestedAmount = parseAmountFromQuery(query);
    const maxAutoLimit = 1200000;
    const defaultAutoAmount = requestedAmount && requestedAmount > 0 
      ? Math.min(requestedAmount, maxAutoLimit) 
      : 800000;
    const defaultTenure = 60;
    const annualRate = 8.35;
    const monthlyRate = annualRate / 12 / 100;
    const indicativeEMI = Math.round(
      (defaultAutoAmount * monthlyRate * Math.pow(1 + monthlyRate, defaultTenure)) /
        (Math.pow(1 + monthlyRate, defaultTenure) - 1)
    );

    let messageText = `Great news, Mukesh. Since your existing sedan vehicle loan has just 2 installments left with a 100% on-time record, you are pre-qualified for an independent Auto Loan of up to ₹12,00,000 at 8.35% p.a. (Zero impact on your personal line).`;
    if (requestedAmount && requestedAmount > 0) {
      if (requestedAmount > maxAutoLimit) {
        messageText = `You requested ₹${requestedAmount.toLocaleString('en-IN')} for your vehicle purchase. Your independent pre-qualified Auto Loan eligibility is up to ₹12,00,000 at 8.35% p.a. I have structured your offer for ₹12,00,000.`;
      } else {
        messageText = `Good news, Mukesh. As requested, your independent pre-approved Auto Loan offer for ₹${defaultAutoAmount.toLocaleString('en-IN')} is ready at 8.35% p.a. with an EMI of ₹${indicativeEMI.toLocaleString('en-IN')}/month.`;
      }
    }

    return {
      id: `ai_${Date.now()}`,
      sender: 'ai',
      text: messageText,
      timestamp,
      intentCategory: 'LOAN_AUTO',
      widgetType: 'AUTO_LOAN_OFFER',
      widgetData: {
        loanType: 'Pre-Approved Auto Loan',
        isPersonalLine: false,
        amount: defaultAutoAmount,
        defaultAmount: defaultAutoAmount,
        maxAmount: maxAutoLimit,
        minAmount: 100000,
        tenure: '5 Years (60 months)',
        defaultTenure: 60,
        indicativeEMI,
        rate: '8.35% p.a.',
        interestRateNum: 8.35,
        allowedTenures: [12, 24, 36, 48, 60, 84],
        processing: '100% Digital Fast-Track',
        existingStatus: 'Previous auto loan matured with 100% on-time record',
      },
    };
  }

  // 6. Tractor / Agri Asset Finance (Independent Loan)
  if (
    query.includes('tractor') ||
    query.includes('farm') ||
    query.includes('agriculture') ||
    query.includes('agri')
  ) {
    const requestedAmount = parseAmountFromQuery(query);
    const maxTractorLimit = 750000;
    const defaultTractorAmount = requestedAmount && requestedAmount > 0 
      ? Math.min(requestedAmount, maxTractorLimit) 
      : 500000;
    const defaultTenure = 48;
    const annualRate = 9.20;
    const monthlyRate = annualRate / 12 / 100;
    const indicativeEMI = Math.round(
      (defaultTractorAmount * monthlyRate * Math.pow(1 + monthlyRate, defaultTenure)) /
        (Math.pow(1 + monthlyRate, defaultTenure) - 1)
    );

    let messageText = `Certainly, Mukesh. Based on your profile and rural equipment finance parameters, you are eligible for an independent Tractor Finance loan up to ₹7,50,000 with direct dealer disbursement.`;
    if (requestedAmount && requestedAmount > 0) {
      messageText = `Good news, Mukesh. As requested, your independent Tractor Finance offer for ₹${defaultTractorAmount.toLocaleString('en-IN')} is ready at 9.20% p.a. (Eligibility up to ₹7.5 Lakhs).`;
    }

    return {
      id: `ai_${Date.now()}`,
      sender: 'ai',
      text: messageText,
      timestamp,
      intentCategory: 'LOAN_TRACTOR',
      widgetType: 'TRACTOR_FINANCE_OFFER',
      widgetData: {
        loanType: 'Tractor & Agri Equipment Finance',
        isPersonalLine: false,
        amount: defaultTractorAmount,
        defaultAmount: defaultTractorAmount,
        maxAmount: maxTractorLimit,
        minAmount: 100000,
        tenure: '4 Years (48 months)',
        defaultTenure: 48,
        indicativeEMI,
        rate: '9.20% p.a.',
        interestRateNum: 9.20,
        allowedTenures: [12, 24, 36, 48, 60],
        dealerNetwork: 'Partnered with Mahindra, Sonalika, John Deere, Tafe',
      },
    };
  }

  // 7. Commercial Vehicle Finance (Independent Loan)
  if (
    query.includes('commercial vehicle') ||
    query.includes('truck') ||
    query.includes('cargo') ||
    query.includes('fleet') ||
    query.includes('logistics')
  ) {
    const requestedAmount = parseAmountFromQuery(query);
    const maxCommercialLimit = 2500000;
    const defaultCommercialAmount = requestedAmount && requestedAmount > 0 
      ? Math.min(requestedAmount, maxCommercialLimit) 
      : 1500000;
    const defaultTenure = 60;
    const annualRate = 8.90;
    const monthlyRate = annualRate / 12 / 100;
    const indicativeEMI = Math.round(
      (defaultCommercialAmount * monthlyRate * Math.pow(1 + monthlyRate, defaultTenure)) /
        (Math.pow(1 + monthlyRate, defaultTenure) - 1)
    );

    let messageText = `I can help with commercial vehicle financing. Based on your banking relationship and healthy cashflows, you are eligible for an independent commercial credit facility up to ₹25,00,000.`;
    if (requestedAmount && requestedAmount > 0) {
      messageText = `Good news, Mukesh. Your independent commercial vehicle offer for ₹${defaultCommercialAmount.toLocaleString('en-IN')} is ready at 8.90% p.a.`;
    }

    return {
      id: `ai_${Date.now()}`,
      sender: 'ai',
      text: messageText,
      timestamp,
      intentCategory: 'LOAN_COMMERCIAL_VEHICLE',
      widgetType: 'COMMERCIAL_VEHICLE_OFFER',
      widgetData: {
        loanType: 'Commercial Vehicle Finance',
        isPersonalLine: false,
        amount: defaultCommercialAmount,
        defaultAmount: defaultCommercialAmount,
        maxAmount: maxCommercialLimit,
        minAmount: 200000,
        tenure: '5 Years (60 months)',
        defaultTenure: 60,
        indicativeEMI,
        rate: '8.90% p.a.',
        interestRateNum: 8.90,
        allowedTenures: [12, 24, 36, 48, 60],
        fleetDiscount: 'Zero documentation fees for existing customers',
      },
    };
  }

  // 8. Eligibility / Product Discovery
  if (
    query.includes('eligible') ||
    query.includes('eligibility') ||
    query.includes('what offers') ||
    query.includes('offers') ||
    query.includes('recommend')
  ) {
    return {
      id: `ai_${Date.now()}`,
      sender: 'ai',
      text: `Here are the top pre-qualified financial opportunities generated for your profile (Bureau Score: 782):`,
      timestamp,
      intentCategory: 'DISCOVERY_OFFERS',
      widgetType: 'OFFERS_SUMMARY',
      widgetData: {
        offers: LENDING_OFFERS,
      },
    };
  }

  // 9. Balance & Accounts Check
  if (
    query.includes('balance') ||
    query.includes('account') ||
    query.includes('how much money') ||
    query.includes('fd')
  ) {
    const totalBalance = profile.accounts.reduce((sum, acc) => sum + acc.balance, 0);
    return {
      id: `ai_${Date.now()}`,
      sender: 'ai',
      text: `You have a total combined balance of ₹${totalBalance.toLocaleString('en-IN')} across your savings, salary, and fixed deposit accounts.`,
      timestamp,
      intentCategory: 'SERVICE_BALANCE',
      widgetType: 'BALANCE_CARD',
      widgetData: {
        accounts: profile.accounts,
        totalBalance,
      },
    };
  }

  // 10. Why am I seeing this? (Explainability)
  if (
    query.includes('why') ||
    query.includes('how do you know') ||
    query.includes('explain') ||
    query.includes('criteria')
  ) {
    return {
      id: `ai_${Date.now()}`,
      sender: 'ai',
      text: `Every recommendation is dynamically orchestrated by checking your 12-year ONE Bank transaction history, verified bureau score (782), and external liability records without compromising your data privacy.`,
      timestamp,
      intentCategory: 'EXPLAINABILITY',
      widgetType: 'EXPLAINABILITY_CARD',
      widgetData: {
        bureauScore: profile.bureauScore,
        relationshipYears: profile.relationshipYears,
        factors: [
          'Zero delayed payments across 12-year history',
          'Healthy monthly average balance > ₹2,00,000',
          'Stable salary credits from corporate employer',
          'High credit headroom on existing credit card',
        ],
      },
    };
  }

  // Try calling server-side Gemini if query is open-ended
  try {
    const res = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userInput,
        customerProfile: profile,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.hasGemini && data.reply) {
        return {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: data.reply,
          timestamp,
          intentCategory: 'GENERAL_CONVERSATION',
        };
      }
    }
  } catch (e) {
    // Silently fall back to conversational response
  }

  // Default intelligent assistant fallback
  return {
    id: `ai_${Date.now()}`,
    sender: 'ai',
    text: `I understand you're looking for assistance with "${userInput}". You can ask me for instant funding ("I need a loan"), money transfers ("Transfer ₹5,000 to my wife"), bill payments ("Pay my Airtel bill"), or lending solutions ("Buy a car", "Tractor loan", "Reduce home loan EMI"). How would you like to proceed?`,
    timestamp,
    intentCategory: 'GENERAL_CONVERSATION',
  };
}
