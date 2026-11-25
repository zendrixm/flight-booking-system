import { useState } from 'react';
import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { Icon } from '@/components/icons';
import { Button, Checkbox } from '@/components/ui';
import type { BillingAddress, CompanyBillingDetails } from '@/types/payment';

import { BillingAddressForm } from './BillingAddressForm';
import styles from './BillingCard.module.css';
import { CompanyDetailsForm, EMPTY_COMPANY } from './CompanyDetailsForm';

interface BillingCardProps {
  accountName: string;
  receiptEmail: string;
  address: BillingAddress;
  company: CompanyBillingDetails | null;
  isSaving: boolean;
  /** Resolve `true` once saved so the card can leave edit mode. */
  onSaveAddress: (address: BillingAddress) => Promise<boolean>;
  onSaveCompany: (company: CompanyBillingDetails | null) => Promise<boolean>;
}

/** Billing address for receipts and card checks, plus optional company details for invoices. */
export function BillingCard({
  accountName,
  receiptEmail,
  address,
  company,
  isSaving,
  onSaveAddress,
  onSaveCompany,
}: BillingCardProps) {
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isAddressSaved, setIsAddressSaved] = useState(false);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isCompanySaved, setIsCompanySaved] = useState(false);
  const isCompanyOn = company !== null || isEditingCompany;

  const toggleCompany = async (checked: boolean) => {
    setIsCompanySaved(false);
    if (checked) {
      setIsEditingCompany(true);
      return;
    }
    setIsEditingCompany(false);
    if (company) await onSaveCompany(null);
  };

  return (
    <section aria-labelledby="billing-title" className={styles.card}>
      <div className={styles.header}>
        <h2 id="billing-title" className={styles.title}>
          Billing address
        </h2>
        {!isEditingAddress && (
          <Button
            variant="quiet"
            size="small"
            onClick={() => {
              setIsEditingAddress(true);
              setIsAddressSaved(false);
            }}
          >
            Edit
          </Button>
        )}
      </div>

      {isEditingAddress ? (
        <BillingAddressForm
          initialAddress={address}
          isSaving={isSaving}
          onCancel={() => setIsEditingAddress(false)}
          onSave={async (next) => {
            if (await onSaveAddress(next)) {
              setIsEditingAddress(false);
              setIsAddressSaved(true);
            }
          }}
        />
      ) : (
        <>
          {isAddressSaved && (
            <p role="status" className={styles.savedNote}>
              <Icon name="checkCircle" size={16} strokeWidth={1.8} />
              Billing address saved. New receipts use it from today.
            </p>
          )}
          <address className={styles.address}>
            <span className={styles.addressName}>{accountName}</span>
            <span>{address.line1}</span>
            <span>
              {address.city}, {address.postalCode}
            </span>
            <span>{address.country}</span>
          </address>
          <span className={styles.hint}>Used for receipts and card verification.</span>
        </>
      )}

      <div className={styles.receipts}>
        <h3 className={styles.groupLabel}>Receipts</h3>
        <span className={styles.receiptEmail}>
          <span>Sent to {receiptEmail}</span>
          <Link to={`${paths.account.settings}#profile`} className={styles.link}>
            Change
          </Link>
        </span>
        <Checkbox
          label="Add company name and TIN to receipts"
          checked={isCompanyOn}
          disabled={isSaving}
          onChange={(event) => toggleCompany(event.target.checked)}
        />
        {isEditingCompany ? (
          <CompanyDetailsForm
            initialDetails={company ?? EMPTY_COMPANY}
            isSaving={isSaving}
            onCancel={() => setIsEditingCompany(false)}
            onSave={async (details) => {
              if (await onSaveCompany(details)) {
                setIsEditingCompany(false);
                setIsCompanySaved(true);
              }
            }}
          />
        ) : (
          company && (
            <div className={styles.company}>
              {isCompanySaved && (
                <span role="status" className={styles.companySaved}>
                  <Icon name="check" size={14} strokeWidth={2.4} />
                  Saved — your next receipts show these details
                </span>
              )}
              <span className={styles.companyRow}>
                <span className={styles.companyText}>
                  <span className={styles.companyName}>{company.name}</span>
                  <span className={styles.tabular}>TIN {company.tin}</span>
                  <span className={styles.companyAddress}>{company.address}</span>
                </span>
                <button
                  type="button"
                  className={styles.textButton}
                  aria-label="Edit company details"
                  onClick={() => {
                    setIsEditingCompany(true);
                    setIsCompanySaved(false);
                  }}
                >
                  Edit
                </button>
              </span>
            </div>
          )
        )}
      </div>
    </section>
  );
}
