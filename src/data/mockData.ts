import { CustomerProfile, ActivityItem, LendingOffer } from '../types';

export const INITIAL_CUSTOMER_PROFILE: CustomerProfile = {
  id: 'CUS100245',
  name: 'Mukesh Bansal',
  mobile: '+91 98XXXXXX45',
  customerId: 'CUS100245',
  relationshipYears: 12,
  bureauScore: 782,
  bureauProvider: 'CIBIL / Experian Verified',
  totalPreApprovedLimit: 200000, // 2 Lacs pre-approved line
  utilizedPreApprovedLimit: 0,
  accounts: [
    {
      id: 'acc_sav_01',
      type: 'SAVINGS',
      accountNumber: '••••••••8832',
      bankName: 'ONE Digital Bank',
      balance: 248500,
      currency: '₹',
      isPrimary: true,
    },
    {
      id: 'acc_sal_02',
      type: 'SALARY',
      accountNumber: '••••••••4190',
      bankName: 'ONE Digital Bank',
      balance: 185000,
      currency: '₹',
    },
    {
      id: 'acc_fd_03',
      type: 'FIXED_DEPOSIT',
      accountNumber: '••••••••9012',
      bankName: 'ONE Digital Bank',
      balance: 500000,
      currency: '₹',
    }
  ],
  creditCards: [
    {
      id: 'cc_hdfc_01',
      cardNumber: '•••• •••• •••• 4521',
      cardName: 'ONE Signature Metal Card',
      bank: 'ONE Bank',
      limit: 500000,
      availableLimit: 462500,
      isPreferred: true,
    },
    {
      id: 'cc_hdfc_02',
      cardNumber: '•••• •••• •••• 7719',
      cardName: 'Regalia Gold Partner Card',
      bank: 'HDFC Bank',
      limit: 350000,
      availableLimit: 290000,
      isPreferred: false,
    }
  ],
  beneficiaries: [
    {
      id: 'ben_wife_hdfc',
      nickname: 'Mrs. Bansal (Wife)',
      relation: 'Wife',
      holderName: 'Mrs. Bansal',
      bankName: 'HDFC Bank',
      accountNumber: 'XXXX1234',
      ifsc: 'HDFC0001024',
      isPrimary: false, // will be set dynamically via memory
    },
    {
      id: 'ben_wife_icici',
      nickname: 'Mrs. Bansal (Wife)',
      relation: 'Wife',
      holderName: 'Mrs. Bansal',
      bankName: 'ICICI Bank',
      accountNumber: 'XXXX4567',
      ifsc: 'ICIC0000982',
      isPrimary: false,
    },
    {
      id: 'ben_wife_sbi',
      nickname: 'Mrs. Bansal (Wife)',
      relation: 'Wife',
      holderName: 'Mrs. Bansal',
      bankName: 'State Bank of India',
      accountNumber: 'XXXX7890',
      ifsc: 'SBIN0004512',
      isPrimary: false,
    }
  ],
  existingLoans: [
    {
      id: 'loan_hl_01',
      type: 'HOME_LOAN',
      name: 'Prime Home Loan',
      lender: 'Apex Housing Bank (Other Lender)',
      outstandingAmount: 4200000,
      currentRate: 8.75,
      currentEMI: 46500,
      remainingTenureMonths: 144, // 12 years
    },
    {
      id: 'loan_vl_02',
      type: 'VEHICLE_LOAN',
      name: 'Sedan Auto Loan',
      lender: 'ONE Bank',
      outstandingAmount: 48000,
      currentRate: 8.40,
      currentEMI: 16200,
      remainingTenureMonths: 2, // Matures in 2 months!
      maturityStatus: 'Matures in 2 months (Upgrade Eligible)',
    }
  ],
  preferences: {
    preferredBeneficiaryWifeId: null, // Initial demo has no preferred set, so AI asks first time!
    preferredPaymentCardId: 'cc_hdfc_01',
    lastExploredCategory: null,
  }
};

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act_01',
    title: 'Salary Credit - TechCorp India',
    category: 'TRANSFER',
    amount: 185000,
    subtitle: 'Credited to Salary Account ending 4190',
    timestamp: 'Yesterday at 09:15 AM',
    status: 'COMPLETED',
    referenceNumber: 'TXN-SAL-983412',
  },
  {
    id: 'act_02',
    title: 'Swiggy Food Gourmet',
    category: 'TRANSFER',
    amount: 840,
    subtitle: 'Paid via Signature Card ending 4521',
    timestamp: '20 Aug, 08:30 PM',
    status: 'COMPLETED',
    referenceNumber: 'TXN-POS-449102',
  },
  {
    id: 'act_03',
    title: 'Existing Auto Loan EMI',
    category: 'TRANSFER',
    amount: 16200,
    subtitle: 'Auto-debited (Installment 34/36)',
    timestamp: '15 Aug, 10:00 AM',
    status: 'COMPLETED',
    referenceNumber: 'TXN-EMI-771239',
  }
];

