import { expect, test } from "@playwright/test";
import testData from "./fixtures/products.json" with { type: "json" };
import { API_BASE_URL, PACTICIPANT, PROVIDER } from "./pactOptions";
import { transformPlaywrightMatchToPact } from "./playwrightSerialiser";

const EXPECTED_PRODUCT_COUNT = 3;

test("products page with query", async ({ page }) => {
  await page.route(`${API_BASE_URL}/products?id=2`, async (route) => {
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

  await page.goto("/products?id=2");

  await expect(page.locator(".product-item")).toHaveCount(
    EXPECTED_PRODUCT_COUNT,
  );
});
