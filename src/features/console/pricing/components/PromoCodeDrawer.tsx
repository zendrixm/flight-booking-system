import { useId, useState } from 'react';

import { Icon } from '@/components/icons';
import { Button, Drawer, IconButton, Popover, SegmentedControl, TextField } from '@/components/ui';
import { formatNumber } from '@/lib/format';
import type { DiscountType, PromoCode, PromoCodeDraft, PromoRoute } from '@/types/console/pricing';

import {
  customerPreview,
  DEFAULT_DISCOUNT,
  digitsOnly,
  newPromoValues,
  normalizeCode,
  promoFormErrors,
  toPromoDraft,
  valuesFromPromo,
  type PromoFormValues,
} from '../lib/promoCodeForm';
import styles from './PromoCodeDrawer.module.css';

interface PromoCodeDrawerProps {
  /** The code being edited; omit to create one. */
  promo?: PromoCode;
  existingCodes: readonly string[];
  routeOptions: readonly PromoRoute[];
  airlineName: string;
  onClose: () => void;
  /** Resolves when saved; the drawer stays open if it rejects. */
  onSubmit: (draft: PromoCodeDraft) => Promise<void>;
}

const DISCOUNT_TYPES: ReadonlyArray<{ value: DiscountType; label: string }> = [
  { value: 'percent', label: 'Percentage' },
  { value: 'fixed', label: 'Fixed amount' },
];

