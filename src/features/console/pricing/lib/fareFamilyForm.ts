import { formatNumber } from '@/lib/format';
import { MAX_CHANGE_FEE, MAX_MARKUP_PERCENT } from '@/services/console/pricingRules';
import type { BaggageAllowance, FareFamily, FareFamilyId, FareFamilyRules } from '@/types/console/pricing';

import type { SummaryRow } from '../../shared/components/SummaryList';

/** A fare family's rules as typed into its card. */
export interface FareFamilyDraft {
  checkedBaggage: BaggageAllowance;
  allowsChanges: boolean;
  changeFee: string;
  markupPercent: string;
  isRefundable: boolean;
}

export type FareFamilyDrafts = Record<FareFamilyId, FareFamilyDraft>;

export interface FareFamilyErrors {
  changeFee?: string;
  markupPercent?: string;
}

const WHOLE_PESOS = /^\d+$/;
const PERCENTAGE = /^\d+(\.\d+)?$/;

const digitsOf = (text: string) => text.replace(/[,\s]/g, '');

export function toDraft(rules: FareFamilyRules): FareFamilyDraft {
  return {
    checkedBaggage: rules.checkedBaggage,
    allowsChanges: rules.allowsChanges,
    changeFee: rules.allowsChanges ? formatNumber(rules.changeFee) : '',
    markupPercent: rules.markupPercent.toFixed(1),
    isRefundable: rules.isRefundable,
  };
}

export function draftsFrom(families: readonly FareFamily[]): FareFamilyDrafts {
  return Object.fromEntries(families.map((family) => [family.id, toDraft(family.rules)])) as FareFamilyDrafts;
}

export function fareFamilyErrors(draft: FareFamilyDraft): FareFamilyErrors {
  const errors: FareFamilyErrors = {};
  const fee = digitsOf(draft.changeFee);
  if (draft.allowsChanges) {
    if (!fee) errors.changeFee = 'Enter a fee, or 0 for free changes';
    else if (!WHOLE_PESOS.test(fee)) errors.changeFee = 'Use whole pesos, like 2,500';
    else if (Number(fee) > MAX_CHANGE_FEE)
      errors.changeFee = `Keep it under ₱${formatNumber(MAX_CHANGE_FEE)}`;
  }
  const markup = draft.markupPercent.trim();
  if (!PERCENTAGE.test(markup)) errors.markupPercent = 'Enter a percentage, like 4.0';
  else if (Number(markup) > MAX_MARKUP_PERCENT)
    errors.markupPercent = `Use 0 to ${MAX_MARKUP_PERCENT}% · higher needs Finance sign-off`;
  return errors;
}

export function countErrors(drafts: FareFamilyDrafts): number {
  return Object.values(drafts).reduce(
    (total, draft) => total + Object.keys(fareFamilyErrors(draft)).length,
    0,
  );
}

export function toRules(draft: FareFamilyDraft): FareFamilyRules {
  return {
    checkedBaggage: draft.checkedBaggage,
    allowsChanges: draft.allowsChanges,
    changeFee: draft.allowsChanges ? Number(digitsOf(draft.changeFee)) : 0,
    markupPercent: Number(draft.markupPercent),
    isRefundable: draft.isRefundable,
  };
}

export function rulesFromDrafts(drafts: FareFamilyDrafts): Record<FareFamilyId, FareFamilyRules> {
  return { saver: toRules(drafts.saver), classic: toRules(drafts.classic), flex: toRules(drafts.flex) };
}

const FIELD_LABELS: Record<keyof FareFamilyDraft, string> = {
  checkedBaggage: 'Checked baggage',
  changeFee: 'Change fee',
  markupPercent: 'Vela markup',
  allowsChanges: 'Changes allowed',
  isRefundable: 'Refundable',
};

const FIELD_ORDER: ReadonlyArray<keyof FareFamilyDraft> = [
  'checkedBaggage',
  'changeFee',
  'markupPercent',
  'allowsChanges',
  'isRefundable',
];

/** How a field reads in the change list; numbers are normalised so "4" and "4.0" match. */
function displayValue(field: keyof FareFamilyDraft, draft: FareFamilyDraft): string {
  switch (field) {
    case 'checkedBaggage':
      return draft.checkedBaggage;
    case 'changeFee': {
      if (!draft.allowsChanges) return 'Not allowed';
      const fee = digitsOf(draft.changeFee);
      if (!fee) return 'blank';
      return WHOLE_PESOS.test(fee) ? `₱${formatNumber(Number(fee))}` : `₱${draft.changeFee}`;
    }
    case 'markupPercent': {
      const markup = draft.markupPercent.trim();
      return PERCENTAGE.test(markup) ? `${Number(markup).toFixed(1)}%` : `${markup}%`;
    }
    case 'allowsChanges':
      return draft.allowsChanges ? 'Yes' : 'No';
    case 'isRefundable':
      return draft.isRefundable ? 'Yes' : 'No';
  }
}

/** "Saver · Checked baggage: None → 1 × 23 kg" for every edited field. */
export function listChanges(families: readonly FareFamily[], drafts: FareFamilyDrafts): SummaryRow[] {
  return families.flatMap((family) => {
    const saved = toDraft(family.rules);
    return FIELD_ORDER.flatMap((field) => {
      const before = displayValue(field, saved);
      const after = displayValue(field, drafts[family.id]);
      return before === after
        ? []
        : [{ label: `${family.name} · ${FIELD_LABELS[field]}`, value: `${before} → ${after}` }];
    });
  });
}
