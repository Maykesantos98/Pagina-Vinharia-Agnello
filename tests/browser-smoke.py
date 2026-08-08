from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(
        headless=True,
        executable_path=r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    )
    for name, width, height in (("desktop", 1440, 1000), ("mobile", 390, 844)):
        page = browser.new_page(viewport={"width": width, "height": height})
        errors = []
        page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
        page.goto("http://127.0.0.1:4173", wait_until="networkidle")
        assert page.locator("h1").inner_text().startswith("O tempo revela")
        assert page.locator(".wine-card").count() == 3
        page.get_by_role("button", name="Adicionar").first.click()
        assert page.locator("#cart-count").inner_text() == "1"
        assert "adicionado" in page.locator(".toast").inner_text()
        if name == "mobile":
            page.get_by_role("button", name="Abrir menu").click()
            assert page.locator(".menu").get_attribute("class") == "menu open"
            page.get_by_role("button", name="Fechar menu").click()
            assert page.locator(".menu").get_attribute("class") == "menu"
        page.wait_for_timeout(3200)
        page.screenshot(path=str(ROOT / f"{name}-preview.png"), full_page=True)
        assert not errors, errors
        page.close()
    browser.close()
