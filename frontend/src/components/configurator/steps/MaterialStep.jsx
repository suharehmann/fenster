import MaterialSelectionStudio from '../studio/MaterialSelectionStudio';

export default function MaterialStep({ selected, onSelect }) {
  return <MaterialSelectionStudio selected={selected} onSelect={onSelect} />;
}
