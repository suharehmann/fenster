import { InfoCircleOutlined } from '@ant-design/icons';
import './ConfigSection.scss';

/** Section block used in configurator wizard steps (studio-embedded). */
export default function ConfigSection({ title, sectionId, children }) {
  return (
    <section className="section-block" id={sectionId}>
      <div className="section-head">
        <h3>{title}</h3>
        <button type="button" className="details-link">
          <InfoCircleOutlined aria-hidden /> mehr Details
        </button>
      </div>
      <div className="section-content">{children}</div>
    </section>
  );
}
