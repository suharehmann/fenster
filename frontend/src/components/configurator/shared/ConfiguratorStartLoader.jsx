import { Spin } from 'antd';
import './ConfiguratorStartLoader.scss';

export default function ConfiguratorStartLoader({
  message = 'Konfiguration wird vorbereitet...'
}) {
  return (
    <div
      className="configurator-start-loader"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Spin size="large" />
      <p className="configurator-start-loader__text">{message}</p>
    </div>
  );
}
