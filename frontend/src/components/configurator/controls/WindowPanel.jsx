import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import WindowSelectDropdown from './WindowSelectDropdown';
import { getWindowDisplayName } from '@/lib/configurator/windowLabel';

export default function WindowPanel({
  windows,
  slotCount,
  activeIndex,
  material,
  onSelect,
  onEnsureSlot,
  onEditQuantity,
  onEditName,
  onDeleteWindow,
  canDeleteWindow,
  formatSummary,
  formatDetail,
  formatListSubtitle
}) {
  const totalSlots = Math.max(slotCount ?? windows.length, 1);

  function renderWindowItemActions(index, label, { onEdit, showDelete = true }) {
    return (
      <div className="fv-window-item-actions">
        <button type="button" className="fv-window-item-edit" onClick={onEdit} aria-label={`${label} umbenennen`}>
          <EditOutlined className="fv-edit-icon" aria-hidden />
        </button>
        {showDelete ? (
          <button
            type="button"
            className="fv-window-item-delete"
            onClick={() => onDeleteWindow(index)}
            disabled={!canDeleteWindow}
            aria-label={`${label} entfernen`}
          >
            <DeleteOutlined className="fv-edit-icon" aria-hidden />
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="fv-window-panel">
      <div className="fv-window-panel-head">
        <div className="fv-window-panel-title-row">
          <h2>Ihre Fenster</h2>
          <span className="fv-window-select-hint">Fenster waehlen</span>
        </div>
        <div className="fv-window-panel-actions">
          <span className="fv-window-count">{totalSlots}</span>
          <button
            type="button"
            className="fv-window-edit"
            onClick={onEditQuantity}
            aria-haspopup="dialog"
            aria-label="Anzahl Fenster bearbeiten"
          >
            <EditOutlined className="fv-edit-icon" aria-hidden />
            Bearbeiten
          </button>
        </div>
      </div>
      <div className="fv-window-select-wrap">
        <WindowSelectDropdown
          windows={windows}
          activeIndex={activeIndex}
          material={material}
          onSelect={onSelect}
          formatSummary={formatSummary}
          formatDetail={formatDetail}
        />
      </div>
      <div className="fv-window-list">
        {Array.from({ length: totalSlots }, (_, index) => {
          const win = windows[index];
          if (!win) {
            return (
              <div key={`window-slot-empty-${index}`} className="fv-window-item-row">
                <button
                  type="button"
                  className="fv-window-item fv-window-item--empty"
                  onClick={() => onEnsureSlot(index)}
                >
                  <span className="fv-window-num">{index + 1}</span>
                  <span className="fv-window-item-text">
                    <strong>Fenster {index + 1}</strong>
                    <span>Leer — zum Konfigurieren waehlen</span>
                  </span>
                </button>
                {renderWindowItemActions(index, `Fenster ${index + 1}`, {
                  onEdit: () => {
                    onEnsureSlot(index);
                    onEditName(index);
                  }
                })}
              </div>
            );
          }
          const label = getWindowDisplayName(win, index);
          return (
            <div key={win.id} className={`fv-window-item-row ${activeIndex === index ? 'active' : ''}`}>
              <button
                type="button"
                className={`fv-window-item ${activeIndex === index ? 'active' : ''}`}
                onClick={() => onSelect(index)}
              >
                <span className="fv-window-num">{index + 1}</span>
                <span className="fv-window-item-text">
                  <strong>{label}</strong>
                  <span>{formatListSubtitle(win, material)}</span>
                </span>
              </button>
              {renderWindowItemActions(index, label, {
                onEdit: () => onEditName(index)
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
