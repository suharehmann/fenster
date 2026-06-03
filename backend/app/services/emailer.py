from email.message import EmailMessage
import smtplib
from app.core.config import get_settings


def send_admin_mail(subject: str, body: str) -> None:
    settings = get_settings()
    if not settings.smtp_host:
        return

    message = EmailMessage()
    message['Subject'] = subject
    message['From'] = settings.smtp_from
    message['To'] = settings.admin_email
    message.set_content(body)

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as smtp:
        if settings.smtp_use_tls:
            smtp.starttls()
        if settings.smtp_user:
            smtp.login(settings.smtp_user, settings.smtp_password)
        smtp.send_message(message)
