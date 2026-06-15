import smtplib
from email.message import EmailMessage

from app.core.config import (
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USERNAME,
    SMTP_PASSWORD,
    FROM_EMAIL,
    APP_URL,
)


def send_verification_email(email: str, token: str):
    verification_link = f"{APP_URL}/verify-email?token={token}"

    message = EmailMessage()
    message["Subject"] = "Potwierdź adres email"
    message["From"] = FROM_EMAIL
    message["To"] = email

    message.set_content(
        f"""
Cześć!

Kliknij link, aby potwierdzić adres email:

{verification_link}

Jeśli to nie Ty zakładałeś konto, zignoruj tę wiadomość.
"""
    )

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as smtp:
        smtp.starttls()
        smtp.login(SMTP_USERNAME, SMTP_PASSWORD)
        smtp.send_message(message)