export const LENDING_OFFERS: LendingOffer[] = [
  {
    id: 'offer_pl_line',
    title: 'Instant Personal Loan',
    tagline: 'Pre-approved 1-Click Disbursal (Up to ₹2,00,000 Line)',
    category: 'Personal Loan',
    eligibleAmount: 200000,
    indicativeTenure: '12 to 60 Months',
    indicativeEMI: 4480,
    interestRate: '10.5% p.a.',
    processingTime: 'Instant (under 5 seconds)',
    isPreApproved: true,
    whyRecommended: 'Based on 12-year flawless repayment history and verified Bureau Score of 782. Total pre-approved limit: ₹2,00,000.',
    badge: 'Pre-Approved ₹2.0 Lakh Line',
  },
  {
    id: 'offer_hl_bt',
    title: 'Home Loan Balance Transfer',
    tagline: 'Reduce Monthly EMI & Save Lakhs',
    category: 'Home Loan',
    eligibleAmount: 4200000,
    indicativeTenure: '12 Years (144 months)',
    indicativeEMI: 44200,
    interestRate: '8.10% p.a. (vs. your 8.75%)',
    processingTime: 'Digital E-Consent & Fast Track',
    isPreApproved: true,
    whyRecommended: 'Identified your existing ₹42 Lakh loan with external lender. Transferring saves ₹2,300/month (over ₹3.3 Lakhs total).',
    badge: 'Save ₹2,300/mo',
  },
  {
    id: 'offer_auto',
    title: 'Auto / Car Loan',
    tagline: 'Drive your dream vehicle',
    category: 'Auto Loan',
    eligibleAmount: 1200000,
    indicativeTenure: '5 Years (60 months)',
    indicativeEMI: 24750,
    interestRate: '8.35% p.a.',
    processingTime: 'Paperless Digital Approval',
    isPreApproved: false,
    whyRecommended: 'Your existing sedan car loan matures in 2 months with zero overdue records.',
    badge: 'Indicative ₹12 Lakh',
  },
  {
    id: 'offer_tractor',
    title: 'Tractor & Agri Asset Finance',
    tagline: 'Empowering farm equipment & machinery',
    category: 'Asset Finance',
    eligibleAmount: 750000,
    indicativeTenure: '4 Years (48 months)',
    indicativeEMI: 18900,
    interestRate: '9.20% p.a.',
    processingTime: 'Direct Dealer Settlement',
    isPreApproved: false,
    whyRecommended: 'Eligible under high-grade rural asset financing criteria.',
    badge: 'Up to ₹7.5 Lakh',
  },
  {
    id: 'offer_cv',
    title: 'Commercial Vehicle Finance',
    tagline: 'Fleet expansion & cargo logistics',
    category: 'Commercial Vehicle',
    eligibleAmount: 2500000,
    indicativeTenure: '5 Years (60 months)',
    indicativeEMI: 51200,
    interestRate: '8.90% p.a.',
    processingTime: 'Fast-Track Fleet Clearance',
    isPreApproved: false,
    whyRecommended: 'High commercial credit headroom with robust banking cash flows.',
    badge: 'Up to ₹25 Lakh',
  }
];

export const PROACTIVE_INSIGHTS = [
  {
    id: 'ins_hl',
    title: 'Home Loan Balance Transfer Opportunity',
    description: 'We noticed your existing ₹42L home loan with another lender at 8.75%. You are pre-qualified to transfer at 8.10% and save ₹2,300/month.',
    actionPrompt: 'My home loan EMI is too high',
    actionLabel: 'Explore EMI Reduction',
    tag: 'High Value Saving',
    accent: 'emerald',
  },
  {
    id: 'ins_pl',
    title: 'Instant Cash Pre-Approval',
    description: 'You have a pre-approved instant line up to ₹2,00,000 available at 1-click without documents or branch visits.',
    actionPrompt: 'I need an instant loan',
    actionLabel: 'Check Instant Line',
    tag: 'Instant Available',
    accent: 'blue',
  },
  {
    id: 'ins_vl',
    title: 'Auto Loan Maturing Soon',
    description: 'Your existing vehicle loan has only 2 installments remaining. Check your pre-approved upgrade eligibility for a new car.',
    actionPrompt: 'I am exploring for an auto loan',
    actionLabel: 'Check Car Eligibility',
    tag: 'Loan Maturity',
    accent: 'amber',
  }
];

export const AIRTEL_BILL = {
  billerName: 'Airtel Postpaid Mobility',
  accountNumber: '98XXXXXX45',
  amount: 1249,
  dueDate: '28 Aug 2026',
  cycle: 'Jul 20 - Aug 19, 2026',
};
