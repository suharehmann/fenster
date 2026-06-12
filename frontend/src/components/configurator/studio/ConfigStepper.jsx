import { CheckOutlined } from '@ant-design/icons';
import './ConfigStepper.scss';

export default function ConfigStepper({
  steps,
  activeIndex,
  maxClickableIndex = activeIndex,
  onSelect,
  ariaLabel = 'Konfigurationsschritte',
  getKey = (step, index) => step.id ?? index,
  getNum = (_step, index) => String(index + 1),
  getLabel = (step) => step.title ?? step.label ?? ''
}) {
  const stepCount = steps.length;
  const clickableLimit = Math.max(activeIndex, maxClickableIndex);

  return (
    <nav className="fv-stepper" aria-label={ariaLabel} style={{ '--fv-step-count': stepCount }}>
      {steps.map((step, index) => {
        const isActive = index === activeIndex;
        const isDone = index < activeIndex;
        const isClickable = index <= clickableLimit;
        const stepNumber = getNum(step, index);

        return (
          <button
            key={getKey(step, index)}
            type="button"
            className={`fv-stepper-item${isActive ? ' active' : isDone ? ' done' : ' idle'}`}
            disabled={!isClickable}
            onClick={() => isClickable && onSelect(index)}
            aria-current={isActive ? 'step' : undefined}
          >
            <span className="fv-stepper-num" aria-hidden="true">
              {isDone ? <CheckOutlined className="fv-stepper-check" aria-hidden /> : stepNumber}
            </span>
            <span className="fv-stepper-label">{getLabel(step)}</span>
          </button>
        );
      })}
    </nav>
  );
}
