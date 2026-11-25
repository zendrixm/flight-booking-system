import { DEMO_TODAY } from '@/config/demo';
import { LINKABLE_BANKS } from '@/data/paymentOptions';
import { digitsOnly } from '@/lib/validation';
import { BANK_ACCOUNTS_FOR_LINKING, TRAVEL_CREDIT } from '@/mocks/paymentProfile';
import type {
  BankAccountOption,
  BillingAddress,
  CompanyBillingDetails,
  PaymentProfile,
  SavedCard,
} from '@/types/payment';
import type { TravelCredit } from '@/types/travelCredit';

import { ApiError, mockRequest } from './mockApi';
import { getPaymentProfile, updatePaymentProfile } from './paymentsService';

/**
 * Account-level payment settings. Card numbers go straight to the payment provider;
 * only the last four digits and expiry ever reach Vela.
 */

export interface NewCardInput {
  holderName: string;
  number: string;
  /** "MM / YY" */
  expiry: string;
  makeDefault: boolean;
}

/** How long an e-wallet link request stays valid in the wallet app. */
const WALLET_REQUEST_TTL_SECONDS = 281;

let nextCardId = 1;

export async function addCard(input: NewCardInput): Promise<PaymentProfile> {
  const profile = await getPaymentProfile();
  const digits = digitsOnly(input.number);
  const card: SavedCard = {
    id: `card_new_${nextCardId++}`,
    last4: digits.slice(-4),
    kind: 'Credit',
    holderName: input.holderName.trim().toUpperCase(),
    expiry: input.expiry.replace(/\s/g, ''),
    usageNote: 'Added just now',
  };
  return updatePaymentProfile({
    cards: [...profile.cards, card],
    defaultCardId: input.makeDefault ? card.id : profile.defaultCardId,
  });
}

export async function setDefaultCard(cardId: string): Promise<PaymentProfile> {
  return updatePaymentProfile({ defaultCardId: cardId });
}

export async function removeCard(cardId: string): Promise<PaymentProfile> {
  const profile = await getPaymentProfile();
  if (profile.defaultCardId === cardId) {
    throw new ApiError('default_card', 'Choose another default card before removing this one.');
  }
  return updatePaymentProfile({ cards: profile.cards.filter((card) => card.id !== cardId) });
}

/** Sends a link request to the e-wallet app registered to `mobileNumber` (10 digits after +63). */
export function requestWalletLink(mobileNumber: string): Promise<{ expiresInSeconds: number }> {
  return mockRequest(() => {
    if (digitsOnly(mobileNumber).length !== 10) {
      throw new ApiError('invalid_number', 'Enter a 10-digit mobile number.');
    }
    return { expiresInSeconds: WALLET_REQUEST_TTL_SECONDS };
  });
}

/** Completes the link once the customer has approved it in the wallet app. */
export function confirmWalletLink(mobileNumber: string): Promise<PaymentProfile> {
  const digits = digitsOnly(mobileNumber);
  return updatePaymentProfile({
    wallet: {
      mobileNumber: `+63 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`,
      linkedOn: DEMO_TODAY,
    },
  });
}

export function unlinkWallet(): Promise<PaymentProfile> {
  return updatePaymentProfile({ wallet: null });
}

/** The accounts the bank offers after the customer signs in with it. */
export function listBankAccounts(bankId: string): Promise<BankAccountOption[]> {
  return mockRequest(() => {
    if (!LINKABLE_BANKS.some((bank) => bank.id === bankId)) {
      throw new ApiError('unknown_bank', 'That bank isn’t supported.');
    }
    return [...BANK_ACCOUNTS_FOR_LINKING];
  });
}

export async function linkBankAccount(bankId: string, accountId: string): Promise<PaymentProfile> {
  const bank = LINKABLE_BANKS.find((candidate) => candidate.id === bankId);
  const account = BANK_ACCOUNTS_FOR_LINKING.find((candidate) => candidate.id === accountId);
  if (!bank || !account) throw new ApiError('not_found', 'That account couldn’t be linked.');
  return updatePaymentProfile({
    bankAccount: {
      bankId: bank.id,
      bankName: bank.name,
      accountLabel: account.label,
      accountName: account.holderName,
      linkedOn: DEMO_TODAY,
    },
  });
}

export function unlinkBankAccount(): Promise<PaymentProfile> {
  return updatePaymentProfile({ bankAccount: null });
}

export function updateBillingAddress(address: BillingAddress): Promise<PaymentProfile> {
  return updatePaymentProfile({ billingAddress: address });
}

/** `null` stops adding company details to receipts. */
export function updateCompanyDetails(company: CompanyBillingDetails | null): Promise<PaymentProfile> {
  return updatePaymentProfile({ company });
}

export function getTravelCredit(): Promise<TravelCredit> {
  return mockRequest(() => TRAVEL_CREDIT);
}
