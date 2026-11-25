import { Fragment, useState } from 'react';

import {
  Alert,
  Button,
  Checkbox,
  ChoiceCard,
  SegmentedControl,
  StatusChip,
  Switch,
  TextField,
  type StatusTone,
} from '@/components/ui';

import { BUTTON_KINDS, BUTTON_STATES } from '../data/foundations';
import styles from './ComponentStatesSection.module.css';
import { DsPanel, DsSection } from './DsSection';

const STATUS_EXAMPLES: ReadonlyArray<{ label: string; tone: StatusTone }> = [
  { label: 'Confirmed', tone: 'success' },
  { label: 'On time', tone: 'success' },
  { label: 'Pending review', tone: 'warning' },
  { label: 'Delayed 2h 10m', tone: 'warning' },
  { label: 'Payment failed', tone: 'danger' },
  { label: 'Cancelled', tone: 'danger' },
  { label: 'Scheduled', tone: 'muted' },
  { label: 'Boarding', tone: 'solid' },
];

const DEFAULT_SPEC =
  'Select any button to see its spec. Hover and focus are live: point at a button or Tab to it.';

export function ComponentStatesSection() {
  const [spec, setSpec] = useState(DEFAULT_SPEC);
  const [isChecked, setIsChecked] = useState(true);
  const [isUnchecked, setIsUnchecked] = useState(false);
  const [isOn, setIsOn] = useState(true);
  const [isOff, setIsOff] = useState(false);
  const [segment, setSegment] = useState('selected');
  const [card, setCard] = useState('selected');

  return (
    <DsSection eyebrow="03 · Components" title="States, by opacity">
      <DsPanel
        title="Buttons"
        aside={
          <span role="status" className={styles.spec}>
            {spec}
          </span>
        }
      >
        <div className={styles.buttonGrid}>
          <span aria-hidden="true" />
          {BUTTON_STATES.map(({ state }) => (
            <span key={state} className={styles.columnHeading}>
              {state === 'Disabled' ? 'Disabled · 40%' : state}
            </span>
          ))}
          {BUTTON_KINDS.map((kind) => (
            <Fragment key={kind.variant}>
              <span className={styles.rowHeading}>{kind.name}</span>
              {BUTTON_STATES.map(({ state, spec: stateSpec }) => {
                const describe = () =>
                  setSpec(
                    `${kind.name} · ${state} — ${stateSpec}. 44px tall (48px beside a field), pill radius, 14px/600 label; ${kind.use}.`,
                  );
                return (
                  <span key={state} className={styles.cell}>
                    {state === 'Loading' ? (
                      <Button variant={kind.variant} loading loadingLabel="Saving…" onClick={describe}>
                        Continue
                      </Button>
                    ) : (
                      <Button variant={kind.variant} disabled={state === 'Disabled'} onClick={describe}>
                        Continue
                      </Button>
                    )}
                  </span>
                );
              })}
            </Fragment>
          ))}
        </div>
      </DsPanel>

      <div className={styles.twoUp}>
        <DsPanel title="Text fields">
          <div className={styles.fields}>
            <TextField
              label="Last name"
              required
              hint="Default"
              placeholder="As on passport"
              defaultValue=""
            />
            <TextField label="Last name" required hint="Filled" defaultValue="Reyes" />
            <TextField
              label="Passport expiry"
              required
              hint="Error"
              defaultValue="14 Mar 2027"
              error="Must be valid until 19 May 2027"
            />
            <TextField
              label="Promo code"
              hint="Success"
              defaultValue="VELA1000"
              successText="₱1,000 off applied"
            />
            <TextField
              label="Email"
              hint="Read only"
              readOnly
              value="andrea.reyes@example.com"
              helpText="Managed in account settings"
            />
            <TextField label="Gate" hint="Disabled" disabled value="141" helpText="Set by the airline feed" />
          </div>
        </DsPanel>

        <DsPanel title="Selection">
          <div className={styles.selection}>
            <div className={styles.inline}>
              <Checkbox
                label={isChecked ? 'Checked' : 'Unchecked'}
                checked={isChecked}
                onChange={() => setIsChecked(!isChecked)}
              />
              <Checkbox
                label={isUnchecked ? 'Checked' : 'Unchecked'}
                checked={isUnchecked}
                onChange={() => setIsUnchecked(!isUnchecked)}
              />
              <Checkbox label="Disabled" disabled />
            </div>
            <div className={styles.inline}>
              <Switch label={isOn ? 'On' : 'Off'} checked={isOn} onChange={setIsOn} />
              <Switch label={isOff ? 'On' : 'Off'} checked={isOff} onChange={setIsOff} />
              <Switch label="Locked" checked disabled onChange={() => undefined} />
            </div>
            <SegmentedControl
              label="Example segments"
              appearance="soft"
              options={[
                { value: 'selected', label: 'Selected' },
                { value: 'second', label: 'Option' },
                { value: 'third', label: 'Option' },
              ]}
              value={segment}
              onChange={setSegment}
            />
            <div className={styles.cards}>
              <ChoiceCard
                name="ds-card"
                title={card === 'selected' ? 'Selected card' : 'Card'}
                indicator="end"
                checked={card === 'selected'}
                onChange={() => setCard('selected')}
              />
              <ChoiceCard
                name="ds-card"
                title={card === 'other' ? 'Selected card' : 'Card'}
                indicator="end"
                checked={card === 'other'}
                onChange={() => setCard('other')}
              />
            </div>
          </div>
        </DsPanel>
      </div>

      <div className={styles.twoUp}>
        <DsPanel title="Status">
          <ul className={styles.chips}>
            {STATUS_EXAMPLES.map((status) => (
              <li key={status.label}>
                <StatusChip tone={status.tone}>{status.label}</StatusChip>
              </li>
            ))}
          </ul>
          <p className={styles.note}>
            Spruce means done or safe, Brass means attention, Garnet means failed or destructive. Status
            always carries a word and often an icon — never color alone.
          </p>
        </DsPanel>

        <DsPanel title="Messages">
          <Alert tone="success">Booking confirmed. Tickets are on their way to your inbox.</Alert>
          <Alert tone="attention">
            We’re holding this fare for 19:42. Seats aren’t guaranteed after that.
          </Alert>
          <Alert tone="danger">That card was declined. Try another card or e-wallet.</Alert>
        </DsPanel>
      </div>
    </DsSection>
  );
}
