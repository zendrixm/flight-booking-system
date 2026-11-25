export interface Customer {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  mobile: string;
  memberTier: 'Blue' | 'Silver' | 'Gold';
  tripCount: number;
  /** Vela travel credit balance in pesos. */
  travelCredit: number;
}

export function fullNameOf(customer: Pick<Customer, 'firstName' | 'middleName' | 'lastName'>): string {
  return [customer.firstName, customer.middleName, customer.lastName].filter(Boolean).join(' ');
}
