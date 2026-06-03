import './OptionGrid.scss';
import OptionCard from './OptionCard';

export default function OptionGrid({ options, selected, onSelect, columns = 3, cardClassName = 'select-card' }) {
  return (
    <div
      className="selection-grid"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const id = option.id ?? option;
        return (
          <OptionCard
            key={id}
            option={option}
            selected={selected}
            onSelect={onSelect}
            className={cardClassName}
          />
        );
      })}
    </div>
  );
}
