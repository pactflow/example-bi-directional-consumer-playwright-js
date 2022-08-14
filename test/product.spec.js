// @ts-check
const { test, expect } = require('@playwright/test')
const testData = require('./fixtures/product.json')
const { transformPlaywrightMatchToPact } = require('./playwrightSerialiser')

test('product page', async ({ page }) => {
  const productApiPath = process.env.REACT_APP_API_BASE_URL
    ? process.env.REACT_APP_API_BASE_URL
    : 'http://localhost:8080'

  await page.route(productApiPath + '/product/*', async (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify(testData),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const pacticipant = 'pactflow-example-bi-directional-consumer-playwright'
    const provider = process.env.PACT_PROVIDER || 'pactflow-example-bi-directional-provider-dredd'
    await transformPlaywrightMatchToPact(route, { pacticipant, provider })
    return
  })
  await page.goto('http://localhost:3000/products/09')

  expect(await page.locator('.product-id').textContent()).toBe('ID: 09')
  expect(await page.locator('.product-name').textContent()).toBe('Name: Gem Visa')
  expect(await page.locator('.product-type').textContent()).toBe('Type: CREDIT_CARD')
})
