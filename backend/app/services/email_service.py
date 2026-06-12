def send_verification_email(email: str, token: str):
    verification_link = f"http://localhost:8000/verify-email?token={token}"

    print("===================================")
    print(f"Verification email for: {email}")
    print(f"Click link: {verification_link}")
    print("===================================")