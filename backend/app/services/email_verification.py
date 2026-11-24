import json
import logging
from html import escape
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailDeliveryError(Exception):
    pass


def send_verification_email(email: str, full_name: str, token: str) -> None:
    if not settings.RESEND_API_KEY or not settings.EMAIL_FROM or not settings.FRONTEND_URL:
        raise EmailDeliveryError(
            "Email delivery is not configured. Set RESEND_API_KEY, EMAIL_FROM, and FRONTEND_URL."
        )

    verification_url = (
        f"{settings.FRONTEND_URL.rstrip('/')}/verify-email"
        f"?token={token}"
    )
    name = escape(full_name or "there")
    payload = json.dumps(
        {
            "from": settings.EMAIL_FROM,
            "to": [email],
            "subject": "Verify your CSE Hub email address",
            "html": (
                f"<p>Hello {name},</p>"
                "<p>Confirm your email address to activate your CSE Hub account.</p>"
                f'<p><a href="{escape(verification_url, quote=True)}">Verify my email</a></p>'
                "<p>This link expires in 24 hours. If you did not request this, ignore this email.</p>"
            ),
            "text": (
                f"Hello {full_name or 'there'},\n\n"
                "Verify your CSE Hub email address using this link:\n"
                f"{verification_url}\n\n"
                "This link expires in 24 hours."
            ),
        }
    ).encode("utf-8")
    request = Request(
        "https://api.resend.com/emails",
        data=payload,
        headers={
            "Authorization": f"Bearer {settings.RESEND_API_KEY}",
            "Content-Type": "application/json",
            "User-Agent": "CSE-Hub",
        },
        method="POST",
    )
    try:
        with urlopen(request, timeout=10) as response:
            if response.status < 200 or response.status >= 300:
                raise EmailDeliveryError(
                    f"Resend returned HTTP {response.status} while sending verification email."
                )
    except HTTPError as exc:
        logger.error("Resend rejected verification email with HTTP %s.", exc.code)
        raise EmailDeliveryError(
            f"Resend rejected the verification email (HTTP {exc.code}). Check sender-domain verification and API key."
        ) from exc
    except URLError as exc:
        logger.error("Could not reach Resend to send verification email: %s", exc.reason)
        raise EmailDeliveryError("Could not reach Resend. Check the mail service and try again.") from exc
    except TimeoutError as exc:
        logger.error("Resend verification email request timed out.")
        raise EmailDeliveryError("Resend did not respond in time. Please try again.") from exc
