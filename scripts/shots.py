"""Screenshot + probe script for Amplop. Fresh page per shot, waits for
window.__shotReady, records console/page errors and failed/external
requests, and probes the 390px overflow + control behaviour on all routes.

Usage: python3 scripts/shots.py [--shots-only]
"""
import json
import subprocess
import sys
import time

from playwright.sync_api import sync_playwright

REPO = "/home/hatch/workspace/makefun/best-household-budget-site-20261126-entry"
CHROME = "/home/hatch/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome"
SHOTS = json.load(open(f"{REPO}/shots.json"))
ROUTES = ["#/", "#/envelopes", "#/accounts", "#/net-worth", "#/transactions"]

server = subprocess.Popen(
    ["node", "serve.ts", "--port", "8080"],
    cwd=REPO, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True,
)
time.sleep(1.5)
errors, failed, external = [], [], []

try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(
            executable_path=CHROME, headless=True,
            args=["--no-sandbox", "--disable-dev-shm-usage"],
        )
        ctx = browser.new_context(viewport={"width": 1280, "height": 800})
        page = ctx.new_page()
        page.on("console", lambda m: errors.append(f"console.{m.type}: {m.text}") if m.type == "error" else None)
        page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
        page.on("requestfailed", lambda r: failed.append(f"{r.url}: {r.failure}"))
        page.on("request", lambda r: external.append(r.url) if not r.url.startswith("http://localhost:8080") else None)

        # --- Screenshots: fresh page per shot ---
        for shot in SHOTS:
            p = browser.new_page(viewport=shot["viewport"])
            p.on("console", lambda m: errors.append(f"console.{m.type}: {m.text}") if m.type == "error" else None)
            p.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
            p.goto(f"http://localhost:8080/{shot['path']}", wait_until="load")
            try:
                p.wait_for_function("window.__shotReady === true", timeout=20000)
                ready = True
            except Exception as exc:
                ready = False
                errors.append(f"{shot['file']}: __shotReady timeout ({exc})")
            p.wait_for_timeout(400)
            p.screenshot(path=f"{REPO}/screenshots/{shot['file']}", type="jpeg", quality=88)
            print(f"SHOT {shot['file']}: ready={ready}")
            p.close()

        if "--shots-only" in sys.argv:
            browser.close()
            raise SystemExit(0)

        # --- Overflow probe: 390px on every route ---
        mob = browser.new_page(viewport={"width": 390, "height": 844})
        for r in ROUTES:
            mob.goto(f"http://localhost:8080/{r}", wait_until="load")
            mob.wait_for_function("window.__shotReady === true", timeout=20000)
            mob.wait_for_timeout(200)
            m = mob.evaluate("() => ({sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth})")
            print(f"OVERFLOW 390 {r}: scrollWidth={m['sw']} clientWidth={m['cw']} {'OK' if m['sw'] == m['cw'] == 390 else 'FAIL'}")
        # --- Interaction probes (fresh page, localStorage clean) ---
        page.goto("http://localhost:8080/#/envelopes", wait_until="load")
        page.wait_for_function("window.__shotReady === true", timeout=20000)
        page.evaluate("() => localStorage.clear()")
        page.reload(wait_until="load")
        page.wait_for_function("window.__shotReady === true", timeout=20000)
        # Move funds: Kitchen -> Snacks Rp100,000
        before = page.locator("text=Rp100.000 left").count()
        page.select_option('form[data-action="move-funds"] select[name="from"]', "kitchen")
        page.select_option('form[data-action="move-funds"] select[name="to"]', "snacks")
        page.fill('form[data-action="move-funds"] input[name="amount"]', "100000")
        page.click('form[data-action="move-funds"] button[type="submit"]')
        page.wait_for_function("window.__shotReady === true", timeout=20000)
        snacks = page.locator('.env-card', has_text='Snacks').inner_text()
        print("MOVE-FUNDS snacks card:", "Rp100.000" in snacks, "|", snacks.replace("\n", " | ")[:160])
        log = page.locator(".transfer-log").inner_text()
        print("MOVE-FUNDS log has 100000:", "Rp100.000" in log)
        # Reload persistence
        page.reload(wait_until="load")
        page.wait_for_function("window.__shotReady === true", timeout=20000)
        snacks2 = page.locator('.env-card', has_text='Snacks').inner_text()
        print("MOVE-FUNDS persists after reload:", "Rp100.000" in snacks2)
        page.evaluate("() => localStorage.clear()")
        # Add transaction on #/transactions
        page.goto("http://localhost:8080/#/transactions", wait_until="load")
        page.wait_for_function("window.__shotReady === true", timeout=20000)
        page.fill('form[data-action="add-tx"] input[name="merchant"]', "Probe Mart — test")
        page.fill('form[data-action="add-tx"] input[name="amount"]', "50000")
        page.click('form[data-action="add-tx"] button[type="submit"]')
        page.wait_for_function("window.__shotReady === true", timeout=20000)
        print("ADD-TX ledger shows probe:", page.locator("text=Probe Mart").count() > 0)
        # Filter: envelope=kitchen
        page.select_option('select[name="env"]', "kitchen")
        page.wait_for_timeout(300)
        print("FILTER kitchen rows text:", page.locator("h2", has_text="Ledger —").inner_text())
        page.select_option('select[name="env"]', "")
        page.wait_for_timeout(300)
        # Add account
        page.goto("http://localhost:8080/#/accounts", wait_until="load")
        page.wait_for_function("window.__shotReady === true", timeout=20000)
        page.fill('form[data-action="add-account"] input[name="name"]', "Probe Bank")
        page.fill('form[data-action="add-account"] input[name="balance"]', "123456")
        page.click('form[data-action="add-account"] button[type="submit"]')
        page.wait_for_function("window.__shotReady === true", timeout=20000)
        total = page.locator(".big-total").first.inner_text()
        print("ADD-ACCOUNT total now:", total.replace("\n", " ")[:80], "| expect Rp20.638.956:", "Rp20.638.956" in total)
        # Add asset on net worth
        page.goto("http://localhost:8080/#/net-worth", wait_until="load")
        page.wait_for_function("window.__shotReady === true", timeout=20000)
        page.fill('form[data-action="add-asset"] input[name="name"]', "Probe gold")
        page.fill('form[data-action="add-asset"] input[name="amount"]', "1000000")
        page.click('form[data-action="add-asset"] button[type="submit"]')
        page.wait_for_function("window.__shotReady === true", timeout=20000)
        nw = page.locator(".stat-value").first.inner_text()
        print("ADD-ASSET net worth now:", nw, "| expect Rp264.438.956 (263.315.500 + 123.456 account + 1.000.000 asset):", nw == "Rp264.438.956")
        # Reset
        page.evaluate("() => localStorage.clear()")
        browser.close()
finally:
    server.terminate()

print("ERRORS:", errors if errors else "none")
print("FAILED REQUESTS:", failed if failed else "none")
print("EXTERNAL REQUESTS:", external if external else "none")
