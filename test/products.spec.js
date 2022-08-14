// @ts-check
const { test, expect } = require('@playwright/test')
const testData = require('./fixtures/products.json')
const { transformPlaywrightMatchToPact } = require('./playwrightSerialiser')

test('products page', async ({ page }) => {
  const productApiPath = process.env.REACT_APP_API_BASE_URL
    ? process.env.REACT_APP_API_BASE_URL
    : 'http://localhost:8080'

  await page.route(productApiPath + '/products', async (route) => {
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
  await page.goto('http://localhost:3000/products')

  const products = page.locator('.product-item')

  expect(await products.count()).toBe(3)
})