/** Creates or edits a promo code. Mount it only while open so each opening starts fresh. */
export function PromoCodeDrawer({
  promo,
  existingCodes,
  routeOptions,
  airlineName,
  onClose,
  onSubmit,
}: PromoCodeDrawerProps) {
  const isNew = promo === undefined;
  const [values, setValues] = useState<PromoFormValues>(() =>
    promo ? valuesFromPromo(promo) : newPromoValues(),
  );
  const [hasTried, setHasTried] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRoutePickerOpen, setIsRoutePickerOpen] = useState(false);
  const routesLabelId = useId();

  const errors = promoFormErrors(values, existingCodes, isNew);
  const shownErrors = hasTried ? errors : {};
  const preview = customerPreview(values, routeOptions);
  const edit = (change: Partial<PromoFormValues>) => setValues((current) => ({ ...current, ...change }));
  const toggleRoute = (route: string) =>
    edit({
      routes: values.routes.includes(route)
        ? values.routes.filter((item) => item !== route)
        : [...values.routes, route],
    });

  const submit = async () => {
    setHasTried(true);
    if (Object.keys(errors).length > 0) return;
    setIsSaving(true);
    try {
      await onSubmit(toPromoDraft(values));
    } finally {
      setIsSaving(false);
    }
  };

  const usage = promo
    ? promo.redemptionLimit
      ? `${formatNumber(promo.redemptions)} of ${formatNumber(promo.redemptionLimit)} used`
      : `${formatNumber(promo.redemptions)} used`
    : '';

  return (
    <Drawer
      open
      onClose={onClose}
      title={isNew ? 'New promo code' : 'Edit promo code'}
      description={
        isNew
          ? 'Scheduled codes go live at 00:00 PHT on the start date'
          : `${promo.code} · ${usage} · changes apply to new bookings only`
      }
      footer={
        <>
          <Button variant="quiet" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" loading={isSaving} onClick={submit}>
            {isNew ? 'Schedule promo' : 'Save changes'}
          </Button>
        </>
      }
    >
      <form
        noValidate
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        {isNew ? (
          <TextField
            label="Code"
            required
            placeholder="e.g. SEOULWINTER"
            maxLength={16}
            autoComplete="off"
            inputClassName={styles.codeInput}
            value={values.code}
            error={shownErrors.code}
            helpText="Letters and numbers, up to 16 characters"
            onChange={(event) => edit({ code: normalizeCode(event.target.value) })}
          />
        ) : (
          <TextField
            label="Code"
            readOnly
            inputClassName={styles.codeInput}
            value={values.code}
            helpText="Codes can’t be renamed once customers have used them"
            trailing={<Icon name="lock" size={14} className={styles.lockIcon} />}
          />
        )}

        <div className={styles.group}>
          <span className={styles.groupLabel} aria-hidden="true">
            Discount
          </span>
          <SegmentedControl<DiscountType>
            label="Discount type"
            appearance="soft"
            fullWidth
            options={DISCOUNT_TYPES}
            value={values.discountType}
            onChange={(discountType) => edit({ discountType, discountValue: DEFAULT_DISCOUNT[discountType] })}
          />
        </div>

        <div className={styles.pair}>
          <TextField
            label={values.discountType === 'percent' ? 'Percent off' : 'Amount off (₱)'}
            required
            inputMode="numeric"
            value={values.discountValue}
            error={shownErrors.discountValue}
            onChange={(event) => edit({ discountValue: digitsOnly(event.target.value) })}
          />
          <TextField
            label="Minimum spend (₱)"
            inputMode="numeric"
            value={values.minimumSpend}
            onChange={(event) => edit({ minimumSpend: event.target.value.replace(/[^\d,]/g, '') })}
          />
        </div>

        <div className={styles.group}>
          <span id={routesLabelId} className={styles.routesLabel}>
            Eligible routes <span className="visually-hidden">(required)</span>
            <span className={styles.routeCount}>
              {values.routes.length} {values.routes.length === 1 ? 'route' : 'routes'}
            </span>
          </span>
          {values.routes.length > 0 && (
            <ul aria-labelledby={routesLabelId} className={styles.chips}>
              {values.routes.map((route) => (
                <li key={route} className={styles.chip}>
                  {route}
                  <IconButton
                    icon="close"
                    label={`Remove route ${route}`}
                    size="small"
                    iconSize={14}
                    onClick={() => toggleRoute(route)}
                  />
                </li>
              ))}
            </ul>
          )}
          <Popover
            open={isRoutePickerOpen}
            onOpenChange={setIsRoutePickerOpen}
            label="Add a route"
            block
            panelClassName={styles.picker}
            trigger={(triggerProps) => (
              <Button
                {...triggerProps}
                variant="quiet"
                size="small"
                iconStart="plus"
                className={styles.addRoute}
              >
                Add route
              </Button>
            )}
          >
            <span className={styles.pickerTitle}>{airlineName} routes from the Philippines</span>
            <div className={styles.options}>
              {routeOptions.map((option) => (
                <button
                  key={option.route}
                  type="button"
                  className={styles.option}
                  aria-pressed={values.routes.includes(option.route)}
                  onClick={() => toggleRoute(option.route)}
                >
                  {option.route}
                </button>
              ))}
            </div>
            <Button
              variant="ghost"
              size="small"
              className={styles.done}
              onClick={() => setIsRoutePickerOpen(false)}
            >
              Done
            </Button>
          </Popover>
          {shownErrors.routes && (
            <p role="alert" className={styles.error}>
              {shownErrors.routes}
            </p>
          )}
        </div>

        <div className={styles.pair}>
          <TextField
            label="Starts"
            required
            type="date"
            value={values.startDate}
            onChange={(event) => edit({ startDate: event.target.value })}
          />
          <TextField
            label="Ends"
            type="date"
            value={values.endDate}
            error={shownErrors.endDate}
            helpText={values.endDate ? undefined : 'Runs until paused'}
            onChange={(event) => edit({ endDate: event.target.value })}
          />
        </div>

        <div className={styles.preview} aria-live="polite">
          <span className={styles.previewLabel}>Customers will see</span>
          <span className={styles.previewHeadline}>{preview.headline}</span>
          <span className={styles.previewDetail}>{preview.detail}</span>
        </div>
      </form>
    </Drawer>
  );
}
