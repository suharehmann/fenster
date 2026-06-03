import { useState } from 'react';
import { MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Alert, Button, Form, Input } from 'antd';
import { submitContact } from '@/api/client';
import './ContactPage.scss';

const { TextArea } = Input;

const FORM_STATUS = {
  idle: 'idle',
  loading: 'loading',
  done: 'done',
  error: 'error'
};

const NAME_RULES = [{ required: true, message: 'Bitte Name eingeben' }];

const EMAIL_RULES = [
  { required: true, message: 'Bitte E-Mail eingeben' },
  { type: 'email', message: 'Ungueltige E-Mail' }
];

const MESSAGE_RULES = [{ required: true, message: 'Bitte Nachricht eingeben' }];

export default function ContactPage() {
  const [form] = Form.useForm();
  const [formStatus, setFormStatus] = useState(FORM_STATUS.idle);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleFormSubmit(values) {
    setFormStatus(FORM_STATUS.loading);
    setErrorMessage('');

    try {
      await submitContact(values);
      setFormStatus(FORM_STATUS.done);
      form.resetFields();
    } catch (requestError) {
      setFormStatus(FORM_STATUS.error);
      setErrorMessage(requestError.message);
    }
  }

  const isSubmitting = formStatus === FORM_STATUS.loading;
  const showSuccessMessage = formStatus === FORM_STATUS.done;
  const showErrorMessage = formStatus === FORM_STATUS.error;

  return (
    <section className="page page--content page--contact">
      <header className="page-hero">
        <p className="page-hero__eyebrow">Kontakt</p>
        <h1>Wir beraten Sie persoenlich zu Ihrem Fensterprojekt</h1>
        <p className="page-hero__lead">
          Senden Sie uns Ihre Anfrage — wir melden uns in der Regel innerhalb eines Werktags mit den
          naechsten Schritten.
        </p>
      </header>

      <div className="contact-layout">
        <div className="content-card contact-form-card">
          <Form
            form={form}
            className="form-grid contact-form"
            layout="vertical"
            requiredMark={false}
            onFinish={handleFormSubmit}
          >
            <Form.Item label="Name" name="name" rules={NAME_RULES}>
              <Input autoComplete="name" placeholder="Vor- und Nachname" />
            </Form.Item>
            <Form.Item label="E-Mail" name="email" rules={EMAIL_RULES}>
              <Input type="email" autoComplete="email" placeholder="name@beispiel.de" />
            </Form.Item>
            <Form.Item label="Telefon" name="phone">
              <Input type="tel" autoComplete="tel" placeholder="+49 ..." />
            </Form.Item>
            <Form.Item label="Nachricht" name="message" rules={MESSAGE_RULES}>
              <TextArea rows={5} placeholder="Beschreiben Sie kurz Ihr Projekt oder Ihre Fragen." />
            </Form.Item>
            <Form.Item className="form-actions">
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                Nachricht senden
              </Button>
            </Form.Item>
            {showSuccessMessage && (
              <Alert type="success" showIcon message="Vielen Dank. Wir melden uns zeitnah." />
            )}
            {showErrorMessage && <Alert type="error" showIcon message={errorMessage} />}
          </Form>
        </div>

        <aside className="content-card contact-info-card">
          <h2>Unternehmensdaten</h2>
          <ul className="contact-info-list">
            <li>
              <strong>Adresse</strong>
              <span>
                <EnvironmentOutlined aria-hidden /> FensterWerk GmbH, Musterstrasse 12, 50667 Koeln
              </span>
            </li>
            <li>
              <strong>Telefon</strong>
              <a href="tel:+49221555123">
                <PhoneOutlined aria-hidden /> +49 221 555 123
              </a>
            </li>
            <li>
              <strong>E-Mail</strong>
              <a href="mailto:info@fensterwerk.de">
                <MailOutlined aria-hidden /> info@fensterwerk.de
              </a>
            </li>
          </ul>
          <p className="contact-hours">
            Erreichbarkeit: Mo–Fr 08:00–18:00 Uhr. Konfigurator-Anfragen werden priorisiert bearbeitet.
          </p>
        </aside>
      </div>
    </section>
  );
}
