import { isBlank, isValidEmail } from '@/lib/validation';
import type { PartnerKind } from '@/types/company';

export const MIN_PARTNER_MESSAGE_LENGTH = 10;

export const PARTNER_KIND_OPTIONS: ReadonlyArray<{ value: PartnerKind; label: string }> = [
  { value: 'airline', label: 'An airline' },
  { value: 'hotel', label: 'A hotel or stay' },
  { value: 'corporate', label: 'A company booking travel' },
  { value: 'media', label: 'Press or media' },
];

export function partnerKindFrom(value: string): PartnerKind | undefined {
  return PARTNER_KIND_OPTIONS.find((option) => option.value === value)?.value;
}

/** Name and email are asked for in both forms. */
export interface ContactDetailsForm {
  fullName: string;
  email: string;
}

export interface ApplicationForm extends ContactDetailsForm {
  link: string;
  message: string;
}

export interface PartnerForm extends ContactDetailsForm {
  company: string;
  kind: PartnerKind;
  message: string;
}

export const BLANK_APPLICATION: ApplicationForm = { fullName: '', email: '', link: '', message: '' };
export const BLANK_PARTNER_ENQUIRY: PartnerForm = {
  fullName: '',
  email: '',
  company: '',
  kind: 'airline',
  message: '',
};

type Errors<Form> = Partial<Record<keyof Form, string>>;

function contactErrors(form: ContactDetailsForm): Errors<ContactDetailsForm> {
  const errors: Errors<ContactDetailsForm> = {};
  if (isBlank(form.fullName)) errors.fullName = 'Enter your full name.';
  if (isBlank(form.email)) errors.email = 'Enter your email so we can reply.';
  else if (!isValidEmail(form.email.trim())) errors.email = 'Enter an email like name@example.com.';
  return errors;
}

const FULL_LINK = /^https?:\/\/\S+\.\S+/;

export function applicationErrors(form: ApplicationForm): Errors<ApplicationForm> {
  const errors: Errors<ApplicationForm> = contactErrors(form);
  if (!isBlank(form.link) && !FULL_LINK.test(form.link.trim())) {
    errors.link = 'Use a full link that starts with https://';
  }
  return errors;
}

export function partnerErrors(form: PartnerForm): Errors<PartnerForm> {
  const errors: Errors<PartnerForm> = contactErrors(form);
  if (isBlank(form.company)) errors.company = 'Enter your company or publication.';
  if (form.message.trim().length < MIN_PARTNER_MESSAGE_LENGTH) {
    errors.message = 'Tell us a little more — at least 10 characters.';
  }
  return errors;
}
