import { Check } from 'lucide-react';

const STEPS = [
  { number: 1, label: 'Details' },
  { number: 2, label: 'Flights' },
  { number: 3, label: 'Hotel' },
  { number: 4, label: 'Activities' },
  { number: 5, label: 'Transport' },
];

const STYLES = `
.sp-wrapper {
  --primary: #003ec7;
  --on-surface: #191c1e;
  --on-surface-var: #434656;
  --outline-variant: #c3c5d9;
  --white: #ffffff;
  --font-headline: 'Hanken Grotesk', 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  background: var(--white);
  border-bottom: 1px solid rgba(195, 197, 217, 0.4);
  padding: 18px 40px;
}

.sp-track {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  align-items: center;
}

.sp-step {
  display: flex;
  align-items: center;
  flex: 1;
}

.sp-step:last-child { flex: 0; }

.sp-circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  border: 1.5px solid var(--outline-variant);
  background: var(--white);
  color: var(--on-surface-var);
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.sp-step--done .sp-circle {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--white);
}

.sp-step--current .sp-circle {
  border-color: var(--primary);
  color: var(--primary);
  font-weight: 700;
}

.sp-label {
  margin-left: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--on-surface-var);
  white-space: nowrap;
}

.sp-step--current .sp-label,
.sp-step--done .sp-label {
  color: var(--on-surface);
  font-weight: 700;
}

.sp-connector {
  flex: 1;
  height: 1.5px;
  background: var(--outline-variant);
  margin: 0 10px;
}

.sp-step--done + .sp-connector-wrap .sp-connector,
.sp-connector--done {
  background: var(--primary);
}

@media (max-width: 640px) {
  .sp-wrapper { padding: 14px 16px; }
  .sp-label { display: none; }
}
`;

/**
 * Replaces StepProgressComponent (Angular). Renders a 5-step indicator;
 * `currentStep` is 1-indexed. Steps before it render as done (checkmark),
 * the current step is outlined, later steps are dim.
 */
export default function StepProgress({ currentStep }) {
  return (
    <div className="sp-wrapper">
      <style>{STYLES}</style>
      <div className="sp-track">
        {STEPS.map((step, i) => {
          const isDone = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          return (
            <div className="sp-connector-wrap" key={step.number} style={{ display: 'flex', alignItems: 'center', flex: i === STEPS.length - 1 ? '0' : '1' }}>
              <div className={`sp-step ${isDone ? 'sp-step--done' : ''} ${isCurrent ? 'sp-step--current' : ''}`}>
                <div className="sp-circle">{isDone ? <Check size={14} /> : step.number}</div>
                <span className="sp-label">{step.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`sp-connector ${isDone ? 'sp-connector--done' : ''}`} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
