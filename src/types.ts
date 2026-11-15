export interface CustomerAccount {
  id: string;
  type: 'SAVINGS' | 'SALARY' | 'FIXED_DEPOSIT';
  accountNumber: string;
  bankName: string;
  balance: number;
  currency: string;
  isPrimary?: boolean;
}

export interface CreditCard {
  id: string;
  cardNumber: string; // Masked
  cardName: string;
  bank: string;
  limit: number;
  availableLimit: number;
  isPreferred: boolean;
}

export interface BeneficiaryAccount {
  id: string;
  nickname: string;
  relation: string; // e.g. "Wife"
  holderName: string;
  bankName: string;
  accountNumber: string; // Masked e.g. "XXXX1234"
  ifsc: string;
  isPrimary: boolean;
}

export interface ExistingLoan {
  id: string;
  type: 'HOME_LOAN' | 'VEHICLE_LOAN' | 'PERSONAL_LOAN';
  name: string;
  lender: string;
  outstandingAmount: number;
  currentRate: number;
  currentEMI: number;
  remainingTenureMonths: number;
  maturityStatus?: string;
  disbursedDate?: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  mobile: string;
  customerId: string;
  relationshipYears: number;
  bureauScore: number;
  bureauProvider: string;
  totalPreApprovedLimit: number; // e.g. 200000 (2 Lacs)
  utilizedPreApprovedLimit: number; // e.g. amount taken in loans
  accounts: CustomerAccount[];
  creditCards: CreditCard[];
  beneficiaries: BeneficiaryAccount[];
  existingLoans: ExistingLoan[];
  preferences: {
    preferredBeneficiaryWifeId: string | null;
    preferredPaymentCardId: string;
    lastExploredCategory: string | null;
  };
}

export type IntentCategory = 
  | 'PAYMENT_TRANSFER'
  | 'PAYMENT_BILL'
  | 'LOAN_PERSONAL_INSTANT'
  | 'LOAN_AUTO'
  | 'LOAN_TRACTOR'
  | 'LOAN_COMMERCIAL_VEHICLE'
  | 'LOAN_HOME_BALANCE_TRANSFER'
  | 'SERVICE_BALANCE'
  | 'DISCOVERY_OFFERS'
  | 'EXPLAINABILITY'
  | 'GENERAL_CONVERSATION';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  intentCategory?: IntentCategory;
  widgetType?: 
    | 'PERSONAL_LOAN_OFFER'
    | 'LOAN_CONFIGURATOR'
    | 'PERSONAL_LOAN_CONSENT'
    | 'PERSONAL_LOAN_SUCCESS'
    | 'WIFE_ACCOUNT_SELECTOR'
    | 'TRANSFER_CONFIRM'
    | 'TRANSFER_SUCCESS'
    | 'BILL_PAYMENT_CONFIRM'
    | 'BILL_PAYMENT_SUCCESS'
    | 'AUTO_LOAN_OFFER'
    | 'TRACTOR_FINANCE_OFFER'
    | 'COMMERCIAL_VEHICLE_OFFER'
    | 'HOME_LOAN_BT_OFFER'
    | 'HOME_LOAN_BT_CONSENT'
    | 'HOME_LOAN_BT_SUCCESS'
    | 'OFFERS_SUMMARY'
    | 'BALANCE_CARD'
    | 'EXPLAINABILITY_CARD';
  widgetData?: any;
  interactive?: boolean;
  isLoading?: boolean;
}

export interface ActivityItem {
  id: string;
  title: string;
  category: 'TRANSFER' | 'BILL_PAY' | 'DISBURSEMENT' | 'BALANCE_TRANSFER' | 'INQUIRY';
  amount?: number;
  subtitle: string;
  timestamp: string;
  status: 'COMPLETED' | 'DISBURSED' | 'PAID' | 'EXPLORED';
  referenceNumber: string;
  details?: Record<string, string | number>;
}

export interface LendingOffer {
  id: string;
  title: string;
  tagline: string;
  category: string;
  eligibleAmount: number;
  indicativeTenure: string;
  indicativeEMI: number;
  interestRate: string;
  processingTime: string;
  isPreApproved: boolean;
  whyRecommended: string;
  badge: string;
}
