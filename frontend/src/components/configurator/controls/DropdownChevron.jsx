import { CaretDownOutlined } from '@ant-design/icons';

export default function DropdownChevron({ isOpen = false, className = '' }) {
  const stateClass = isOpen ? ' is-open' : '';

  return (
    <CaretDownOutlined
      className={`fv-dropdown-chevron${stateClass}${className ? ` ${className}` : ''}`}
      aria-hidden
    />
  );
}
