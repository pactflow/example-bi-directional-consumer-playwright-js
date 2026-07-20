import { expect, test } from "@playwright/test";
import testData from "./fixtures/product.json" with { type: "json" };
import { API_BASE_URL, PACTICIPANT, PROVIDER } from "./pactOptions";
import { transformPlaywrightMatchToPact } from "./playwrightSerialiser";

test("product page", async ({ page }) => {
  await page.route(`${API_BASE_URL}/product/*`, async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify(testData),
      headers: { "Content-Type": "application/json" },
    });
    await transformPlaywrightMatchToPact(route, {
      pacticipant: PACTICIPANT,
      provider: PROVIDER,
    });
  });

  await page.goto("/products/09");

  await expect(page.locator(".product-id")).toHaveText("ID: 09");
  await expect(page.locator(".product-name")).toHaveText("Name: Gem Visa");
  await expect(page.locator(".product-type")).toHaveText("Type: CREDIT_CARD");
});
