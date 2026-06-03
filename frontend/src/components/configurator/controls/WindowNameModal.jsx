import { useEffect, useState } from 'react';
import { Input, Modal } from 'antd';
import { getWindowDefaultLabel } from '@/lib/configurator/windowLabel';
import './WindowNameModal.scss';

const NAME_MAX_LENGTH = 48;

export default function WindowNameModal({
  open,
  onClose,
  index,
  currentName = '',
  onConfirm
}) {
  const defaultLabel = getWindowDefaultLabel(index);
  const [nameDraft, setNameDraft] = useState(currentName);

  useEffect(() => {
    if (open) {
      setNameDraft(currentName);
    }
  }, [open, currentName]);

  function handleConfirm() {
    onConfirm(nameDraft.trim());
    onClose();
  }

  function handleNameChange(event) {
    setNameDraft(event.target.value.slice(0, NAME_MAX_LENGTH));
  }

  return (
    <Modal
      className="fv-name-modal"
      title="Fenster benennen"
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
      <p className="fv-name-modal-lead">
        Geben Sie einen Namen fuer <strong>{defaultLabel}</strong> ein (z.&nbsp;B. Wohnzimmer, Kueche Nord).
      </p>
      <Input
        value={nameDraft}
        onChange={handleNameChange}
        placeholder={defaultLabel}
        maxLength={NAME_MAX_LENGTH}
        aria-label="Fenstername"
        autoFocus
        onPressEnter={handleConfirm}
      />
      <p className="fv-name-modal-hint">Leer lassen, um den Standardnamen zu verwenden.</p>
    </Modal>
  );
}
