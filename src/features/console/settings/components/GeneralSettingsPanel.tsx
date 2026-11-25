import { useState } from 'react';
import { Link } from 'react-router';

import { paths } from '@/app/paths';
import { Icon } from '@/components/icons';
import { Button, ChoiceCard, Dialog, SelectField, TextField } from '@/components/ui';
import type {
  CurrencyCode,
  GeneralSettings,
  LogoVariant,
  MarketCode,
  SupportHours,
  TimeZone,
} from '@/types/console/settings';

import {
  CURRENCIES,
  currencyHelp,
  helpFor,
  LOGO_VARIANTS,
  logoVariant,
  MARKETS,
  SUPPORT_HOURS,
  TIME_ZONES,
  timeZoneHelp,
} from '../lib/settingsCopy';
import type { SettingsErrors } from '../lib/settingsForm';
import { LogoPreview } from './LogoPreview';
import { SettingsCard, SettingsGrid, SettingsRow } from './SettingsLayout';
import styles from './SettingsPanels.module.css';

interface GeneralSettingsPanelProps {
  draft: GeneralSettings;
  savedLogo: LogoVariant;
  logoUpdated: string;
  errors: SettingsErrors;
  onChange: (change: Partial<GeneralSettings>) => void;
  onDownloadLogo: (fileName: string) => void;
}

export function GeneralSettingsPanel({
  draft,
  savedLogo,
  logoUpdated,
  errors,
  onChange,
  onDownloadLogo,
}: GeneralSettingsPanelProps) {
  const [isLogoPickerOpen, setIsLogoPickerOpen] = useState(false);
  const logo = logoVariant(draft.logo);
  const isLogoChanged = draft.logo !== savedLogo;

  return (
    <>
      <SettingsCard
        title="Workspace profile"
        description="Shown on tax invoices, e-tickets and customer emails for this market."
      >
        <SettingsGrid>
          <TextField
            label="Workspace name"
            required
            value={draft.workspaceName}
            error={errors.workspaceName}
            helpText="Shown in the console and on staff emails"
            onChange={(event) => onChange({ workspaceName: event.target.value })}
          />
          <TextField
            label="Legal entity"
            required
            value={draft.legalEntity}
            error={errors.legalEntity}
            helpText="Printed on tax invoices and e-ticket receipts"
            onChange={(event) => onChange({ legalEntity: event.target.value })}
          />
          <SelectField
            label="Default market"
            required
            value={draft.market}
            options={MARKETS}
            helpText={helpFor(MARKETS, draft.market)}
            onChange={(event) => onChange({ market: event.target.value as MarketCode })}
          />
          <SelectField
            label="Currency"
            required
            value={draft.currency}
            options={CURRENCIES}
            helpText={currencyHelp(draft.currency)}
            onChange={(event) => onChange({ currency: event.target.value as CurrencyCode })}
          />
          <SelectField
            label="Time zone"
            required
            value={draft.timeZone}
            options={TIME_ZONES}
            helpText={timeZoneHelp(draft.timeZone)}
            onChange={(event) => onChange({ timeZone: event.target.value as TimeZone })}
          />
          <TextField
            label="Booking reference prefix"
            value="VL"
            readOnly
            helpText="Fixed for this workspace · references look like VL7Q2K"
            trailing={<Icon name="lock" size={14} className={styles.mutedIcon} />}
          />
        </SettingsGrid>
      </SettingsCard>

      <SettingsCard
        title="Customer support contact"
        description="Shown in confirmation emails, on e-tickets and in the Help center."
        aside={<Link to={paths.help}>Preview Help center</Link>}
      >
        <SettingsGrid>
          <TextField
            label="Support email"
            required
            type="email"
            value={draft.supportEmail}
            error={errors.supportEmail}
            onChange={(event) => onChange({ supportEmail: event.target.value })}
          />
          <TextField
            label="Support phone"
            required
            type="tel"
            value={draft.supportPhone}
            error={errors.supportPhone}
            onChange={(event) => onChange({ supportPhone: event.target.value })}
          />
          <SelectField
            label="Phone support hours"
            required
            value={draft.supportHours}
            options={SUPPORT_HOURS}
            helpText={helpFor(SUPPORT_HOURS, draft.supportHours)}
            onChange={(event) => onChange({ supportHours: event.target.value as SupportHours })}
          />
        </SettingsGrid>
      </SettingsCard>

      <SettingsCard title="Logo" description="Used on e-tickets, invoices and email headers.">
        <SettingsRow>
          <LogoPreview variant={draft.logo} />
          <span className={styles.stack}>
            <span className={styles.strong}>{logo.label} logo</span>
            <span className={styles.meta}>{logo.fileName} · SVG · 4 KB</span>
            <span className={isLogoChanged ? styles.pending : styles.meta}>
              {isLogoChanged ? `Not saved yet · replaces ${logoVariant(savedLogo).fileName}` : logoUpdated}
            </span>
          </span>
          <span className={styles.actions}>
            <Button variant="quiet" aria-haspopup="dialog" onClick={() => setIsLogoPickerOpen(true)}>
              Replace
            </Button>
            <Button
              variant="quiet"
              iconStart="download"
              aria-label="Download logo files"
              onClick={() => onDownloadLogo(logo.fileName)}
            >
              Download
            </Button>
          </span>
        </SettingsRow>
      </SettingsCard>

      {isLogoPickerOpen && (
        <LogoPickerDialog
          current={draft.logo}
          onClose={() => setIsLogoPickerOpen(false)}
          onPick={(variant) => {
            onChange({ logo: variant });
            setIsLogoPickerOpen(false);
          }}
        />
      )}
    </>
  );
}

function LogoPickerDialog({
  current,
  onClose,
  onPick,
}: {
  current: LogoVariant;
  onClose: () => void;
  onPick: (variant: LogoVariant) => void;
}) {
  const [picked, setPicked] = useState(current);
  return (
    <Dialog
      open
      onClose={onClose}
      size="medium"
      title="Replace logo"
      description="Pick a version from the Vela brand library. Uploads are handled by the brand team."
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => onPick(picked)}>
            Use this logo
          </Button>
        </>
      }
    >
      <fieldset className={styles.choices}>
        <legend className="visually-hidden">Logo version</legend>
        {LOGO_VARIANTS.map((variant) => (
          <ChoiceCard
            key={variant.value}
            name="logo-variant"
            indicator="end"
            leading={<LogoPreview variant={variant.value} size="small" />}
            title={variant.label}
            description={variant.description}
            checked={picked === variant.value}
            onChange={() => setPicked(variant.value)}
          />
        ))}
      </fieldset>
    </Dialog>
  );
}
