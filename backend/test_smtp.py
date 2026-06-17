import smtplib
import sys

# Read credentials from .env
MAIL_HOST = "smtp.gmail.com"
MAIL_PORT = 587
MAIL_USERNAME = "shailavisrivastava977@gmail.com"
MAIL_PASSWORD = "jcgtvfrieisllidj"

print(f"Testing SMTP connection to {MAIL_HOST}:{MAIL_PORT}")
print(f"Username: {MAIL_USERNAME}")
print(f"Password: {'*' * len(MAIL_PASSWORD)} ({len(MAIL_PASSWORD)} chars)")

try:
    print("\n[1] Connecting to SMTP server...")
    server = smtplib.SMTP(MAIL_HOST, MAIL_PORT, timeout=15)
    print("    ✅ Connected successfully")

    print("[2] Starting TLS...")
    server.starttls()
    print("    ✅ TLS started")

    print("[3] Authenticating...")
    server.login(MAIL_USERNAME, MAIL_PASSWORD)
    print("    ✅ Authentication successful!")

    print("[4] Sending test OTP email...")
    subject = "Cyvanta Cashback - Test OTP"
    body = "Your test OTP code is: 123456\n\nThis is a test email to verify SMTP configuration."
    message = f"From: {MAIL_USERNAME}\r\nTo: {MAIL_USERNAME}\r\nSubject: {subject}\r\n\r\n{body}"
    server.sendmail(MAIL_USERNAME, MAIL_USERNAME, message)
    print("    ✅ Email sent successfully!")

    server.quit()
    print("\n🎉 SMTP is working! Check your inbox for the test email.")

except smtplib.SMTPAuthenticationError as e:
    print(f"\n    ❌ Authentication FAILED: {e}")
    print("\n    This means the App Password is INVALID or REVOKED.")
    print("    Fix: Go to https://myaccount.google.com/apppasswords")
    print("          → Generate a NEW App Password → Update .env")

except smtplib.SMTPConnectError as e:
    print(f"\n    ❌ Connection FAILED: {e}")
    print("    Port 587 might be blocked on this network.")

except Exception as e:
    print(f"\n    ❌ Error: {type(e).__name__}: {e}")
