import { CheckOutlined } from '@ant-design/icons';
import './SelectedMark.scss';

/** Shared selection indicator for all configurator option cards. */
export default function SelectedMark({ selected }) {
  return (
    <span className="card-check" aria-hidden={!selected}>
      {selected ? <CheckOutlined className="card-check-icon" aria-hidden /> : null}
    </span>
  );
}
