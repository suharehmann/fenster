import { useEffect, useState } from 'react';
import { Modal } from 'antd';
import {
  QUANTITY_MAX,
  QUANTITY_MIN,
  QUANTITY_PRESETS,
  clampQuantity
} from '@/lib/configurator/quantity';
import './WindowQuantityModal.scss';

export default function WindowQuantityModal({
  open,
  onClose,
  quantity,
  productType = 'window',
  itemLabel = 'Fenster',
  onConfirm
}) {
  const [quantityDraft, setQuantityDraft] = useState(clampQuantity(quantity));

  useEffect(() => {
    if (open) {
      setQuantityDraft(clampQuantity(quantity));
    }
  }, [open, quantity]);

  const isWindowProduct = productType === 'window';
  const modalTitle = isWindowProduct ? 'Anzahl Fenster' : `Anzahl ${itemLabel}`;
  const leadText = isWindowProduct
    ? 'Wie viele Fenster moechten Sie konfigurieren?'
    : `Wie viele ${itemLabel} moechten Sie konfigurieren?`;

  function handleQuantityChange(nextValue) {
    setQuantityDraft(clampQuantity(nextValue));
  }

  function handleDecrease() {
    handleQuantityChange(quantityDraft - 1);
  }

  function handleIncrease() {
    handleQuantityChange(quantityDraft + 1);
  }

  function handleInputChange(event) {
    handleQuantityChange(event.target.value);
  }

  function handleConfirm() {
    onConfirm(quantityDraft);
    onClose();
  }

  return (
    <Modal
      className="fv-quantity-modal"
      title={modalTitle}
      open={open}
      centered
      width={440}
      okText="Uebernehmen"
      cancelText="Abbrechen"
      onOk={handleConfirm}
      onCancel={onClose}
      destroyOnHidden
      mask={{ closable: true }}
      getContainer={() => document.body}
    >
      <p className="fv-quantity-modal-lead">{leadText}</p>
      <div className="fv-quantity-picker">
        <button
          type="button"
          className="fv-quantity-step"
          onClick={handleDecrease}
          disabled={quantityDraft <= QUANTITY_MIN}
          aria-label="Weniger"
        >
          −
        </button>
        <input
          type="number"
          min={QUANTITY_MIN}
          max={QUANTITY_MAX}
          value={quantityDraft}
          onChange={handleInputChange}
          aria-label="Anzahl"
        />
        <button
          type="button"
          className="fv-quantity-step"
          onClick={handleIncrease}
          disabled={quantityDraft >= QUANTITY_MAX}
          aria-label="Mehr"
        >
          +
        </button>
      </div>
      <div className="fv-quantity-presets">
        {QUANTITY_PRESETS.map((presetValue) => (
          <button
            key={presetValue}
            type="button"
            className={quantityDraft === presetValue ? 'is-selected' : ''}
            onClick={() => handleQuantityChange(presetValue)}
          >
            {presetValue}
          </button>
        ))}
      </div>
    </Modal>
  );
}
