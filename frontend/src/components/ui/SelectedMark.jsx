import './SelectedMark.scss';

/** Shared selection indicator for all configurator option cards. */
export default function SelectedMark({ selected }) {
  return (
    <span className="card-check" aria-hidden={!selected}>
      {selected ? (
        <svg className="card-check-icon" viewBox="0 0 16 16" aria-hidden="true">
          <path
            fill="currentColor"
            d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"
          />
        </svg>
      ) : null}
    </span>
  );
}
