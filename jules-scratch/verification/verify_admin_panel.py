import re
import json
import base64
from playwright.sync_api import sync_playwright, expect, TimeoutError

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Listen for console messages
    page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

    try:
        # Create a fake JWT with ADMIN role
        header = base64.urlsafe_b64encode(json.dumps({"alg": "none", "typ": "JWT"}).encode()).decode().rstrip("=")
        payload = base64.urlsafe_b64encode(json.dumps({"sub": "e2e-admin", "roles": ["ADMIN"], "exp": 9999999999}).encode()).decode().rstrip("=")
        fake_jwt = f"{header}.{payload}."

        # Mock the permissions API call
        page.route("**/iam/api/v1/permissions", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps([
                {"id": 1, "name": "iam:permission:create", "description": "Create IAM permissions"},
                {"id": 2, "name": "iam:permission:read", "description": "Read IAM permissions"},
                {"id": 3, "name": "iam:permission:update", "description": "Update IAM permissions"},
                {"id": 4, "name": "product:product:read", "description": "Read Product permissions"}
            ])
        ))

        # Mock the refresh token API call
        page.route("**/auth/api/v1/refresh", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps({"accessToken": fake_jwt})
        ))

        print("Navigating to login page...")
        page.goto("http://localhost:5176/login", timeout=60000)
        print("Login page loaded.")

        print("Setting access token...")
        page.evaluate(f"window.__setAccessToken?.('{fake_jwt}')")
        print("Access token set.")

        print("Waiting for auth state to be updated...")
        page.wait_for_function("window.__hasToken === true", timeout=60000)
        print("Auth state updated.")

        print("Navigating to admin permissions page...")
        page.goto("http://localhost:5176/admin/permissions", timeout=60000)
        print("Admin permissions page loaded.")

        print("Waiting for heading to be visible...")
        expect(page.get_by_role("heading", name="Manage Permissions")).to_be_visible(timeout=60000)
        print("Heading is visible.")

        print("Taking screenshot...")
        page.screenshot(path="jules-scratch/verification/verification.png")
        print("Screenshot taken.")

    except TimeoutError as e:
        print(f"Script timed out: {e}")
        page.screenshot(path="jules-scratch/verification/timeout_error.png")
    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
