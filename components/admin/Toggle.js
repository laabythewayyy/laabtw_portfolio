'use client';

/** The pill switch used for "Visible / Hidden", "Open to work" and yes/no fields. */
export default function Toggle({ on, onClick, disabled, onLabel = 'On', offLabel = 'Off', label }) {
  return (
    <button type="button" className={`toggle${on ? ' on' : ''}`} aria-pressed={on} aria-label={label} disabled={disabled} onClick={onClick}>
      <i aria-hidden="true" />
      <span>{on ? onLabel : offLabel}</span>
    </button>
  );
}
